// Etapa de puzzles: lista con el estado de cada uno y resolución con PuzzleSolver. Se
// completa al resolver al menos `passRatio` de ellos.
import { useMemo, useRef, useState } from 'react';
import { resolvePosition, type Course, type Puzzle, type PuzzlesStage as PuzzlesStageDef } from '@chessblizzard/shared';
import { Board } from '../board';
import { useT, useTx } from '../i18n';
import { useProgress } from '../state/progress';
import { usePlural } from './hooks';
import { campOf } from './lessonData';
import { PuzzleSolver } from './PuzzleSolver';
import { CompleteScreen, EmptyNote, LessonShell, PanelHeader } from './Shell';
import { Button, Icon, IdeaChip, Stat } from './ui';

function safeFen(p: Puzzle) {
  try {
    return resolvePosition(p);
  } catch {
    return resolvePosition({});
  }
}

export function PuzzlesStage({ course, stage, onExit }: { course: Course; stage: PuzzlesStageDef; onExit: () => void }) {
  const t = useT();
  const tx = useTx();
  const plural = usePlural();
  const { state, record } = useProgress();
  const puzzles = useMemo(
    () => stage.puzzles.map((id) => course.puzzles.find((p) => p.id === id)).filter((p): p is Puzzle => !!p),
    [course, stage],
  );
  const camp = campOf(course, stage.id);
  const [open, setOpen] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'complete'>('list');
  const [xp, setXp] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const completed = useRef(false);

  const required = Math.max(1, Math.ceil(puzzles.length * stage.passRatio));
  const solvedCount = puzzles.filter((p) => state.puzzles[p.id]?.solved).length;
  const progress = {
    label: `${tx(course.name)} · ${tx(stage.title)}`,
    right: puzzles.length ? t('lesson.puzzles.solvedOf', { k: solvedCount, n: puzzles.length }) : '',
    value: puzzles.length ? Math.min(1, solvedCount / required) : 0,
  };
  const kicker = `${tx(course.name)} · ${camp ? tx(camp.name) : ''}`;

  const completeStage = (score?: number) => {
    if (completed.current) return false;
    completed.current = true;
    const gained = record({ type: 'stage_complete', course: course.id, stage: stage.id, score }) || 0;
    setXp((x) => x + gained);
    return true;
  };

  if (puzzles.length === 0) {
    return (
      <LessonShell onExit={onExit} progress={progress} xp={xp} wide>
        <EmptyNote
          title={t('lesson.puzzles.emptyTitle')}
          text={t('lesson.puzzles.emptyText')}
          actions={
            <>
              <Button onClick={onExit}>{t('lesson.complete.back')}</Button>
              <Button
                variant="primary"
                onClick={() => {
                  completeStage();
                  onExit();
                }}
              >
                {t('lesson.puzzles.skip')}
              </Button>
            </>
          }
        />
      </LessonShell>
    );
  }

  if (view === 'complete') {
    return (
      <LessonShell onExit={onExit} progress={{ ...progress, value: 1 }} xp={xp} wide>
        <CompleteScreen
          title={t('lesson.complete.title')}
          text={t('lesson.puzzles.completeText', { k: solvedCount, n: puzzles.length })}
          stats={
            <>
              <Stat value={`+${xp}`} label={t('lesson.complete.xp')} tone="warn" />
              <Stat value={`${solvedCount}/${puzzles.length}`} label={t('lesson.puzzles.solved')} tone="ok" />
            </>
          }
          actions={
            <>
              {solvedCount < puzzles.length && (
                <Button icon="puzzle" onClick={() => setView('list')}>
                  {t('lesson.puzzles.keepSolving')}
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

  const current = open ? puzzles.find((p) => p.id === open) : undefined;
  if (current) {
    const idx = puzzles.indexOf(current);
    const nextUnsolved = [...puzzles.slice(idx + 1), ...puzzles.slice(0, idx)].find((p) => !state.puzzles[p.id]?.solved && p.id !== current.id);
    return (
      <LessonShell onExit={onExit} progress={progress} xp={xp}>
        <PuzzleSolver
          key={`${current.id}-${attempt}`}
          puzzle={current}
          course={course}
          header={
            <PanelHeader kicker={t('lesson.puzzles.kicker', { i: idx + 1, n: puzzles.length })} title={tx(current.theme)}>
              <div className="cb-chips">
                <IdeaChip>{t('lesson.puzzle.rating', { n: current.rating })}</IdeaChip>
                <button type="button" className="cb-linkbtn" onClick={() => setOpen(null)}>
                  <Icon name="prev" size={14} /> {t('lesson.puzzles.backToList')}
                </button>
              </div>
            </PanelHeader>
          }
          continueLabel={nextUnsolved ? t('lesson.puzzles.next') : t('lesson.continue')}
          onDone={(solved) => {
            const nowSolved = solvedCount + (solved && !state.puzzles[current.id]?.solved ? 1 : 0);
            if (nowSolved >= required && !completed.current) {
              completeStage(Math.round((nowSolved / puzzles.length) * 100) / 100);
              setOpen(null);
              setView('complete');
              return;
            }
            setAttempt((a) => a + 1);
            setOpen(nextUnsolved ? nextUnsolved.id : null);
          }}
        />
      </LessonShell>
    );
  }

  return (
    <LessonShell onExit={onExit} progress={progress} xp={xp} wide>
      <section className="cb-puzzles" aria-label={tx(stage.title)}>
        <PanelHeader kicker={kicker} title={tx(stage.title)}>
          <p className="cb-panel-sub">
            {t('lesson.puzzles.goal', { k: required, n: puzzles.length })} · {plural('lesson.puzzles.solvedCount', solvedCount)}
          </p>
          <div className="cb-progress cb-progress-inline" aria-hidden="true">
            <div className="cb-progress-fill" style={{ width: `${Math.min(100, (solvedCount / required) * 100)}%` }} />
          </div>
        </PanelHeader>
        <ul className="cb-puzzle-grid">
          {puzzles.map((p, i) => {
            const rec = state.puzzles[p.id];
            const status = rec?.solved ? 'solved' : rec ? 'failed' : 'new';
            const fen = safeFen(p);
            return (
              <li key={p.id}>
                <button type="button" className={`cb-puzzle-card cb-puzzle-${status}`} onClick={() => setOpen(p.id)}>
                  <Board fen={fen} orientation={fen.split(' ')[1] === 'b' ? 'black' : 'white'} coordinates={false} animate={false} className="cb-board-mini" ariaLabel={tx(p.theme)} />
                  <span className="cb-puzzle-info">
                    <span className="cb-puzzle-n">#{i + 1}</span>
                    <span className="cb-puzzle-theme">{tx(p.theme)}</span>
                    <span className="cb-puzzle-meta">
                      {t('lesson.puzzle.rating', { n: p.rating })}
                      <span className={`cb-puzzle-status cb-puzzle-status-${status}`}>
                        {status === 'solved' && <Icon name="check" size={14} stroke={3} />}
                        {status === 'failed' && <Icon name="retry" size={14} />}
                        {t(`lesson.puzzles.status.${status}`)}
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {solvedCount >= required && !completed.current && (
          <div className="cb-panel-foot">
            <Button
              variant="primary"
              onClick={() => {
                completeStage(Math.round((solvedCount / puzzles.length) * 100) / 100);
                setView('complete');
              }}
            >
              {t('lesson.study.finishStage')}
            </Button>
          </div>
        )}
      </section>
    </LessonShell>
  );
}
