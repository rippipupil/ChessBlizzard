// Etapa de ideas: diapositivas (tablero con flechas y marcas + explicación) y después un
// test con preguntas de "encuentra la jugada" en el tablero y de opción múltiple. Las
// preguntas falladas vuelven al final de la cola hasta acertarlas.
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { playMoves, resolvePosition, START_FEN, type Course, type IdeasStage as IdeasStageDef, type QuizItem, type Slide } from '@chessblizzard/shared';
import { checkSquare, legalDests, sanToUci, sideToMove, tryMove, type BoardArrow, type PlayedMove } from '../board';
import { useNotation, useT, useTx } from '../i18n';
import { useProgress } from '../state/progress';
import { BoardArea } from './BoardArea';
import { moveSound, useKeyNav, useSound } from './hooks';
import { arrowFrom, arrowText, campOf, moveArrow, moveLabel } from './lessonData';
import { Comment, CompleteScreen, Feedback, LessonShell, PanelHeader, Section, Tabs } from './Shell';
import { Button, IdeaChip, MoveChip, RichText, Stat } from './ui';

type Phase = 'slides' | 'quiz' | 'complete';

interface Position {
  fen: string;
  lastMove: [string, string] | null;
}

function positionOf(spec: { fen?: string; moves?: string }): Position {
  try {
    if (spec.fen) return { fen: spec.fen, lastMove: null };
    if (spec.moves) {
      const plies = playMoves(spec.moves);
      const last = plies[plies.length - 1];
      return { fen: last ? last.fenAfter : START_FEN, lastMove: last ? [last.from, last.to] : null };
    }
  } catch {
    // Contenido con una jugada ilegal: mostramos la posición inicial.
  }
  return { fen: resolveSafe(spec), lastMove: null };
}

function resolveSafe(spec: { fen?: string; moves?: string }) {
  try {
    return resolvePosition(spec);
  } catch {
    return START_FEN;
  }
}

function slideArrows(slide: Slide): BoardArrow[] {
  const out: BoardArrow[] = [];
  for (const s of slide.arrows ?? []) {
    const a = arrowFrom(s, 'plan');
    if (a) out.push(a);
  }
  for (const s of slide.rival ?? []) {
    const a = arrowFrom(s, 'rival');
    if (a) out.push(a);
  }
  return out;
}

export function IdeasStage({ course, stage, onExit }: { course: Course; stage: IdeasStageDef; onExit: () => void }) {
  const t = useT();
  const tx = useTx();
  const notation = useNotation();
  const { record } = useProgress();
  const sound = useSound();
  const slides = stage.slides;
  const quiz = stage.quiz;
  const camp = campOf(course, stage.id);

  const [phase, setPhase] = useState<Phase>(slides.length ? 'slides' : 'quiz');
  const [slideIdx, setSlideIdx] = useState(0);
  const [slidesSeen, setSlidesSeen] = useState(slides.length === 0);
  const [queue, setQueue] = useState<number[]>(() => quiz.map((_, i) => i));
  const [answer, setAnswer] = useState<null | { correct: boolean; choice?: number; move?: PlayedMove }>(null);
  const [showWrong, setShowWrong] = useState(false);
  const [xp, setXp] = useState(0);
  const missed = useRef(new Set<number>());
  const solved = useRef(new Set<number>());
  const completed = useRef(false);

  const complete = () => {
    if (completed.current) return;
    completed.current = true;
    const score = quiz.length ? Math.round(((quiz.length - missed.current.size) / quiz.length) * 100) / 100 : undefined;
    const gained = record({ type: 'stage_complete', course: course.id, stage: stage.id, score }) || 0;
    setXp((x) => x + gained);
    setPhase('complete');
    sound('complete');
  };

  useEffect(() => {
    if (phase === 'quiz' && quiz.length === 0) complete();
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const total = Math.max(1, slides.length + quiz.length);
  const kicker = `${tx(course.name)} · ${camp ? tx(camp.name) : ''}`;
  let value = 1;
  let right = '';
  if (phase === 'slides') {
    value = (slideIdx + 1) / total;
    right = t('lesson.ideas.slideOf', { i: slideIdx + 1, n: slides.length });
  } else if (phase === 'quiz') {
    value = (slides.length + solved.current.size) / total;
    right = t('lesson.ideas.questionOf', { i: Math.min(quiz.length, solved.current.size + 1), n: quiz.length });
  }
  const progress = { label: `${tx(course.name)} · ${tx(stage.title)}`, right, value };

  const tabs =
    slides.length > 0 && quiz.length > 0 ? (
      <Tabs
        label={t('lesson.tabs.label')}
        value={phase === 'quiz' ? 'quiz' : 'slides'}
        onChange={(id) => {
          if (id === 'quiz') setSlidesSeen(true);
          setPhase(id);
        }}
        items={[
          { id: 'slides', label: t('lesson.tabs.ideas') },
          { id: 'quiz', label: t('lesson.tabs.quiz') },
        ]}
      />
    ) : null;

  // --- Diapositivas ---
  const slide = slides[slideIdx];
  const goSlide = (i: number) => {
    const next = Math.max(0, Math.min(slides.length - 1, i));
    if (next === slides.length - 1) setSlidesSeen(true);
    setSlideIdx(next);
  };
  useKeyNav(
    {
      prev: () => goSlide(slideIdx - 1),
      next: () => (slideIdx < slides.length - 1 ? goSlide(slideIdx + 1) : undefined),
      first: () => goSlide(0),
      last: () => goSlide(slides.length - 1),
    },
    phase === 'slides',
  );

  if (phase === 'complete') {
    const firstTry = quiz.length - missed.current.size;
    return (
      <LessonShell onExit={onExit} progress={{ ...progress, value: 1, right: t('lesson.progress.done') }} xp={xp} wide>
        <CompleteScreen
          title={t('lesson.complete.title')}
          text={tx(stage.title)}
          stats={
            <>
              <Stat value={`+${xp}`} label={t('lesson.complete.xp')} tone="warn" />
              {quiz.length > 0 && <Stat value={`${firstTry}/${quiz.length}`} label={t('lesson.ideas.firstTry')} tone="ok" />}
              <Stat value={slides.length} label={t('lesson.ideas.slides')} />
            </>
          }
          actions={
            <>
              <Button
                icon="retry"
                onClick={() => {
                  setSlideIdx(0);
                  setPhase(slides.length ? 'slides' : 'quiz');
                  setQueue(quiz.map((_, i) => i));
                  solved.current = new Set();
                  setAnswer(null);
                }}
              >
                {t('lesson.ideas.again')}
              </Button>
              <Button variant="primary" onClick={onExit}>
                {t('lesson.complete.back')}
              </Button>
            </>
          }
        />
      </LessonShell>
    );
  }

  if (phase === 'slides' && slide) {
    const pos = positionOf(slide);
    const arrows = slideArrows(slide);
    const isLast = slideIdx === slides.length - 1;
    return (
      <LessonShell onExit={onExit} progress={progress} xp={xp}>
        <BoardArea
          board={{
            fen: pos.fen,
            orientation: course.side === 'w' ? 'white' : 'black',
            lastMove: pos.lastMove,
            check: checkSquare(pos.fen),
            arrows,
            marks: slide.marks,
            ariaLabel: tx(slide.title),
          }}
          players={players(course.side, t)}
          nav={{
            onFirst: () => goSlide(0),
            onPrev: () => goSlide(slideIdx - 1),
            onNext: () => goSlide(slideIdx + 1),
            onLast: () => goSlide(slides.length - 1),
            canPrev: slideIdx > 0,
            canNext: !isLast,
          }}
        />
        <aside className="cb-panel" aria-label={t('lesson.panel.ideas')}>
          <PanelHeader kicker={kicker} title={tx(stage.title)}>
            {tabs}
          </PanelHeader>
          <Comment mood={isLast ? 'happy' : 'neutral'} title={tx(slide.title)}>
            <p className="cb-text">
              <RichText text={tx(slide.text)} />
            </p>
            {arrows.length > 0 && (
              <div className="cb-chips">
                {arrows.map((a, i) => (
                  <IdeaChip key={i} kind={a.kind}>
                    {t(a.kind === 'plan' ? 'lesson.chip.plan' : 'lesson.chip.rival')} · {arrowText(a, pos.fen, notation)}
                  </IdeaChip>
                ))}
              </div>
            )}
          </Comment>
          <div className="cb-section cb-dots-row">
            <div className="cb-slide-dots" role="tablist" aria-label={t('lesson.ideas.slides')}>
              {slides.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === slideIdx}
                  aria-label={`${i + 1}. ${tx(s.title)}`}
                  className={`cb-slide-dot${i === slideIdx ? ' cb-slide-dot-cur' : i < slideIdx ? ' cb-slide-dot-done' : ''}`}
                  onClick={() => goSlide(i)}
                />
              ))}
            </div>
          </div>
          <div className="cb-panel-foot cb-panel-foot-row">
            <Button icon="prev" onClick={() => goSlide(slideIdx - 1)} disabled={slideIdx === 0}>
              {t('lesson.prev')}
            </Button>
            {isLast ? (
              <Button
                variant="primary"
                className="cb-grow"
                onClick={() => {
                  setSlidesSeen(true);
                  setPhase('quiz');
                }}
              >
                {quiz.length ? t('lesson.ideas.startQuiz') : t('lesson.study.finishStage')}
              </Button>
            ) : (
              <Button variant="primary" className="cb-grow" onClick={() => goSlide(slideIdx + 1)}>
                {t('lesson.next')}
              </Button>
            )}
          </div>
        </aside>
      </LessonShell>
    );
  }

  // --- Test ---
  const itemIdx = queue[0];
  const item: QuizItem | undefined = quiz[itemIdx];
  if (!item) {
    return (
      <LessonShell onExit={onExit} progress={progress} xp={xp}>
        <span />
      </LessonShell>
    );
  }
  return (
    <LessonShell onExit={onExit} progress={progress} xp={xp}>
      <QuizView
        key={`${itemIdx}-${queue.length}`}
        item={item}
        course={course}
        header={
          <PanelHeader kicker={kicker} title={tx(stage.title)}>
            {tabs}
            {!slidesSeen && <p className="cb-panel-sub">{t('lesson.ideas.slidesFirst')}</p>}
          </PanelHeader>
        }
        retry={missed.current.has(itemIdx)}
        answer={answer}
        showWrong={showWrong}
        onAnswer={(a) => {
          if (!a.correct) missed.current.add(itemIdx);
          sound(a.correct ? 'correct' : 'wrong');
          setAnswer(a);
          if (a.move && !a.correct) {
            setShowWrong(true);
            setTimeout(() => setShowWrong(false), 800);
          }
        }}
        onContinue={() => {
          const wasCorrect = !!answer?.correct;
          if (wasCorrect) solved.current.add(itemIdx);
          const rest = queue.slice(1);
          const next = wasCorrect ? rest : [...rest, itemIdx];
          setAnswer(null);
          setShowWrong(false);
          if (next.length === 0) {
            setQueue([]);
            complete();
          } else setQueue(next);
        }}
        notation={notation}
        sound={(san) => sound(moveSound(san))}
      />
    </LessonShell>
  );
}

function players(side: 'w' | 'b', t: (k: string, v?: Record<string, string | number>) => string) {
  const name = (c: 'w' | 'b') => t(c === 'w' ? 'lesson.white' : 'lesson.black');
  return {
    w: { name: side === 'w' ? t('lesson.you', { side: name('w') }) : name('w') },
    b: { name: side === 'b' ? t('lesson.you', { side: name('b') }) : name('b') },
  };
}

function QuizView({
  item,
  course,
  header,
  retry,
  answer,
  showWrong,
  onAnswer,
  onContinue,
  notation,
  sound,
}: {
  item: QuizItem;
  course: Course;
  header: ReactNode;
  retry: boolean;
  answer: null | { correct: boolean; choice?: number; move?: PlayedMove };
  showWrong: boolean;
  onAnswer: (a: { correct: boolean; choice?: number; move?: PlayedMove }) => void;
  onContinue: () => void;
  notation: 'es' | 'en';
  sound: (san: string) => void;
}) {
  const t = useT();
  const tx = useTx();
  const pos = useMemo(() => positionOf(item), [item]);
  const toMove = sideToMove(pos.fen);

  // Atajos 1–4 para las opciones.
  useEffect(() => {
    if (item.kind !== 'choice' || answer) return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= item.options.length) {
        e.preventDefault();
        onAnswer({ correct: n - 1 === item.correct, choice: n - 1 });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [item, answer, onAnswer]);

  let fen = pos.fen;
  let lastMove = pos.lastMove;
  const arrows: BoardArrow[] = [];
  const tones: Record<string, 'ok' | 'err'> = {};
  if (item.kind === 'move' && answer) {
    if (answer.correct && answer.move) {
      fen = answer.move.fenAfter;
      lastMove = [answer.move.from, answer.move.to];
      tones[answer.move.to] = 'ok';
    } else if (answer.move && showWrong) {
      fen = answer.move.fenAfter;
      lastMove = [answer.move.from, answer.move.to];
      tones[answer.move.to] = 'err';
    } else {
      const uci = sanToUci(pos.fen, item.answers[0]);
      if (uci) arrows.push(moveArrow(uci.slice(0, 2), uci.slice(2, 4), 'best'));
    }
  }

  const correctMoveText = (() => {
    if (item.kind !== 'move') return '';
    const m = tryMoveSan(pos.fen, item.answers[0]);
    return m ? moveLabel(m, notation) : item.answers[0];
  })();

  let feedback: ReactNode = null;
  if (answer) {
    feedback = (
      <Feedback
        tone={answer.correct ? 'ok' : 'err'}
        title={answer.correct ? t('lesson.quiz.correct') : t('lesson.quiz.wrong')}
        action={{ label: answer.correct ? t('lesson.continue') : t('lesson.quiz.retryLater'), onClick: onContinue }}
      >
        {!answer.correct && item.kind === 'move' && (
          <p>
            {t('lesson.quiz.answerWas')} <MoveChip text={correctMoveText} tone="best" />.
          </p>
        )}
        {!answer.correct && item.kind === 'choice' && (
          <p>
            {t('lesson.quiz.answerWas')} <b>{tx(item.options[item.correct])}</b>.
          </p>
        )}
        <p className={answer.correct ? undefined : 'cb-feedback-sub'}>
          <RichText text={tx(item.explanation)} />
        </p>
      </Feedback>
    );
  }

  return (
    <>
      <BoardArea
        board={{
          fen,
          orientation: item.kind === 'move' ? (toMove === 'w' ? 'white' : 'black') : course.side === 'w' ? 'white' : 'black',
          lastMove,
          check: checkSquare(fen),
          arrows,
          tones,
          movable: item.kind === 'move' && !answer ? { color: toMove, dests: legalDests(pos.fen) } : null,
          onMove: (from, to, promotion) => {
            if (item.kind !== 'move' || answer) return;
            const played = tryMove(pos.fen, from, to, promotion);
            if (!played) return;
            sound(played.san);
            const ok = item.answers.some((a) => a === played.san || a.replace(/[+#]$/, '') === played.san.replace(/[+#]$/, ''));
            onAnswer({ correct: ok, move: played });
          },
          ariaLabel: tx(item.question),
        }}
        players={players(course.side, t)}
      />
      <aside className="cb-panel" aria-label={t('lesson.panel.quiz')}>
        {header}
        <Section label={retry ? t('lesson.quiz.again') : item.kind === 'move' ? t('lesson.quiz.findMove') : t('lesson.quiz.choose')}>
          <p className="cb-question">
            <RichText text={tx(item.question)} />
          </p>
          {item.kind === 'move' && !answer && (
            <p className="cb-text cb-text-2">{t('lesson.quiz.moveHelp', { side: t(toMove === 'w' ? 'lesson.whiteLower' : 'lesson.blackLower') })}</p>
          )}
        </Section>
        {item.kind === 'choice' && (
          <div className="cb-section cb-options" role="group" aria-label={t('lesson.quiz.options')}>
            {item.options.map((opt, i) => {
              const cls = ['cb-option'];
              if (answer) {
                if (i === item.correct) cls.push('cb-option-ok');
                else if (i === answer.choice) cls.push('cb-option-err');
                else cls.push('cb-option-dim');
              }
              return (
                <button key={i} type="button" className={cls.join(' ')} disabled={!!answer} onClick={() => onAnswer({ correct: i === item.correct, choice: i })}>
                  <span className="cb-option-key">{String.fromCharCode(65 + i)}</span>
                  <span className="cb-option-text">
                    <RichText text={tx(opt)} />
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </aside>
      {feedback}
    </>
  );
}

function tryMoveSan(fen: string, san: string) {
  const uci = sanToUci(fen, san);
  if (!uci) return null;
  return tryMove(fen, uci.slice(0, 2), uci.slice(2, 4), uci[4]);
}
