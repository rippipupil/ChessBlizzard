// Examen de la cumbre: 8–10 preguntas mezcladas. Las líneas se juegan sin ayudas (el
// primer fallo suspende la línea) desde donde se separan de la línea principal, y los
// puzzles sin pistas. Al final, la nota y un resumen; si aprueba, se completa la etapa.
import { useMemo, useRef, useState } from 'react';
import type { Course, ExamStage as ExamStageDef, LineDef, Puzzle } from '@chessblizzard/shared';
import { useT, useTx } from '../i18n';
import { useProgress } from '../state/progress';
import { campOf, sharedPrefix, stageLines } from './lessonData';
import { LinePractice } from './LinePractice';
import { PuzzleSolver } from './PuzzleSolver';
import { CompleteScreen, LessonShell, PanelHeader } from './Shell';
import { Button, Icon, RichText, Stat } from './ui';

type Question = { kind: 'line'; line: LineDef; startAt: number } | { kind: 'puzzle'; puzzle: Puzzle };

function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Elige 8–10 preguntas: hasta un 40 % de puzzles y el resto líneas. */
export function buildExam(course: Course, stage: ExamStageDef): Question[] {
  const lines = stageLines(course, stage).filter((l) => l.practice !== false);
  const puzzles = stage.puzzles.map((id) => course.puzzles.find((p) => p.id === id)).filter((p): p is Puzzle => !!p);
  const available = lines.length + puzzles.length;
  const total = Math.min(10, available);
  let nPuzzles = Math.min(puzzles.length, Math.round(total * 0.4));
  let nLines = Math.min(lines.length, total - nPuzzles);
  nPuzzles = Math.min(puzzles.length, total - nLines);
  if (nLines + nPuzzles < Math.min(8, available)) nLines = Math.min(lines.length, Math.min(8, available) - nPuzzles);
  // La línea principal del curso: las demás se juegan desde donde se separan de ella.
  const main = course.lines.find((l) => l.practice !== false);
  const pickLines = shuffle(lines).slice(0, nLines);
  const qs: Question[] = [
    ...pickLines.map((line): Question => ({ kind: 'line', line, startAt: main && line.id !== main.id ? sharedPrefix(line, [main]) : 0 })),
    ...shuffle(puzzles)
      .slice(0, nPuzzles)
      .map((puzzle): Question => ({ kind: 'puzzle', puzzle })),
  ];
  return shuffle(qs);
}

export function ExamStage({ course, stage, onExit }: { course: Course; stage: ExamStageDef; onExit: () => void }) {
  const t = useT();
  const tx = useTx();
  const { record } = useProgress();
  const camp = campOf(course, stage.id);
  const [round, setRound] = useState(0);
  const questions = useMemo(() => buildExam(course, stage), [course, stage, round]); // eslint-disable-line react-hooks/exhaustive-deps
  const [phase, setPhase] = useState<'intro' | 'question' | 'result'>('intro');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [xp, setXp] = useState(0);
  const [pos, setPos] = useState({ cursor: 0, total: 1 });
  const pending = useRef<boolean | null>(null);

  const N = questions.length;
  const pass = Math.round(stage.passScore * 100);
  const kicker = `${tx(course.name)} · ${camp ? tx(camp.name) : ''}`;
  const value = phase === 'result' ? 1 : phase === 'intro' ? 0 : (index + (pos.total ? pos.cursor / pos.total : 0)) / Math.max(1, N);
  const progress = {
    label: `${tx(course.name)} · ${tx(stage.title)}`,
    right: phase === 'question' ? t('lesson.exam.questionOf', { i: index + 1, n: N }) : '',
    value,
  };

  const finishExam = (all: boolean[]) => {
    const score = N ? all.filter(Boolean).length / N : 0;
    const rounded = Math.round(score * 100) / 100;
    let gained = record({ type: 'exam_result', course: course.id, score: rounded, passScore: stage.passScore }) || 0;
    if (rounded >= stage.passScore) gained += record({ type: 'stage_complete', course: course.id, stage: stage.id, score: rounded }) || 0;
    setXp((x) => x + gained);
    setPhase('result');
  };

  const answer = (ok: boolean) => {
    const all = [...answers, ok];
    setAnswers(all);
    pending.current = null;
    setPos({ cursor: 0, total: 1 });
    if (all.length >= N) finishExam(all);
    else setIndex(all.length);
  };

  if (N === 0) {
    return (
      <LessonShell onExit={onExit} progress={progress} xp={xp} wide>
        <CompleteScreen title={tx(stage.title)} mood="thinking" text={t('lesson.exam.empty')} actions={<Button onClick={onExit}>{t('lesson.complete.back')}</Button>} />
      </LessonShell>
    );
  }

  if (phase === 'intro') {
    const nLines = questions.filter((q) => q.kind === 'line').length;
    return (
      <LessonShell onExit={onExit} progress={progress} xp={xp} wide>
        <CompleteScreen
          title={tx(stage.title)}
          mood="thinking"
          text={<RichText text={tx(stage.intro)} />}
          stats={
            <>
              <Stat value={N} label={t('lesson.exam.questions')} />
              <Stat value={nLines} label={t('lesson.exam.lines')} />
              <Stat value={N - nLines} label={t('lesson.exam.puzzles')} />
              <Stat value={`${pass}%`} label={t('lesson.exam.toPass')} tone="warn" />
            </>
          }
          actions={
            <>
              <Button onClick={onExit}>{t('lesson.complete.back')}</Button>
              <Button variant="primary" icon="trophy" onClick={() => setPhase('question')}>
                {t('lesson.exam.start')}
              </Button>
            </>
          }
        >
          <p className="cb-complete-note">{t('lesson.exam.rules')}</p>
        </CompleteScreen>
      </LessonShell>
    );
  }

  if (phase === 'result') {
    const correct = answers.filter(Boolean).length;
    const score = Math.round((correct / N) * 100);
    const passed = score >= pass;
    return (
      <LessonShell onExit={onExit} progress={progress} xp={xp} wide>
        <CompleteScreen
          title={passed ? t('lesson.exam.passed') : t('lesson.exam.failed')}
          mood={passed ? 'happy' : 'sad'}
          text={passed ? t('lesson.exam.passedText', { score }) : t('lesson.exam.failedText', { score, pass })}
          stats={
            <>
              <Stat value={`${score}%`} label={t('lesson.exam.score')} tone={passed ? 'ok' : 'err'} />
              <Stat value={`${correct}/${N}`} label={t('lesson.exam.correct')} />
              <Stat value={`+${xp}`} label={t('lesson.complete.xp')} tone="warn" />
            </>
          }
          actions={
            <>
              <Button
                icon="retry"
                onClick={() => {
                  setRound((r) => r + 1);
                  setAnswers([]);
                  setIndex(0);
                  setPhase('intro');
                }}
              >
                {t('lesson.exam.retry')}
              </Button>
              <Button variant="primary" onClick={onExit}>
                {t('lesson.complete.back')}
              </Button>
            </>
          }
        >
          <ol className="cb-exam-list">
            {questions.map((q, i) => (
              <li key={i} className={answers[i] ? 'cb-exam-ok' : 'cb-exam-err'}>
                <Icon name={answers[i] ? 'check' : 'cross'} size={16} stroke={3} />
                <span className="cb-exam-kind">{q.kind === 'line' ? t('lesson.exam.lineQ') : t('lesson.exam.puzzleQ')}</span>
                <span>{q.kind === 'line' ? tx(q.line.name) : tx(q.puzzle.theme)}</span>
              </li>
            ))}
          </ol>
        </CompleteScreen>
      </LessonShell>
    );
  }

  const q = questions[index];
  const header = (
    <PanelHeader kicker={kicker} title={t('lesson.exam.questionOf', { i: index + 1, n: N })}>
      <p className="cb-panel-sub">{q.kind === 'line' ? t('lesson.exam.lineTask') : t('lesson.exam.puzzleTask')}</p>
    </PanelHeader>
  );
  const continueLabel = index + 1 >= N ? t('lesson.exam.seeResult') : t('lesson.exam.next');

  return (
    <LessonShell onExit={onExit} progress={progress} xp={xp}>
      {q.kind === 'line' ? (
        <LinePractice
          key={`${round}-${index}`}
          course={course}
          line={q.line}
          mode="exam"
          startAt={q.startAt}
          header={header}
          onProgress={(cursor, total) => setPos({ cursor, total })}
          onComplete={(r) => {
            pending.current = !r.failed;
            return 0;
          }}
          continueLabel={continueLabel}
          onContinue={() => answer(pending.current ?? false)}
        />
      ) : (
        <PuzzleSolver
          key={`${round}-${index}`}
          puzzle={q.puzzle}
          course={course}
          mode="exam"
          recordAttempt={false}
          header={header}
          continueLabel={continueLabel}
          onDone={(solved) => answer(solved)}
        />
      )}
    </LessonShell>
  );
}
