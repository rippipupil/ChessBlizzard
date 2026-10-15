// Práctica de una línea: el alumno juega su bando y el rival responde solo tras una pausa.
// Si se equivoca: feedback de error, flecha verde con la jugada del repertorio y una
// comparación rápida con Stockfish; tiene que repetir la jugada correcta para seguir.
// Lo usan las etapas de práctica, el repaso (SRS) y el examen (sin ayudas, el primer
// fallo suspende la línea).
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { review, type Course, type Grade, type LineDef } from '@chessblizzard/shared';
import { checkSquare, legalDests, tryMove, type BoardArrow, type PlayedMove, type SquareTone } from '../board';
import { formatScore, povScore, scoreValue } from '../engine';
import { useLocale, useNotation, useT, useTx } from '../i18n';
import { useProgress } from '../state/progress';
import { useSettings } from '../state/settings';
import { BoardArea } from './BoardArea';
import { moveSound, useMoveCompare, usePlural, useSound, type CompareSpec, type CompareState } from './hooks';
import { fenAt, lastMoveAt, linePlies, moveArrow, moveLabel, noteArrows } from './lessonData';
import { Feedback, Section } from './Shell';
import { Button, Icon, MoveChip, MoveList, RichText, Stat } from './ui';

export type PracticeMode = 'practice' | 'review' | 'exam';

export interface PracticeResult {
  lineId: string;
  /** Hubo al menos un fallo. */
  failed: boolean;
  /** Se usó alguna pista. */
  hinted: boolean;
  mistakes: number;
  /** Jugadas del alumno en la parte practicada. */
  userMoves: number;
  /** Jugadas acertadas a la primera y sin pista. */
  firstTry: number;
}

/** Nota de la práctica para la repetición espaciada. */
export function gradeOf(r: PracticeResult): Grade {
  return r.failed ? 'again' : r.hinted ? 'hard' : 'good';
}

type Phase = 'replay' | 'auto' | 'user' | 'paused' | 'wrong' | 'failed' | 'end';

const OPPONENT_DELAY = 650;
const WRONG_SHOW = 750;

export interface LinePracticeProps {
  course: Course;
  line: LineDef;
  mode: PracticeMode;
  /** Medias jugadas iniciales que se reproducen solas (tronco común). */
  startAt?: number;
  header: ReactNode;
  /** Al terminar: el padre registra el resultado y devuelve la XP ganada. */
  onComplete: (r: PracticeResult) => number | void;
  /** Al pulsar Continuar tras terminar. */
  onContinue: () => void;
  continueLabel?: string;
  onProgress?: (cursor: number, total: number) => void;
  /** Contenido adicional al final del panel. */
  extra?: ReactNode;
}

export function LinePractice({ course, line, mode, startAt = 0, header, onComplete, onContinue, continueLabel, onProgress, extra }: LinePracticeProps) {
  const t = useT();
  const tx = useTx();
  const notation = useNotation();
  const plural = usePlural();
  const { settings } = useSettings();
  const { state, today } = useProgress();
  const sound = useSound();
  const plies = linePlies(line);
  const n = plies.length;
  const user = course.side;
  const from = Math.min(Math.max(0, startAt), n);
  const exam = mode === 'exam';

  const [cursor, setCursor] = useState(0);
  const [phase, setPhase] = useState<Phase>(from > 0 ? 'replay' : 'auto');
  /** Jugada equivocada que se ve en el tablero (un momento). */
  const [wrong, setWrong] = useState<PlayedMove | null>(null);
  /** Última jugada equivocada y en qué media jugada (para el feedback y la flecha verde). */
  const [errMove, setErrMove] = useState<PlayedMove | null>(null);
  const [errAt, setErrAt] = useState<number | null>(null);
  const [errDismissed, setErrDismissed] = useState(false);
  const [okAt, setOkAt] = useState<number | null>(null);
  const [hint, setHint] = useState<0 | 1 | 2>(0);
  const [streak, setStreak] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [result, setResult] = useState<{ r: PracticeResult; xp: number } | null>(null);
  const [compare, setCompare] = useState<CompareSpec | null>(null);
  const cmp = useMoveCompare(compare);
  const missed = useRef(new Set<number>());
  const helped = useRef(new Set<number>());
  const done = useRef(false);

  const userPlies = useMemo(() => plies.filter((p, i) => i >= from && p.color === user).length, [plies, from, user]);

  const progressRef = useRef(onProgress);
  progressRef.current = onProgress;
  useEffect(() => {
    progressRef.current?.(cursor, n);
  }, [cursor, n]);

  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;
  const finish = () => {
    if (done.current) return;
    done.current = true;
    const r: PracticeResult = {
      lineId: line.id,
      failed: missed.current.size > 0,
      hinted: helped.current.size > 0,
      mistakes: missed.current.size,
      userMoves: userPlies,
      firstTry: Math.max(0, userPlies - new Set([...missed.current, ...helped.current]).size),
    };
    const xp = completeRef.current(r) || 0;
    setResult({ r, xp });
    setPhase('end');
    if (!r.failed) sound('complete');
  };

  // Tramo común: se reproduce deprisa.
  useEffect(() => {
    if (phase !== 'replay') return;
    if (cursor >= from) {
      setPhase('auto');
      return;
    }
    const id = setTimeout(() => setCursor((c) => c + 1), cursor === 0 ? 400 : 170);
    return () => clearTimeout(id);
  }, [phase, cursor, from]);

  // Turno: si le toca al rival, juega solo tras una pausa; si le toca al alumno, espera.
  useEffect(() => {
    if (phase !== 'auto') return;
    if (cursor >= n) {
      finish();
      return;
    }
    const ply = plies[cursor];
    if (ply.color === user) {
      setPhase('user');
      return;
    }
    const id = setTimeout(
      () => {
        sound(moveSound(ply.san));
        setOkAt(null);
        setCursor((c) => c + 1);
      },
      cursor === 0 ? 550 : OPPONENT_DELAY,
    );
    return () => clearTimeout(id);
  }, [phase, cursor]); // eslint-disable-line react-hooks/exhaustive-deps

  // La jugada equivocada se ve un momento y vuelve atrás.
  useEffect(() => {
    if (phase !== 'wrong' && phase !== 'failed') return;
    if (!wrong) return;
    const id = setTimeout(() => {
      setWrong(null);
      if (phase === 'wrong') setPhase('user');
    }, WRONG_SHOW);
    return () => clearTimeout(id);
  }, [phase, wrong]);

  const nextPly = plies[cursor];
  const lastPly = plies[cursor - 1];

  const onMove = (fromSq: string, toSq: string, promotion?: string) => {
    if (phase !== 'user' || !nextPly) return;
    const played = tryMove(nextPly.fenBefore, fromSq, toSq, promotion);
    if (!played) return;
    if (played.san === nextPly.san) {
      if (!missed.current.has(cursor) && hint === 0) setStreak((s) => s + 1);
      setErrAt(null);
      setErrDismissed(false);
      setHint(0);
      setCompare(null);
      sound(moveSound(played.san));
      const next = cursor + 1;
      setCursor(next);
      setOkAt(cursor);
      if (next >= n) {
        finish();
        return;
      }
      setPhase(nextPly.note?.text && !exam ? 'paused' : 'auto');
      return;
    }
    // Error.
    missed.current.add(cursor);
    setMistakes((m) => m + 1);
    setStreak(0);
    setWrong(played);
    setErrMove(played);
    setErrAt(cursor);
    setErrDismissed(false);
    setOkAt(null);
    setHint(0);
    sound('wrong');
    setCompare({ fen: nextPly.fenBefore, user: played.uci, book: nextPly.from + nextPly.to + (nextPly.promotion ?? '') });
    setPhase(exam ? 'failed' : 'wrong');
  };

  const askHint = () => {
    if (phase !== 'user' || !nextPly || hint >= 2) return;
    helped.current.add(cursor);
    setStreak(0);
    setHint((h) => (h === 0 ? 1 : 2));
  };

  // --- Tablero ---
  const baseFen = fenAt(plies, cursor);
  const fen = wrong ? wrong.fenAfter : baseFen;
  const lastMove = wrong ? ([wrong.from, wrong.to] as [string, string]) : lastMoveAt(plies, cursor);
  const arrows: BoardArrow[] = [];
  let marks: string[] | undefined;
  const tones: Partial<Record<string, SquareTone>> = {};
  if (!wrong && nextPly && (phase === 'user' || phase === 'failed')) {
    if (errAt === cursor) arrows.push(moveArrow(nextPly.from, nextPly.to, 'best'));
    else if (hint === 2) arrows.push(moveArrow(nextPly.from, nextPly.to, 'hint'));
    else if (hint === 1) tones[nextPly.from] = 'hint';
    if (!exam && settings.planArrows && phase === 'user' && lastPly && lastPly.color !== user) arrows.push(...noteArrows(lastPly.note, { plan: false }));
  }
  const okPly = okAt !== null ? plies[okAt] : undefined;
  if (okPly && (phase === 'paused' || phase === 'end') && !exam) {
    if (settings.planArrows) arrows.push(...noteArrows(okPly.note));
    marks = okPly.note?.marks;
  }
  if (wrong) tones[wrong.to] = 'err';
  else if (okPly && cursor === (okAt ?? -1) + 1) tones[okPly.to] = 'ok';

  const movable = phase === 'user' && !wrong ? { color: user, dests: legalDests(baseFen) } : null;
  const sideName = (c: 'w' | 'b') => t(c === 'w' ? 'lesson.white' : 'lesson.black');
  const rival = user === 'w' ? 'b' : 'w';

  // --- Estado en el panel ---
  let statusLabel: string;
  let statusBody: ReactNode = null;
  if (phase === 'replay') {
    statusLabel = t('lesson.practice.replayLabel');
    statusBody = <p className="cb-text cb-text-2">{t('lesson.practice.replayText')}</p>;
  } else if (phase === 'end') {
    statusLabel = t('lesson.practice.doneLabel');
    statusBody = <p className="cb-prompt">{t('lesson.practice.doneText')}</p>;
  } else if (phase === 'paused' && okPly) {
    statusLabel = t('lesson.practice.wellDone');
    statusBody = <p className="cb-prompt">{t('lesson.practice.readAndContinue')}</p>;
  } else if (phase === 'auto' || !nextPly) {
    statusLabel = t('lesson.practice.theirTurn', { side: sideName(rival) });
    statusBody = (
      <p className="cb-prompt cb-thinking">
        {okPly && cursor === (okAt ?? -1) + 1 && (
          <span className="cb-okline">
            <Icon name="check" size={16} stroke={3} /> {moveLabel(okPly, notation)}
          </span>
        )}
        <span className="cb-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </p>
    );
  } else {
    statusLabel = t('lesson.practice.yourTurn');
    const prompt =
      errAt === cursor
        ? t('lesson.practice.playBest', { move: moveLabel(nextPly, notation) })
        : hint === 2
          ? t('lesson.practice.hint2', { move: moveLabel(nextPly, notation) })
          : hint === 1
            ? t('lesson.practice.hint1')
            : lastPly
              ? t('lesson.practice.after', { move: moveLabel(lastPly, notation) })
              : t('lesson.practice.first');
    statusBody = (
      <>
        <p className="cb-prompt">{prompt}</p>
        {!exam && lastPly && lastPly.color !== user && lastPly.note?.text && errAt !== cursor && (
          <p className="cb-text cb-text-2">
            <RichText text={tx(lastPly.note.text)} />
          </p>
        )}
      </>
    );
  }

  // Próximo repaso si la línea terminara ahora con la nota actual.
  const gradeNow: Grade = missed.current.size > 0 ? 'again' : helped.current.size > 0 ? 'hard' : 'good';
  const nextInterval = review(state.lines[line.id], gradeNow, today).interval;

  // --- Feedback ---
  let feedback: ReactNode = null;
  if (phase === 'end' && result) {
    const { r, xp } = result;
    const title = exam
      ? t('lesson.practice.examPassed')
      : r.failed
        ? plural('lesson.practice.endMistakes', r.mistakes)
        : r.hinted
          ? t('lesson.practice.endHinted')
          : t('lesson.practice.endPerfect');
    feedback = (
      <Feedback tone={r.failed ? 'info' : 'ok'} icon={r.failed ? 'retry' : 'trophy'} title={title} xp={xp} action={{ label: continueLabel ?? t('lesson.continue'), onClick: onContinue }}>
        {okPly?.note?.text && !exam && (
          <p>
            <MoveChip text={moveLabel(okPly, notation)} tone="ok" /> <RichText text={tx(okPly.note.text)} />
          </p>
        )}
        {!exam && line.summary && (
          <p className="cb-feedback-sub">
            <RichText text={tx(line.summary)} />
          </p>
        )}
        {!exam && <p className="cb-feedback-meta">{plural('lesson.practice.nextReview', review(state.lines[line.id], gradeOf(r), today).interval)}</p>}
      </Feedback>
    );
  } else if (phase === 'paused' && okPly) {
    feedback = (
      <Feedback tone="ok" title={t('lesson.correct', { move: moveLabel(okPly, notation) })} action={{ label: t('lesson.continue'), onClick: () => setPhase('auto') }}>
        {okPly.note?.text && (
          <p>
            <RichText text={tx(okPly.note.text)} />
          </p>
        )}
      </Feedback>
    );
  } else if (errAt !== null && errAt === cursor && nextPly && (phase === 'wrong' || phase === 'failed' || (phase === 'user' && !errDismissed))) {
    const playedSan = errMove?.san ?? null;
    feedback = (
      <Feedback
        tone="err"
        title={exam ? t('lesson.practice.examFailed') : t('lesson.notRepertoire')}
        action={
          exam
            ? {
                label: t('lesson.continue'),
                onClick: () => {
                  finish();
                  onContinue();
                },
              }
            : { label: t('lesson.gotIt'), onClick: () => setErrDismissed(true) }
        }
      >
        <p>
          {playedSan && (
            <>
              {t('lesson.youPlayed')} <MoveChip text={moveLabel({ ...nextPly, san: playedSan }, notation)} tone="err" />.{' '}
            </>
          )}
          {t('lesson.repertoireMove')} <MoveChip text={moveLabel(nextPly, notation)} tone="best" />.
        </p>
        {nextPly.note?.text && (
          <p className="cb-feedback-sub">
            <RichText text={tx(nextPly.note.text)} />
          </p>
        )}
        <EngineCompare cmp={cmp} color={user} />
      </Feedback>
    );
  }

  return (
    <>
      <BoardArea
        board={{
          fen,
          orientation: user === 'w' ? 'white' : 'black',
          movable,
          onMove,
          lastMove,
          check: checkSquare(fen),
          arrows,
          marks,
          tones,
          ariaLabel: t('lesson.board.practiceLabel', { side: sideName(user) }),
        }}
        players={{
          w: { name: user === 'w' ? t('lesson.you', { side: sideName('w') }) : sideName('w'), note: user === 'w' ? turnNote(phase, t) : t('lesson.bookMoves') },
          b: { name: user === 'b' ? t('lesson.you', { side: sideName('b') }) : sideName('b'), note: user === 'b' ? turnNote(phase, t) : t('lesson.bookMoves') },
        }}
      />
      <aside className="cb-panel" aria-label={t('lesson.panel.practice')}>
        {header}
        <Section label={statusLabel} className="cb-status">
          {statusBody}
        </Section>
        {cursor > 0 && (
          <Section label={t('lesson.theLine')}>
            <MoveList moves={plies.slice(0, cursor)} current={cursor - 1} userColor={user} />
          </Section>
        )}
        {!exam && (
          <div className="cb-section cb-stats">
            <Stat value={streak} label={t('lesson.stats.streak')} tone="ok" />
            <Stat value={mistakes} label={t('lesson.stats.mistakes')} tone={mistakes ? 'err' : undefined} />
            <Stat value={plural('lesson.daysShort', nextInterval)} label={t('lesson.stats.nextReview')} tone="warn" />
          </div>
        )}
        {extra}
        {!exam && (
          <div className="cb-panel-foot cb-panel-foot-row">
            <Button icon="bulb" onClick={askHint} disabled={phase !== 'user' || hint >= 2 || errAt === cursor}>
              {hint === 0 ? t('lesson.hint') : t('lesson.hintMore')}
            </Button>
            <span className="cb-foot-note">{t(mode === 'review' ? 'lesson.practice.reviewNote' : 'lesson.practice.cleanNote')}</span>
          </div>
        )}
      </aside>
      {feedback}
    </>
  );
}

function turnNote(phase: Phase, t: (k: string) => string): ReactNode {
  if (phase === 'user') return <span className="cb-turn">{t('lesson.practice.yourTurn')}</span>;
  return undefined;
}

/** "Stockfish: tu jugada −1,2 · la del repertorio +0,3", con una frase que lo explica. */
export function EngineCompare({ cmp, color }: { cmp: CompareState; color: 'w' | 'b' }) {
  const t = useT();
  const locale = useLocale();
  if (cmp.loading) {
    return (
      <p className="cb-compare cb-compare-loading">
        <Icon name="cpu" size={16} /> {t('lesson.compare.loading')}
      </p>
    );
  }
  if (cmp.failed || !cmp.user || !cmp.book) return null;
  const u = povScore(cmp.user, color);
  const b = povScore(cmp.book, color);
  const delta = scoreValue(b) - scoreValue(u);
  const verdict = delta < 35 ? 'lesson.compare.similar' : delta < 120 ? 'lesson.compare.worse' : 'lesson.compare.bad';
  return (
    <p className="cb-compare">
      <Icon name="cpu" size={16} />
      <span>
        {t('lesson.compare.yours')} <b className="cb-score cb-score-err">{formatScore(cmp.user, locale, { pov: color })}</b> · {t('lesson.compare.book')}{' '}
        <b className="cb-score cb-score-ok">{formatScore(cmp.book, locale, { pov: color })}</b>. {t(verdict)}
      </span>
    </p>
  );
}
