// Etapas de líneas (line, branch, trap, practice): primero se estudia cada línea y después
// se practican las practicables. La etapa se completa cuando todas se han jugado una vez
// sin fallos ni pistas. Las líneas con fallos vuelven al final de la cola.
import { useMemo, useRef, useState } from 'react';
import type { Course, LinesStage as LinesStageDef } from '@chessblizzard/shared';
import { useT, useTx } from '../i18n';
import { useProgress } from '../state/progress';
import { usePlural } from './hooks';
import { addLine, campOf, firstNewPly, knownPositions, linePlies, stageLines } from './lessonData';
import { LinePractice, gradeOf, type PracticeResult } from './LinePractice';
import { CompleteScreen, LessonShell, PanelHeader, Tabs } from './Shell';
import { StudyLine } from './StudyLine';
import { Button, Icon, Stat } from './ui';

type Mode = 'study' | 'practice' | 'complete';

export function LinesStage({ course, stage, onExit }: { course: Course; stage: LinesStageDef; onExit: () => void }) {
  const t = useT();
  const tx = useTx();
  const plural = usePlural();
  const { record } = useProgress();
  const lines = useMemo(() => stageLines(course, stage), [course, stage]);
  const practicable = useMemo(() => lines.filter((l) => l.practice !== false), [lines]);
  const studyLines = stage.type === 'practice' ? [] : lines;
  const camp = campOf(course, stage.id);

  const [mode, setMode] = useState<Mode>(studyLines.length ? 'study' : 'practice');
  const [studyIdx, setStudyIdx] = useState(0);
  const [studied, setStudied] = useState<Set<string>>(() => new Set());
  const [queue, setQueue] = useState<string[]>(() => practicable.map((l) => l.id));
  const [clean, setClean] = useState<Set<string>>(() => new Set());
  const [attempt, setAttempt] = useState(0);
  const [xp, setXp] = useState(0);
  const [pos, setPos] = useState({ cursor: 0, total: 1 });
  const totals = useRef({ userMoves: 0, firstTry: 0, lines: 0 });
  const completed = useRef(false);
  const [lastResult, setLastResult] = useState<PracticeResult | null>(null);

  // Posiciones ya vistas antes de cada línea de estudio: las de etapas anteriores y las
  // líneas anteriores de esta misma etapa.
  const newFrom = useMemo(() => {
    const known = knownPositions(course, stage.id);
    return studyLines.map((line) => {
      const i = firstNewPly(linePlies(line), known);
      addLine(known, line);
      return i;
    });
  }, [course, stage.id, studyLines]);

  const completeStage = () => {
    if (completed.current) return;
    completed.current = true;
    const { userMoves, firstTry } = totals.current;
    const score = userMoves > 0 ? Math.round((firstTry / userMoves) * 100) / 100 : undefined;
    const gained = record({ type: 'stage_complete', course: course.id, stage: stage.id, score });
    setXp((x) => x + (gained || 0));
    setMode('complete');
  };

  const L = studyLines.length;
  const P = practicable.length;
  const total = Math.max(1, L + P);
  const frac = pos.total ? pos.cursor / pos.total : 0;
  let value = 1;
  let right = '';
  if (mode === 'study') {
    value = (studyIdx + frac) / total;
    right = t('lesson.progress.study', { i: studyIdx + 1, n: L });
  } else if (mode === 'practice') {
    value = (L + clean.size + frac) / total;
    right = t('lesson.progress.practice', { i: Math.min(P, clean.size + 1), n: P });
  }
  const progress = { label: `${tx(course.name)} · ${tx(stage.title)}`, right, value };
  const kicker = `${tx(course.name)} · ${camp ? tx(camp.name) : ''}`;

  const tabs =
    L > 0 && P > 0 ? (
      <Tabs
        label={t('lesson.tabs.label')}
        value={mode === 'practice' ? 'practice' : 'study'}
        onChange={(id) => setMode(id)}
        items={[
          { id: 'study', label: t('lesson.tabs.study') },
          { id: 'practice', label: t('lesson.tabs.practice') },
        ]}
      />
    ) : null;

  if (mode === 'complete') {
    const { userMoves, firstTry } = totals.current;
    const accuracy = userMoves ? Math.round((firstTry / userMoves) * 100) : 100;
    return (
      <LessonShell onExit={onExit} progress={{ ...progress, value: 1, right: t('lesson.progress.done') }} xp={xp} wide>
        <CompleteScreen
          title={t('lesson.complete.title')}
          text={tx(stage.title)}
          stats={
            <>
              <Stat value={`+${xp}`} label={t('lesson.complete.xp')} tone="warn" />
              {userMoves > 0 && <Stat value={`${accuracy}%`} label={t('lesson.complete.accuracy')} tone="ok" />}
              <Stat value={P || L} label={plural('lesson.complete.lines', P || L)} />
            </>
          }
          actions={
            <>
              {P > 0 && (
                <Button
                  onClick={() => {
                    setQueue(practicable.map((l) => l.id));
                    setClean(new Set());
                    setAttempt((a) => a + 1);
                    setMode('practice');
                  }}
                  icon="retry"
                >
                  {t('lesson.complete.again')}
                </Button>
              )}
              <Button variant="primary" onClick={onExit}>
                {t('lesson.complete.back')}
              </Button>
            </>
          }
        />
      </LessonShell>
    );
  }

  if (mode === 'study') {
    const line = studyLines[studyIdx];
    const isLast = studyIdx === L - 1;
    const header = (
      <PanelHeader kicker={kicker} title={tx(line.name)}>
        {tabs}
        {L > 1 && (
          <div className="cb-linepick" role="list" aria-label={t('lesson.linesOfStage')}>
            {studyLines.map((l, i) => (
              <button
                key={l.id}
                type="button"
                role="listitem"
                className={`cb-linepick-item${i === studyIdx ? ' cb-linepick-cur' : ''}`}
                aria-current={i === studyIdx ? 'true' : undefined}
                onClick={() => {
                  setStudyIdx(i);
                  setPos({ cursor: 0, total: 1 });
                }}
              >
                {studied.has(l.id) ? <Icon name="check" size={14} stroke={3} /> : <span className="cb-linepick-n">{i + 1}</span>}
                <span>{tx(l.name)}</span>
              </button>
            ))}
          </div>
        )}
      </PanelHeader>
    );
    const endActions = (
      <div className="cb-foot-actions">
        {!isLast ? (
          <Button
            variant="primary"
            block
            onClick={() => {
              setStudyIdx(studyIdx + 1);
              setPos({ cursor: 0, total: 1 });
            }}
          >
            {t('lesson.study.nextLine')}
          </Button>
        ) : P > 0 ? (
          <Button variant="primary" block onClick={() => setMode('practice')}>
            {t('lesson.study.toPractice')}
          </Button>
        ) : (
          <Button variant="primary" block onClick={completeStage}>
            {t('lesson.study.finishStage')}
          </Button>
        )}
      </div>
    );
    return (
      <LessonShell onExit={onExit} progress={progress} xp={xp}>
        <StudyLine
          key={`${line.id}-${studyIdx}`}
          course={course}
          line={line}
          newFrom={newFrom[studyIdx] ?? 0}
          header={header}
          intro={studyIdx === 0 ? tx(stage.intro) : undefined}
          onFinished={() => setStudied((s) => new Set(s).add(line.id))}
          onProgress={(cursor, totalPlies) => setPos({ cursor, total: totalPlies })}
          endActions={endActions}
        />
      </LessonShell>
    );
  }

  // --- Práctica ---
  const currentId = queue[0];
  const line = practicable.find((l) => l.id === currentId) ?? practicable[0];
  if (!line) {
    // Sin líneas practicables: la etapa se completa con el estudio.
    return (
      <LessonShell onExit={onExit} progress={progress} xp={xp}>
        <div className="cb-panel cb-panel-solo">
          <PanelHeader kicker={kicker} title={tx(stage.title)} />
          <div className="cb-section">
            <p className="cb-text">{t('lesson.practice.none')}</p>
          </div>
          <div className="cb-panel-foot">
            <Button variant="primary" block onClick={completeStage}>
              {t('lesson.study.finishStage')}
            </Button>
          </div>
        </div>
      </LessonShell>
    );
  }
  const retry = attempt > 0 && lastResult?.lineId === line.id && (lastResult.failed || lastResult.hinted);
  const header = (
    <PanelHeader kicker={kicker} title={tx(line.name)}>
      {tabs}
      <p className="cb-panel-sub">
        {retry ? t('lesson.practice.retryLine') : t('lesson.practice.lineOf', { i: Math.min(P, clean.size + 1), n: P })}
      </p>
    </PanelHeader>
  );

  return (
    <LessonShell onExit={onExit} progress={progress} xp={xp}>
      <LinePractice
        key={`${line.id}-${attempt}`}
        course={course}
        line={line}
        mode="practice"
        header={header}
        onProgress={(cursor, totalPlies) => setPos({ cursor, total: totalPlies })}
        onComplete={(r) => {
          setLastResult(r);
          totals.current.userMoves += r.userMoves;
          totals.current.firstTry += r.firstTry;
          totals.current.lines += 1;
          const gained = record({ type: 'line_review', line: r.lineId, grade: gradeOf(r) }) || 0;
          setXp((x) => x + gained);
          return gained;
        }}
        continueLabel={(() => {
          const r = lastResult;
          const clean = !!r && r.lineId === line.id && !r.failed && !r.hinted;
          if (!clean && queue.length === 1) return t('lesson.practice.repeatLine');
          return queue.length - (clean ? 1 : 0) > 0 ? t('lesson.practice.nextLine') : t('lesson.continue');
        })()}
        onContinue={() => {
          const r = lastResult;
          const ok = !!r && !r.failed && !r.hinted;
          const rest = queue.slice(1);
          const nextQueue = ok ? rest : [...rest, line.id];
          if (ok) setClean((s) => new Set(s).add(line.id));
          setQueue(nextQueue);
          setPos({ cursor: 0, total: 1 });
          if (nextQueue.length === 0) completeStage();
          else setAttempt((a) => a + 1);
        }}
      />
    </LessonShell>
  );
}
