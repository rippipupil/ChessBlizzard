// Repaso de hoy: las líneas pendientes de todos los cursos (repetición espaciada),
// practicadas una tras otra, y un resumen al final.
import { useState } from 'react';
import { addDays, courses as allCourses, currentStreak, dueLines, review, type Course, type DueLine, type Grade } from '@chessblizzard/shared';
import { useT, useTx } from '../i18n';
import { useProgress } from '../state/progress';
import { usePlural } from './hooks';
import { courseLine } from './lessonData';
import { LinePractice, gradeOf, type PracticeResult } from './LinePractice';
import { CompleteScreen, EmptyNote, LessonShell, PanelHeader } from './Shell';
import { Button, Icon, Stat } from './ui';

interface Done {
  item: DueLine;
  result: PracticeResult;
  grade: Grade;
  nextDue: string;
}

export function ReviewSession({ onExit, courses = allCourses }: { onExit: () => void; courses?: Course[] }) {
  const t = useT();
  const tx = useTx();
  const plural = usePlural();
  const { state, today, record } = useProgress();
  // La lista se fija al empezar: registrar repasos no debe cambiarla a mitad de sesión.
  const [items, setItems] = useState<DueLine[]>(() =>
    dueLines(courses, state, today).filter((d) => {
      const line = courseLine(d.course, d.lineId);
      return !!line && line.practice !== false;
    }),
  );
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState<Done[]>([]);
  const [xp, setXp] = useState(0);
  const [round, setRound] = useState(0);
  const [pos, setPos] = useState({ cursor: 0, total: 1 });
  const streak = currentStreak(state, today);

  if (items.length === 0) {
    return (
      <LessonShell onExit={onExit} progress={{ label: t('lesson.review.title'), value: 1 }} streak={streak} wide>
        <EmptyNote
          mood="happy"
          title={t('lesson.review.emptyTitle')}
          text={t('lesson.review.emptyText')}
          actions={
            <Button variant="primary" onClick={onExit}>
              {t('lesson.complete.back')}
            </Button>
          }
        />
      </LessonShell>
    );
  }

  const finished = index >= items.length;
  const current = items[Math.min(index, items.length - 1)];
  const course = current.course;
  const progress = {
    label: finished ? t('lesson.review.title') : `${t('lesson.review.title')} · ${tx(course.name)}`,
    right: finished ? t('lesson.progress.done') : t('lesson.review.lineOf', { i: index + 1, n: items.length }),
    value: (index + (finished ? 0 : pos.total ? pos.cursor / pos.total : 0)) / items.length,
    segments: { done: Math.min(index, items.length), total: items.length },
  };

  if (finished) {
    const clean = done.filter((d) => d.grade === 'good').length;
    const failed = done.filter((d) => d.grade === 'again');
    return (
      <LessonShell onExit={onExit} progress={progress} streak={streak} wide>
        <CompleteScreen
          title={t('lesson.review.doneTitle')}
          text={plural('lesson.review.doneText', done.length)}
          stats={
            <>
              <Stat value={`${clean}/${done.length}`} label={t('lesson.review.clean')} tone="ok" />
              <Stat value={`+${xp}`} label={t('lesson.complete.xp')} tone="warn" />
              <Stat value={streak} label={plural('lesson.review.streakDays', streak)} />
            </>
          }
          actions={
            <>
              {failed.length > 0 && (
                <Button
                  icon="retry"
                  onClick={() => {
                    setItems(failed.map((d) => d.item));
                    setDone([]);
                    setIndex(0);
                    setRound((r) => r + 1);
                  }}
                >
                  {t('lesson.review.retryFailed')}
                </Button>
              )}
              <Button variant="primary" onClick={onExit}>
                {t('lesson.complete.back')}
              </Button>
            </>
          }
        >
          <ul className="cb-review-list">
            {done.map((d, i) => {
              const line = courseLine(d.item.course, d.item.lineId);
              return (
                <li key={i} className={`cb-review-item cb-review-${d.grade}`}>
                  <Icon name={d.grade === 'again' ? 'retry' : 'check'} size={16} stroke={2.6} />
                  <span className="cb-review-name">
                    {line ? tx(line.name) : d.item.lineId}
                    <small>{tx(d.item.course.name)}</small>
                  </span>
                  <span className="cb-review-grade">{t(`lesson.grade.${d.grade}`)}</span>
                  <span className="cb-review-next">{nextLabel(d.nextDue, today, t, plural)}</span>
                </li>
              );
            })}
          </ul>
        </CompleteScreen>
      </LessonShell>
    );
  }

  const line = courseLine(course, current.lineId)!;
  const header = (
    <PanelHeader kicker={`${t('lesson.review.kicker')} · ${tx(course.name)}`} title={tx(line.name)}>
      <p className="cb-panel-sub">{t('lesson.review.sub')}</p>
    </PanelHeader>
  );
  return (
    <LessonShell onExit={onExit} progress={progress} streak={streak}>
      <LinePractice
        key={`${round}-${index}-${current.lineId}`}
        course={course}
        line={line}
        mode="review"
        header={header}
        onProgress={(cursor, total) => setPos({ cursor, total })}
        onComplete={(r) => {
          const grade = gradeOf(r);
          const card = review(state.lines[line.id], grade, today);
          const gained = record({ type: 'line_review', line: line.id, grade }) || 0;
          setXp((x) => x + gained);
          setDone((d) => [...d, { item: current, result: r, grade, nextDue: card.due }]);
          return gained;
        }}
        continueLabel={index + 1 < items.length ? t('lesson.review.next') : t('lesson.review.finish')}
        onContinue={() => {
          setPos({ cursor: 0, total: 1 });
          setIndex((i) => i + 1);
        }}
      />
    </LessonShell>
  );
}

function nextLabel(due: string, today: string, t: (k: string) => string, plural: (k: string, n: number) => string) {
  if (due === addDays(today, 1)) return t('lesson.review.tomorrow');
  const days = Math.max(1, Math.round((Date.parse(`${due}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000));
  return plural('lesson.review.inDays', days);
}
