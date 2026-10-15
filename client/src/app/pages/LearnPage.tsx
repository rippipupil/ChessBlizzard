// Inicio "Aprender": pestañas de los cursos, la montaña del curso elegido y la columna con
// racha, XP y nivel, la siguiente etapa, el repaso de hoy, el objetivo diario y un consejo.
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  courseCompletion,
  courses,
  DAILY_GOAL,
  dailyXp,
  dueLines,
  flattenStages,
  stageStatuses,
  XP,
  type Course,
  type FlatStage,
  type ProgressState,
  type Stage,
  type StageStatus,
} from '@chessblizzard/shared';
import { useT, useTx } from '../../i18n';
import { useAuth } from '../../state/auth';
import { useProgress } from '../../state/progress';
import { useDocumentTitle, useFormat, usePlural, useSelectedCourse } from '../hooks';
import { Icon } from '../icons';
import { Mountain } from '../mountain/Mountain';
import { useToast } from '../Toaster';
import { Bar, GhostTip, RichText, StatChips, usePlainText } from '../ui';

function useSideText() {
  const t = useT();
  const tx = useTx();
  return (c: Course) => tx(c.vs) || t(c.side === 'w' ? 'app.side.w' : 'app.side.b');
}

function CourseTabs({ course, onPick }: { course: Course; onPick(id: string): void }) {
  const t = useT();
  const tx = useTx();
  const side = useSideText();
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const last = courses.length - 1;
    const next = e.key === 'ArrowRight' ? (i === last ? 0 : i + 1) : e.key === 'ArrowLeft' ? (i === 0 ? last : i - 1) : e.key === 'Home' ? 0 : e.key === 'End' ? last : -1;
    if (next < 0) return;
    e.preventDefault();
    onPick(courses[next].id);
    refs.current[next]?.focus();
  };
  return (
    <div role="tablist" aria-label={t('app.learn.courses')} className="app-course-tabs">
      {courses.map((c, i) => {
        const selected = c.id === course.id;
        return (
          <button
            key={c.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            id={`app-tab-${c.id}`}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls="app-course-panel"
            tabIndex={selected ? 0 : -1}
            className="app-course-tab"
            onClick={() => onPick(c.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            <span className="app-course-tab-name">{tx(c.name)}</span>
            <span className="app-course-tab-side">{side(c)}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Selector de curso de la cabecera móvil. */
function CoursePicker({ course, onPick, state }: { course: Course; onPick(id: string): void; state: ProgressState }) {
  const t = useT();
  const tx = useTx();
  const f = useFormat();
  const side = useSideText();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    wrapRef.current?.querySelector<HTMLButtonElement>('.app-picker-option[aria-pressed="true"]')?.focus();
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="app-picker" ref={wrapRef}>
      <button ref={btnRef} type="button" className="app-picker-btn" aria-expanded={open} aria-controls="app-course-menu" onClick={() => setOpen((o) => !o)}>
        <span className="app-picker-text">
          <span className="app-picker-name">{tx(course.name)}</span>
          <span className="app-picker-side">{side(course)}</span>
        </span>
        <span className="app-visually-hidden">{t('app.learn.pickCourse')}</span>
        <Icon name="chevronDown" size={16} strokeWidth={2.4} />
      </button>
      {open && (
        <ul id="app-course-menu" className="app-picker-menu" aria-label={t('app.learn.courses')}>
          {courses.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className="app-picker-option"
                aria-pressed={c.id === course.id}
                onClick={() => {
                  onPick(c.id);
                  setOpen(false);
                  btnRef.current?.focus();
                }}
              >
                <span className="app-picker-text">
                  <span className="app-picker-name">{tx(c.name)}</span>
                  <span className="app-picker-side">{side(c)}</span>
                </span>
                <span className="app-picker-pct">{f.pct(courseCompletion(c, state).ratio)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NextStageCard({ course, flat, statuses }: { course: Course; flat: FlatStage[]; statuses: StageStatus[] }) {
  const t = useT();
  const tx = useTx();
  const plural = usePlural();
  const current = statuses.indexOf('current');
  if (current < 0) {
    return (
      <section className="app-card app-card--accent app-next" aria-labelledby="app-next-title">
        <span className="app-card-eyebrow app-accent-text">{t('app.learn.summit.eyebrow')}</span>
        <h2 id="app-next-title" className="app-h2">
          {t('app.learn.summit.title')}
        </h2>
        <p className="app-card-text">{plural('app.learn.summit.text', flat.length, { course: tx(course.name) })}</p>
        <Link to="/repaso" className="app-btn app-btn--primary">
          {t('app.learn.summit.cta')}
        </Link>
      </section>
    );
  }
  const { stage, campIndex } = flat[current];
  const camp = course.camps[campIndex];
  return (
    <section className="app-card app-card--accent app-next" aria-labelledby="app-next-title">
      <span className="app-card-eyebrow app-accent-text">{t('app.learn.next', { camp: tx(camp.name) })}</span>
      <h2 id="app-next-title" className="app-h2">
        {tx(stage.title)}
      </h2>
      {(tx(stage.intro) || tx(stage.subtitle)) && (
        <p className="app-card-text app-next-intro">
          <RichText text={tx(stage.intro) || tx(stage.subtitle)} />
        </p>
      )}
      <Link to={`/curso/${course.id}/${stage.id}`} className="app-btn app-btn--primary">
        {t('app.learn.startXp', { xp: XP.stage })}
      </Link>
    </section>
  );
}

function ReviewTodayCard({ state, today }: { state: ProgressState; today: string }) {
  const t = useT();
  const tx = useTx();
  const plain = usePlainText();
  const plural = usePlural();
  const due = useMemo(() => dueLines(courses, state, today), [state, today]);
  const learned = Object.keys(state.lines).length;
  const shown = due.slice(0, 3);
  return (
    <section className="app-card app-review-card" aria-labelledby="app-review-title">
      <div className="app-card-head">
        <h2 id="app-review-title" className="app-h3">
          {t('app.review.today')}
        </h2>
        <span className="app-big-count app-warn-text" aria-label={plural('app.review.dueCount', due.length)}>
          {due.length}
        </span>
      </div>
      {due.length === 0 ? (
        <p className="app-card-text">{t(learned === 0 ? 'app.review.emptyNew' : 'app.review.emptyDone')}</p>
      ) : (
        <>
          <p className="app-card-text">{plural('app.review.minutes', Math.max(1, Math.round(due.length * 0.8)))}</p>
          <ul className="app-due-list">
            {shown.map((d) => {
              const line = d.course.lines.find((l) => l.id === d.lineId);
              return (
                <li key={d.lineId}>
                  <span className="app-due-name">{line ? plain(tx(line.name)) : d.lineId}</span>
                  <span className="app-due-course">{tx(d.course.name)}</span>
                </li>
              );
            })}
          </ul>
          {due.length > shown.length && <p className="app-card-note">{plural('app.review.more', due.length - shown.length)}</p>}
          <Link to="/repaso" className="app-btn app-btn--outline">
            {t('app.review.start')}
          </Link>
        </>
      )}
    </section>
  );
}

function DailyGoalCard({ state, today }: { state: ProgressState; today: string }) {
  const t = useT();
  const xp = dailyXp(state, today);
  return (
    <section className="app-card app-goal-card" aria-labelledby="app-goal-title">
      <div className="app-card-head">
        <h2 id="app-goal-title" className="app-h3">
          {t('app.goal.title')}
        </h2>
        <span className="app-card-meta">{t('app.goal.value', { xp: Math.min(xp, 9999), goal: DAILY_GOAL })}</span>
      </div>
      <Bar ratio={xp / DAILY_GOAL} tone="warn" size="l" label={t('app.goal.title')} />
      {xp >= DAILY_GOAL && (
        <p className="app-card-note app-goal-done">
          <Icon name="check" size={16} strokeWidth={3} /> {t('app.goal.done')}
        </p>
      )}
    </section>
  );
}

/** Consejo de la mascota según el momento del curso. */
function useTip(course: Course, statuses: StageStatus[], dueCount: number, today: string): string {
  const t = useT();
  const done = statuses.filter((s) => s === 'done').length;
  if (done === 0) return t('app.tip.start');
  if (dueCount > 0) return t('app.tip.review');
  if (statuses.indexOf('current') < 0) return t('app.tip.summit');
  const flat = flattenStages(course);
  const next = flat[statuses.indexOf('current')]?.stage;
  if (next?.type === 'branch') return t('app.tip.branch');
  if (next?.type === 'exam') return t('app.tip.exam');
  const day = Number(today.slice(8, 10)) || 0;
  return t(`app.tip.general.${day % 4}`);
}

const REF_ICONS = { book: 'book', game: 'puzzle', player: 'user' } as const;

/** Sobre la apertura: lema, historia y lecturas recomendadas del curso. */
function CourseInfoCard({ course }: { course: Course }) {
  const t = useT();
  const tx = useTx();
  const tagline = tx(course.tagline);
  const history = tx(course.history);
  if (!tagline && !history && course.references.length === 0) return null;
  return (
    <section className="app-card app-course-info" aria-labelledby="app-course-info-title">
      <span className="app-card-eyebrow app-tx2">{t('app.learn.about')}</span>
      <h2 id="app-course-info-title" className="app-h3">
        {tx(course.name)}
        {course.eco && <span className="app-eco">{course.eco}</span>}
      </h2>
      {tagline && (
        <p className="app-card-text">
          <RichText text={tagline} />
        </p>
      )}
      {history && (
        <details className="app-details">
          <summary>{t('app.learn.history')}</summary>
          <p className="app-card-text">
            <RichText text={history} />
          </p>
        </details>
      )}
      {course.references.length > 0 && (
        <details className="app-details">
          <summary>{t('app.learn.references', { n: course.references.length })}</summary>
          <ul className="app-refs">
            {course.references.map((r) => (
              <li key={`${r.kind}-${r.title}`}>
                <Icon name={REF_ICONS[r.kind]} size={16} />
                <span>
                  <strong>{r.title}</strong>
                  {r.author && <span className="app-tx2"> · {r.author}</span>}
                  {r.year && <span className="app-tx2"> ({r.year})</span>}
                  <span className="app-ref-note">
                    <RichText text={tx(r.note)} />
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

function GuestBanner({ show }: { show: boolean }) {
  const t = useT();
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem('cb.guestNotice.v1') === 'hidden';
    } catch {
      return false;
    }
  });
  if (!show || hidden) return null;
  return (
    <div className="app-guest-banner">
      <Icon name="cloudOff" size={18} />
      <p>
        {t('app.guest.banner')}{' '}
        <Link to="/registro" className="app-link-strong">
          {t('app.auth.register.cta')}
        </Link>
      </p>
      <button
        type="button"
        className="app-icon-btn"
        aria-label={t('app.guest.dismiss')}
        onClick={() => {
          setHidden(true);
          try {
            localStorage.setItem('cb.guestNotice.v1', 'hidden');
          } catch {
            // Ignorado.
          }
        }}
      >
        <Icon name="close" size={16} />
      </button>
    </div>
  );
}

export default function LearnPage() {
  const t = useT();
  const tx = useTx();
  const plural = usePlural();
  const f = useFormat();
  const toast = useToast();
  const { user } = useAuth();
  const { state, today } = useProgress();
  const [course, pickCourse] = useSelectedCourse();
  useDocumentTitle(t('app.nav.learn'));

  const flat = useMemo(() => flattenStages(course), [course]);
  const statuses = useMemo(() => stageStatuses(course, state), [course, state]);
  const completion = courseCompletion(course, state);
  const current = statuses.indexOf('current');
  const currentCamp = course.camps[flat[current < 0 ? flat.length - 1 : current]?.campIndex ?? 0];
  const dueCount = useMemo(() => dueLines(courses, state, today).length, [state, today]);
  const tip = useTip(course, statuses, dueCount, today);

  const onLocked = (stage: Stage) => {
    const next = current >= 0 ? flat[current].stage : null;
    toast(
      next ? t('app.learn.locked', { stage: tx(stage.title), next: tx(next.title) }) : t('app.learn.lockedShort', { stage: tx(stage.title) }),
      'warn',
    );
  };

  const progressText = plural('app.learn.stages', completion.total, { done: completion.done });

  return (
    <div className="app-learn">
      <section className="app-learn-main" aria-labelledby="app-learn-title">
        <div className="app-learn-mobile-head">
          <CoursePicker course={course} onPick={pickCourse} state={state} />
          <StatChips compact />
        </div>
        <GuestBanner show={!user && state.xp > 0} />
        <CourseTabs course={course} onPick={pickCourse} />

        <div id="app-course-panel" role="tabpanel" aria-labelledby={`app-tab-${course.id}`} className="app-course-panel">
          <div className="app-learn-head">
            <div className="app-learn-title">
              <span className="app-eyebrow">{t('app.learn.eyebrow')}</span>
              <h1 id="app-learn-title" className="app-h1">
                {tx(course.name)}
              </h1>
            </div>
            <div className="app-learn-progress">
              <div className="app-learn-progress-row">
                <span className="app-tx2">
                  {progressText}
                  <span className="app-learn-progress-camp"> · {tx(currentCamp?.name)}</span>
                </span>
                <strong>{f.pct(completion.ratio)}</strong>
              </div>
              <Bar ratio={completion.ratio} label={t('app.learn.progressLabel', { course: tx(course.name) })} />
            </div>
          </div>
          <Mountain course={course} statuses={statuses} onLocked={onLocked} />
        </div>
      </section>

      <aside className="app-learn-aside" aria-label={t('app.learn.aside')}>
        <StatChips className="app-learn-chips" />
        <NextStageCard course={course} flat={flat} statuses={statuses} />
        <ReviewTodayCard state={state} today={today} />
        <DailyGoalCard state={state} today={today} />
        <GhostTip text={tip} />
        <CourseInfoCard course={course} />
      </aside>
    </div>
  );
}
