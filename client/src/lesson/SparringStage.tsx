// Sparring: partida completa contra Stockfish desde la posición inicial. Mientras la
// posición esté en el repertorio del curso, el rival juega una de las respuestas del libro
// y el alumno ve si sigue su repertorio. Fuera del libro juega Stockfish con el nivel
// elegido (5 niveles). Al terminar se registra el resultado y, la primera vez, la etapa.
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Chess } from 'chess.js';
import { START_FEN, positionKey, stageKey, buildRepertoire, type Course, type SparringStage as SparringStageDef } from '@chessblizzard/shared';
import { checkSquare, gameEnd, legalDests, playOne, tryMove, type GameEnd, type PlayedMove } from '../board';
import { EvalBar, analysisScore, getEngine, useAnalysis, type PlayOptions } from '../engine';
import { useNotation, useT, useTx } from '../i18n';
import { useProgress } from '../state/progress';
import { BoardArea } from './BoardArea';
import { moveSound, useSound } from './hooks';
import { campOf, moveLabel, stageLines } from './lessonData';
import { Feedback, LessonShell, PanelHeader, Section } from './Shell';
import { Button, Icon, MoveChip, MoveList } from './ui';

export interface SparringLevel {
  id: number;
  key: string;
  /** Elo aproximado que se muestra. */
  rating: number;
  options: PlayOptions;
}

export const SPARRING_LEVELS: SparringLevel[] = [
  { id: 1, key: 'beginner', rating: 800, options: { skill: 0, depth: 1, movetime: 80 } },
  { id: 2, key: 'casual', rating: 1100, options: { skill: 3, depth: 5, movetime: 200 } },
  { id: 3, key: 'club', rating: 1500, options: { elo: 1500, movetime: 350 } },
  { id: 4, key: 'advanced', rating: 1900, options: { elo: 1900, movetime: 600 } },
  { id: 5, key: 'expert', rating: 2600, options: { skill: 20, movetime: 1000 } },
];

const LEVEL_KEY = 'cb.sparring.level';
const EVAL_KEY = 'cb.sparring.eval';

function loadPref<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

function savePref(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Sin almacenamiento: la preferencia dura lo que la pestaña.
  }
}

type Phase = 'setup' | 'playing' | 'over';
type Result = 'win' | 'draw' | 'loss';

interface BookEvent {
  ply: number;
  kind: 'followed' | 'deviated' | 'left';
  expected?: string;
  played: string;
  moveNumber: number;
  color: 'w' | 'b';
}

export function SparringStage({ course, stage, onExit }: { course: Course; stage: SparringStageDef; onExit: () => void }) {
  const t = useT();
  const tx = useTx();
  const notation = useNotation();
  const { state, record } = useProgress();
  const sound = useSound();
  const user = course.side;
  const rival = user === 'w' ? 'b' : 'w';
  const camp = campOf(course, stage.id);

  // Repertorio solo con las líneas de la etapa (si las enumera).
  const rep = useMemo(() => {
    const lines = stageLines(course, stage);
    return buildRepertoire(lines.length ? { ...course, lines } : course);
  }, [course, stage]);

  const [phase, setPhase] = useState<Phase>('setup');
  const [levelId, setLevelId] = useState<number>(() => {
    const v = loadPref<number>(LEVEL_KEY, 2);
    return SPARRING_LEVELS.some((l) => l.id === v) ? v : 2;
  });
  const [evalOn, setEvalOn] = useState<boolean>(() => loadPref<boolean>(EVAL_KEY, false));
  const [moves, setMoves] = useState<PlayedMove[]>([]);
  const [thinking, setThinking] = useState(false);
  const [events, setEvents] = useState<BookEvent[]>([]);
  const [result, setResult] = useState<{ result: Result; reason: GameEnd | 'resign' } | null>(null);
  const [xp, setXp] = useState(0);
  const [confirmResign, setConfirmResign] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [engineError, setEngineError] = useState(false);
  const [games, setGames] = useState(0);
  const recorded = useRef(false);

  const level = SPARRING_LEVELS.find((l) => l.id === levelId) ?? SPARRING_LEVELS[1];
  const fen = moves.length ? moves[moves.length - 1].fenAfter : START_FEN;
  const turn = fen.split(' ')[1] as 'w' | 'b';
  const inBook = rep.nodes.has(positionKey(fen));
  const lastMove = moves.length ? ([moves[moves.length - 1].from, moves[moves.length - 1].to] as [string, string]) : null;
  const analysis = useAnalysis(phase !== 'setup' && evalOn ? fen : null, { depth: 14 });

  useEffect(() => savePref(LEVEL_KEY, levelId), [levelId]);
  useEffect(() => savePref(EVAL_KEY, evalOn), [evalOn]);

  const endGame = (res: Result, reason: GameEnd | 'resign') => {
    setResult({ result: res, reason });
    setPhase('over');
    setThinking(false);
    if (recorded.current) return;
    recorded.current = true;
    let gained = record({ type: 'sparring_result', course: course.id, result: res }) || 0;
    if (!state.stages[stageKey(course.id, stage.id)]) gained += record({ type: 'stage_complete', course: course.id, stage: stage.id }) || 0;
    setXp((x) => x + gained);
    sound(res === 'win' ? 'complete' : 'move');
  };

  /** Aplica una jugada y comprueba si la partida ha terminado. */
  const apply = (m: PlayedMove, history: PlayedMove[]) => {
    const next = [...history, m];
    setMoves(next);
    sound(moveSound(m.san));
    const chess = new Chess();
    for (const mv of next) chess.move(mv.san);
    const end = gameEnd(chess);
    if (end) {
      if (end === 'checkmate') endGame(chess.turn() === user ? 'loss' : 'win', end);
      else endGame('draw', end);
    }
    return next;
  };

  // Turno del rival: libro si se puede; si no, Stockfish con el nivel elegido.
  useEffect(() => {
    if (phase !== 'playing' || turn === user) return;
    let alive = true;
    const started = Date.now();
    const node = rep.nodes.get(positionKey(fen));
    setThinking(true);
    if (node && node.opponent.length) {
      const san = node.opponent[Math.floor(Math.random() * node.opponent.length)];
      const id = setTimeout(() => {
        if (!alive) return;
        const m = playOne(fen, san);
        setThinking(false);
        if (m) apply(m, moves);
      }, 650);
      return () => {
        alive = false;
        clearTimeout(id);
      };
    }
    const task = getEngine().play(fen, level.options);
    let timer: ReturnType<typeof setTimeout> | undefined;
    task.promise.then(
      (uci) => {
        if (!alive) return;
        const wait = Math.max(0, 450 - (Date.now() - started));
        timer = setTimeout(() => {
          if (!alive) return;
          setThinking(false);
          const m = uci ? playOne(fen, uci) : null;
          if (m) apply(m, moves);
          else setEngineError(true);
        }, wait);
      },
      () => {
        if (!alive) return;
        setThinking(false);
        setEngineError(true);
      },
    );
    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
      task.cancel();
    };
  }, [phase, fen, turn]); // eslint-disable-line react-hooks/exhaustive-deps

  const onMove = (from: string, to: string, promotion?: string) => {
    if (phase !== 'playing' || turn !== user) return;
    const m = tryMove(fen, from, to, promotion);
    if (!m) return;
    const node = rep.nodes.get(positionKey(fen));
    if (node?.user) {
      const ev: BookEvent = {
        ply: moves.length,
        kind: m.san === node.user ? 'followed' : 'deviated',
        expected: node.user,
        played: m.san,
        moveNumber: m.moveNumber,
        color: m.color,
      };
      setEvents((e) => [...e, ev]);
      if (ev.kind === 'deviated') sound('wrong');
    }
    setConfirmResign(false);
    apply(m, moves);
  };

  const start = () => {
    setMoves([]);
    setEvents([]);
    setResult(null);
    setConfirmResign(false);
    setEngineError(false);
    recorded.current = false;
    setGames((g) => g + 1);
    setPhase('playing');
    void getEngine()
      .warmUp()
      .catch(() => setEngineError(true));
  };

  const followed = events.filter((e) => e.kind === 'followed').length;
  const deviations = events.filter((e) => e.kind === 'deviated');
  const lastEvent = events[events.length - 1];
  const bookEnd = (() => {
    // Primera posición fuera del libro (para "Fuera del libro desde ...").
    for (let i = 0; i < moves.length; i++) if (!rep.nodes.has(positionKey(moves[i].fenAfter))) return moves[i];
    return null;
  })();

  const sideName = (c: 'w' | 'b') => t(c === 'w' ? 'lesson.white' : 'lesson.black');
  const kicker = `${tx(course.name)} · ${camp ? tx(camp.name) : ''}`;
  const progress = {
    label: `${tx(course.name)} · ${tx(stage.title)}`,
    right: phase === 'setup' ? t('lesson.sparring.setupShort') : t('lesson.sparring.moveN', { n: Math.ceil(moves.length / 2) }),
    value: phase === 'over' ? 1 : phase === 'setup' ? 0 : Math.min(0.95, moves.length / 80),
  };
  const levelName = t(`lesson.sparring.level.${level.key}`);
  const orientation = (user === 'w') !== flipped ? 'white' : 'black';

  const board = {
    fen,
    orientation: orientation as 'white' | 'black',
    movable: phase === 'playing' && turn === user ? { color: user, dests: legalDests(fen) } : null,
    onMove,
    lastMove,
    check: checkSquare(fen),
    ariaLabel: t('lesson.board.sparringLabel', { side: sideName(user) }),
  };
  const players = {
    [user]: { name: t('lesson.you', { side: sideName(user) }), note: phase === 'playing' && turn === user ? <span className="cb-turn">{t('lesson.practice.yourTurn')}</span> : undefined },
    [rival]: {
      name: `Stockfish · ${levelName}`,
      note: thinking ? <span className="cb-thinking-note">{t('lesson.sparring.thinking')}</span> : inBook && phase === 'playing' ? t('lesson.bookMoves') : undefined,
    },
  } as Record<'w' | 'b', { name: string; note?: ReactNode }>;

  if (phase === 'setup') {
    return (
      <LessonShell onExit={onExit} progress={progress} xp={xp}>
        <BoardArea board={{ ...board, movable: null }} players={players} onFlip={() => setFlipped((f) => !f)} />
        <aside className="cb-panel" aria-label={t('lesson.panel.sparring')}>
          <PanelHeader kicker={kicker} title={tx(stage.title)}>
            <p className="cb-panel-sub">{tx(stage.intro)}</p>
          </PanelHeader>
          <div className="cb-section">
            <h2 className="cb-label" id="cb-level-label">
              {t('lesson.sparring.chooseLevel')}
            </h2>
            <div className="cb-levels" role="radiogroup" aria-labelledby="cb-level-label">
              {SPARRING_LEVELS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  role="radio"
                  aria-checked={l.id === levelId}
                  className={`cb-level${l.id === levelId ? ' cb-level-on' : ''}`}
                  onClick={() => setLevelId(l.id)}
                >
                  <span className="cb-level-bars" aria-hidden="true">
                    {[1, 2, 3, 4, 5].map((b) => (
                      <i key={b} className={b <= l.id ? 'cb-level-bar-on' : undefined} />
                    ))}
                  </span>
                  <span className="cb-level-name">{t(`lesson.sparring.level.${l.key}`)}</span>
                  <span className="cb-level-elo">≈ {l.rating}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="cb-section">
            <label className="cb-switch">
              <input type="checkbox" checked={evalOn} onChange={(e) => setEvalOn(e.target.checked)} />
              <span className="cb-switch-track" aria-hidden="true" />
              <span>{t('lesson.sparring.evalBar')}</span>
            </label>
            <p className="cb-text cb-text-2">{t('lesson.sparring.bookExplain')}</p>
          </div>
          <div className="cb-panel-foot">
            <Button variant="primary" block icon="swords" onClick={start}>
              {t('lesson.sparring.start')}
            </Button>
          </div>
        </aside>
      </LessonShell>
    );
  }

  let feedback: ReactNode = null;
  if (phase === 'over' && result) {
    const title = t(`lesson.sparring.result.${result.result}`);
    feedback = (
      <Feedback
        tone={result.result === 'win' ? 'ok' : result.result === 'draw' ? 'info' : 'err'}
        icon={result.result === 'win' ? 'trophy' : result.result === 'draw' ? 'flag' : 'flag'}
        mood={result.result === 'win' ? 'happy' : result.result === 'draw' ? 'thinking' : 'sad'}
        title={title}
        xp={xp}
        action={{ label: t('lesson.sparring.again'), onClick: start }}
        secondary={
          <Button variant="ghost" onClick={onExit}>
            {t('lesson.complete.back')}
          </Button>
        }
      >
        <p>{t(`lesson.sparring.reason.${result.reason}`)}</p>
        <p className="cb-feedback-sub">
          {events.length
            ? t('lesson.sparring.bookScore', { k: followed, n: events.length })
            : t('lesson.sparring.noBook')}
        </p>
      </Feedback>
    );
  }

  return (
    <LessonShell onExit={onExit} progress={progress} xp={xp}>
      <BoardArea
        board={board}
        players={players}
        onFlip={() => setFlipped((f) => !f)}
        evalBar={evalOn ? <EvalBar score={analysisScore(analysis)} orientation={orientation} thinking={analysis.running} /> : undefined}
      />
      <aside className="cb-panel" aria-label={t('lesson.panel.sparring')}>
        <PanelHeader kicker={kicker} title={tx(stage.title)}>
          <p className="cb-panel-sub">
            {t('lesson.sparring.vs', { level: levelName, n: level.rating })}
            {games > 1 ? ` · ${t('lesson.sparring.gameN', { n: games })}` : ''}
          </p>
        </PanelHeader>
        <Section label={t('lesson.sparring.book')} className="cb-status">
          {inBook && !bookEnd ? (
            <p className="cb-prompt">
              <Icon name="book" size={18} /> {t('lesson.sparring.inBook')}
            </p>
          ) : bookEnd ? (
            <p className="cb-prompt">
              {t('lesson.sparring.outOfBook', { move: moveLabel(bookEnd, notation) })}
            </p>
          ) : (
            <p className="cb-prompt">{t('lesson.sparring.inBook')}</p>
          )}
          {lastEvent?.kind === 'followed' && lastEvent.ply === moves.length - 1 && (
            <p className="cb-book-ok">
              <Icon name="check" size={16} stroke={3} /> {t('lesson.sparring.followed', { move: moveLabel({ moveNumber: lastEvent.moveNumber, color: lastEvent.color, san: lastEvent.played }, notation) })}
            </p>
          )}
          {deviations.map((d) => (
            <p key={d.ply} className="cb-book-dev">
              <Icon name="cross" size={16} stroke={3} />{' '}
              <span>
                {t('lesson.sparring.deviated')} <MoveChip text={moveLabel({ moveNumber: d.moveNumber, color: d.color, san: d.played }, notation)} tone="err" />{' '}
                {t('lesson.sparring.expected')} <MoveChip text={moveLabel({ moveNumber: d.moveNumber, color: d.color, san: d.expected ?? '' }, notation)} tone="best" />
              </span>
            </p>
          ))}
          {engineError && <p className="cb-text cb-text-err">{t('lesson.engine.unavailable')}</p>}
        </Section>
        {moves.length > 0 && (
          <Section label={t('lesson.moves')}>
            <MoveList moves={moves} current={moves.length - 1} userColor={user} scroll />
          </Section>
        )}
        <div className="cb-section">
          <label className="cb-switch">
            <input type="checkbox" checked={evalOn} onChange={(e) => setEvalOn(e.target.checked)} />
            <span className="cb-switch-track" aria-hidden="true" />
            <span>{t('lesson.sparring.evalBar')}</span>
          </label>
        </div>
        {phase === 'playing' && (
          <div className="cb-panel-foot cb-panel-foot-row">
            {confirmResign ? (
              <>
                <Button variant="danger" icon="flag" onClick={() => endGame('loss', 'resign')}>
                  {t('lesson.sparring.confirmResign')}
                </Button>
                <Button variant="ghost" onClick={() => setConfirmResign(false)}>
                  {t('lesson.cancel')}
                </Button>
              </>
            ) : (
              <Button icon="flag" onClick={() => setConfirmResign(true)} disabled={moves.filter((m) => m.color === user).length === 0}>
                {t('lesson.sparring.resign')}
              </Button>
            )}
          </div>
        )}
      </aside>
      {feedback}
    </LessonShell>
  );
}
