// Resolver un puzzle: el alumno juega la solución y las respuestas del rival son
// automáticas. Si juega otra jugada que da mate, también vale. Un fallo cuenta como
// puzzle no resuelto, pero se puede seguir intentando o ver la solución.
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { playMoves, resolvePosition, splitMoves, type Course, type Ply, type Puzzle } from '@chessblizzard/shared';
import { checkSquare, legalDests, sideToMove, tryMove, type BoardArrow, type PlayedMove, type SquareTone } from '../board';
import { useNotation, useT, useTx } from '../i18n';
import { useProgress } from '../state/progress';
import { BoardArea } from './BoardArea';
import { moveSound, useSound } from './hooks';
import { moveArrow, moveLabel } from './lessonData';
import { Feedback, PanelHeader, Section, useInShell } from './Shell';
import { Button, Icon, IdeaChip, MoveChip, MoveList, RichText } from './ui';

export interface PuzzleSolverProps {
  puzzle: Puzzle;
  course: Course;
  onDone: (solved: boolean) => void;
  /** 'exam': sin pistas ni solución; el primer fallo lo suspende. */
  mode?: 'normal' | 'exam';
  /** Registrar el intento en el progreso (por defecto, sí; el examen no lo hace). */
  recordAttempt?: boolean;
  /** Cabecera del panel (si no se da, se muestra el tema del puzzle). */
  header?: ReactNode;
  continueLabel?: string;
}

interface Setup {
  /** Posición del puzzle (le toca al alumno). */
  fen: string;
  /** Jugada previa del rival que lleva a la posición (se anima al empezar). */
  intro: Ply | null;
  solution: Ply[];
  error: boolean;
}

function setupOf(puzzle: Puzzle): Setup {
  try {
    let fen: string;
    let intro: Ply | null = null;
    if (puzzle.fen) fen = puzzle.fen;
    else if (puzzle.moves) {
      const plies = playMoves(puzzle.moves);
      intro = plies[plies.length - 1] ?? null;
      fen = intro ? intro.fenAfter : resolvePosition(puzzle);
    } else fen = resolvePosition(puzzle);
    const solution = playMoves(splitMoves(puzzle.solution), fen);
    return { fen, intro, solution, error: solution.length === 0 };
  } catch {
    return { fen: puzzle.fen ?? resolvePosition({}), intro: null, solution: [], error: true };
  }
}

type Phase = 'intro' | 'user' | 'auto' | 'wrong' | 'reveal' | 'end';

export function PuzzleSolver({ puzzle, course, onDone, mode = 'normal', recordAttempt = true, header, continueLabel }: PuzzleSolverProps) {
  const t = useT();
  const tx = useTx();
  const notation = useNotation();
  const { record } = useProgress();
  const inShell = useInShell();
  const sound = useSound();
  const setup = useMemo(() => setupOf(puzzle), [puzzle]);
  const exam = mode === 'exam';
  const student = sideToMove(setup.fen);

  const [cursor, setCursor] = useState(0);
  const [phase, setPhase] = useState<Phase>(setup.intro ? 'intro' : 'user');
  const [wrong, setWrong] = useState<PlayedMove | null>(null);
  const [failed, setFailed] = useState(false);
  const [hint, setHint] = useState(0);
  const [altMate, setAltMate] = useState<PlayedMove | null>(null);
  const [flipped, setFlipped] = useState(false);
  const recorded = useRef(false);

  const finish = (solved: boolean) => {
    setPhase('end');
    if (!recorded.current) {
      recorded.current = true;
      if (recordAttempt) record({ type: 'puzzle_attempt', puzzle: puzzle.id, solved });
    }
    sound(solved ? 'complete' : 'move');
  };

  // Animación de la jugada previa del rival.
  useEffect(() => {
    if (phase !== 'intro') return;
    const id = setTimeout(() => {
      if (setup.intro) sound(moveSound(setup.intro.san));
      setPhase('user');
    }, 700);
    return () => clearTimeout(id);
  }, [phase]);

  // Respuesta automática del rival y reproducción de la solución.
  useEffect(() => {
    if (phase !== 'auto' && phase !== 'reveal') return;
    if (cursor >= setup.solution.length) {
      finish(!failed);
      return;
    }
    const ply = setup.solution[cursor];
    if (phase === 'auto' && ply.color === student) {
      setPhase('user');
      return;
    }
    const id = setTimeout(
      () => {
        sound(moveSound(ply.san));
        setCursor((c) => c + 1);
      },
      phase === 'reveal' ? 750 : 550,
    );
    return () => clearTimeout(id);
    // Solo depende del turno: la solución no cambia mientras se resuelve.
  }, [phase, cursor]);

  // La jugada equivocada se ve un momento.
  useEffect(() => {
    if (!wrong) return;
    const id = setTimeout(() => {
      setWrong(null);
      if (phase === 'wrong') setPhase(exam ? 'end' : 'user');
    }, 750);
    return () => clearTimeout(id);
  }, [wrong]);

  const fenNow = cursor > 0 ? setup.solution[cursor - 1].fenAfter : setup.fen;
  const next = setup.solution[cursor];

  const onMove = (from: string, to: string, promotion?: string) => {
    if (phase !== 'user' || !next) return;
    const played = tryMove(fenNow, from, to, promotion);
    if (!played) return;
    if (played.san === next.san) {
      sound(moveSound(played.san));
      setHint(0);
      const c = cursor + 1;
      setCursor(c);
      if (c >= setup.solution.length) finish(!failed);
      else setPhase('auto');
      return;
    }
    if (played.san.endsWith('#')) {
      // Otra jugada que da mate también resuelve el puzzle.
      sound('check');
      setAltMate(played);
      finish(!failed);
      return;
    }
    sound('wrong');
    setWrong(played);
    setFailed(true);
    if (exam) {
      recorded.current = true;
      setPhase('wrong');
    } else setPhase('wrong');
  };

  const reveal = () => {
    setFailed(true);
    setHint(0);
    setPhase('reveal');
  };

  // --- Tablero ---
  let fen = fenNow;
  let lastMove: [string, string] | null = cursor > 0 ? [setup.solution[cursor - 1].from, setup.solution[cursor - 1].to] : setup.intro ? [setup.intro.from, setup.intro.to] : null;
  if (phase === 'intro' && setup.intro) {
    fen = setup.intro.fenBefore;
    lastMove = null;
  }
  if (altMate) {
    fen = altMate.fenAfter;
    lastMove = [altMate.from, altMate.to];
  }
  if (wrong) {
    fen = wrong.fenAfter;
    lastMove = [wrong.from, wrong.to];
  }
  const arrows: BoardArrow[] = [];
  const tones: Partial<Record<string, SquareTone>> = {};
  if (wrong) tones[wrong.to] = 'err';
  else if (next && phase === 'user') {
    if (hint >= 2) arrows.push(moveArrow(next.from, next.to, 'hint'));
    else if (hint === 1) tones[next.from] = 'hint';
  }
  if (phase === 'end' && exam && failed && next) arrows.push(moveArrow(next.from, next.to, 'best'));
  const solvedNow = phase === 'end' && !failed;
  if (phase === 'end' && lastMove && !failed) tones[lastMove[1]] = 'ok';

  const studentName = t(student === 'w' ? 'lesson.white' : 'lesson.black');
  const studentLower = t(student === 'w' ? 'lesson.whiteLower' : 'lesson.blackLower');
  const rivalLower = t(student === 'w' ? 'lesson.blackLower' : 'lesson.whiteLower');
  const movable = phase === 'user' && !wrong ? { color: student, dests: legalDests(fenNow) } : null;
  const played = setup.solution.slice(0, cursor);

  // --- Panel ---
  let status: ReactNode;
  if (setup.error) status = <p className="cb-text">{t('lesson.puzzle.broken')}</p>;
  else if (phase === 'end')
    status = <p className="cb-prompt">{solvedNow ? t('lesson.puzzle.solvedText') : exam ? t('lesson.puzzle.examFailedText') : t('lesson.puzzle.failedText')}</p>;
  else if (phase === 'reveal') status = <p className="cb-prompt">{t('lesson.puzzle.revealing')}</p>;
  else if (phase === 'auto' || phase === 'intro') status = <p className="cb-prompt cb-thinking">{t('lesson.puzzle.theyMove', { side: rivalLower })}</p>;
  else
    status = (
      <>
        <p className="cb-prompt">{cursor === 0 ? t('lesson.puzzle.find', { side: studentLower }) : t('lesson.puzzle.keepGoing')}</p>
        {failed && !exam && <p className="cb-text cb-text-err">{t('lesson.puzzle.tryAgain')}</p>}
      </>
    );

  let feedback: ReactNode = null;
  if (phase === 'end') {
    feedback = (
      <Feedback
        tone={solvedNow ? 'ok' : exam ? 'err' : 'info'}
        icon={solvedNow ? 'trophy' : exam ? 'cross' : 'puzzle'}
        title={solvedNow ? t('lesson.puzzle.solved') : exam ? t('lesson.puzzle.examFailed') : t('lesson.puzzle.notSolved')}
        action={{ label: continueLabel ?? t('lesson.continue'), onClick: () => onDone(solvedNow) }}
      >
        {altMate && (
          <p>
            {t('lesson.puzzle.altMate')} <MoveChip text={moveLabel({ ...altMate, color: altMate.color }, notation)} tone="ok" />
          </p>
        )}
        {!solvedNow && setup.solution.length > 0 && (
          <p>
            {t('lesson.puzzle.solution')}{' '}
            {setup.solution.map((p, i) => (
              <MoveChip key={i} text={moveLabel(p, notation)} tone={p.color === student ? 'best' : undefined} />
            ))}
          </p>
        )}
        <p className={solvedNow ? undefined : 'cb-feedback-sub'}>
          <RichText text={tx(puzzle.explanation)} />
        </p>
      </Feedback>
    );
  } else if (wrong && !exam) {
    feedback = (
      <Feedback tone="err" title={t('lesson.puzzle.wrong')}>
        <p>{t('lesson.puzzle.wrongText')}</p>
      </Feedback>
    );
  }

  const content = (
    <>
      <BoardArea
        board={{
          fen,
          orientation: (student === 'w') !== flipped ? 'white' : 'black',
          movable,
          onMove,
          lastMove,
          check: checkSquare(fen),
          arrows,
          tones,
          ariaLabel: t('lesson.board.puzzleLabel', { side: studentName }),
        }}
        players={{
          w: { name: student === 'w' ? t('lesson.you', { side: t('lesson.white') }) : t('lesson.white') },
          b: { name: student === 'b' ? t('lesson.you', { side: t('lesson.black') }) : t('lesson.black') },
        }}
        onFlip={() => setFlipped((f) => !f)}
      />
      <aside className="cb-panel" aria-label={t('lesson.panel.puzzle')}>
        {header ?? (
          <PanelHeader kicker={tx(course.name)} title={tx(puzzle.theme)}>
            <div className="cb-chips">
              <IdeaChip>{t('lesson.puzzle.rating', { n: puzzle.rating })}</IdeaChip>
              <IdeaChip>{t('lesson.puzzle.toMove', { side: studentName })}</IdeaChip>
            </div>
          </PanelHeader>
        )}
        <Section label={t('lesson.puzzle.task')} className="cb-status">
          {status}
        </Section>
        {hint > 0 && !exam && phase !== 'end' && (
          <Section label={t('lesson.hint')}>
            <p className="cb-text">
              <Icon name="bulb" size={16} /> <RichText text={tx(puzzle.hint)} />
            </p>
          </Section>
        )}
        {played.length > 0 && (
          <Section label={t('lesson.moves')}>
            <MoveList moves={played} current={played.length - 1} userColor={student} />
          </Section>
        )}
        {!exam && phase !== 'end' && !setup.error && (
          <div className="cb-panel-foot cb-panel-foot-row">
            <Button icon="bulb" onClick={() => setHint((h) => Math.min(2, h + 1))} disabled={phase !== 'user' || hint >= 2}>
              {hint === 0 ? t('lesson.hint') : t('lesson.hintMore')}
            </Button>
            <Button icon="eye" onClick={reveal} disabled={phase === 'reveal' || phase === 'intro'}>
              {t('lesson.puzzle.show')}
            </Button>
          </div>
        )}
        {setup.error && (
          <div className="cb-panel-foot">
            <Button variant="primary" block onClick={() => onDone(false)}>
              {t('lesson.continue')}
            </Button>
          </div>
        )}
        {!inShell && feedback}
      </aside>
      {inShell && feedback}
    </>
  );

  return inShell ? content : <div className="cb-embed">{content}</div>;
}
