// Perfil (/perfil): nivel y XP, racha, estadísticas, medallas, progreso de cada curso
// (con exámenes y sparring) y la cuenta.
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  badges,
  courseCompletion,
  courses,
  currentStreak,
  DAILY_GOAL,
  dailyXp,
  levelInfo,
  stageStatuses,
  type Course,
  type ProgressState,
} from '@chessblizzard/shared';
import { useT, useTx } from '../../i18n';
import { useAuth } from '../../state/auth';
import { useProgress } from '../../state/progress';
import { Ghost } from '../../theme/Ghost';
import { AccountSection } from '../AccountSection';
import { rememberCourse, useDocumentTitle, useFormat, usePlural } from '../hooks';
import { Icon, type IconName } from '../icons';
import { Bar, PageHeader } from '../ui';

const BADGE_ICONS: Record<string, IconName> = {
  'first-stage': 'flag',
  'streak-7': 'flame',
  'puzzles-10': 'puzzle',
  'first-win': 'spar',
  'first-summit': 'mountain',
  'all-summits': 'crown',
};

function CourseCard({ course, state }: { course: Course; state: ProgressState }) {
  const t = useT();
  const tx = useTx();
  const f = useFormat();
  const plural = usePlural();
  const completion = courseCompletion(course, state);
  const statuses = stageStatuses(course, state);
  const exam = state.exams[course.id];
  const spar = state.sparring[course.id];
  let index = 0;
  const camps = course.camps.map((camp) => {
    const slice = statuses.slice(index, index + camp.stages.length);
    index += camp.stages.length;
    return { camp, done: slice.filter((s) => s === 'done').length, total: slice.length };
  });
  return (
    <article className="app-card app-course-card" aria-labelledby={`app-cc-${course.id}`}>
      <div className="app-card-head">
        <div>
          <h3 id={`app-cc-${course.id}`} className="app-h3">
            {tx(course.name)}
          </h3>
          <span className="app-card-meta">{tx(course.vs) || t(course.side === 'w' ? 'app.side.w' : 'app.side.b')}</span>
        </div>
        <strong className="app-course-pct">{f.pct(completion.ratio)}</strong>
      </div>
      <Bar ratio={completion.ratio} label={t('app.learn.progressLabel', { course: tx(course.name) })} />
      <ul className="app-camp-list">
        {camps.map(({ camp, done, total }) => (
          <li key={camp.id} className={done === total && total > 0 ? 'is-done' : ''}>
            <Icon name={done === total && total > 0 ? 'check' : 'flag'} size={16} strokeWidth={2.4} />
            <span className="app-camp-list-name">{tx(camp.name)}</span>
            <span className="app-camp-list-count">{plural('app.learn.campCount', total, { done })}</span>
          </li>
        ))}
      </ul>
      <dl className="app-course-facts">
        <div>
          <dt>{t('app.profile.exam')}</dt>
          <dd>
            {exam
              ? exam.passedAt
                ? t('app.profile.examPassed', { score: f.pct(exam.best), date: f.shortDate(exam.passedAt) })
                : t('app.profile.examBest', { score: f.pct(exam.best) })
              : t('app.profile.examNone')}
          </dd>
        </div>
        <div>
          <dt>{t('app.profile.sparring')}</dt>
          <dd>
            {spar && spar.games > 0
              ? `${plural('app.profile.games', spar.games)} · ${t('app.profile.wdl', { w: spar.wins, d: spar.draws, l: spar.losses })}`
              : t('app.profile.sparringNone')}
          </dd>
        </div>
      </dl>
      <Link to="/" className="app-link app-course-card-link" onClick={() => rememberCourse(course.id)}>
        {t('app.profile.openCourse')}
        <Icon name="arrowRight" size={16} />
      </Link>
    </article>
  );
}

export default function ProfilePage() {
  const t = useT();
  const f = useFormat();
  const plural = usePlural();
  const { user } = useAuth();
  const { state, today } = useProgress();
  useDocumentTitle(t('app.nav.profile'));

  const lv = levelInfo(state.xp);
  const streak = currentStreak(state, today);
  const daily = dailyXp(state, today);
  const medals = useMemo(() => badges(state, courses), [state]);
  const earned = medals.filter((b) => b.earned).length;
  const stats = [
    { icon: 'flag' as IconName, value: Object.keys(state.stages).length, label: t('app.profile.stat.stages') },
    { icon: 'line' as IconName, value: Object.keys(state.lines).length, label: t('app.profile.stat.lines') },
    { icon: 'puzzle' as IconName, value: Object.values(state.puzzles).filter((p) => p.solved).length, label: t('app.profile.stat.puzzles') },
    { icon: 'mountain' as IconName, value: Object.values(state.exams).filter((e) => e.passedAt).length, label: t('app.profile.stat.summits') },
  ];

  return (
    <div className="app-page">
      <PageHeader eyebrow={t('app.nav.profile')} title={user ? user.displayName : t('app.profile.guest')}>
        <Link to="/ajustes" className="app-btn app-btn--outline app-btn--compact">
          <Icon name="settings" size={18} />
          {t('app.nav.settings')}
        </Link>
      </PageHeader>

      <div className="app-profile-top">
        <section className="app-card app-level-card" aria-labelledby="app-level-title">
          <span className="app-level-ghost app-float" aria-hidden="true">
            <Ghost size={72} mood="happy" />
          </span>
          <div className="app-level-body">
            <span className="app-eyebrow">{t('app.profile.levelEyebrow')}</span>
            <h2 id="app-level-title" className="app-level-title">
              {t('app.stats.levelLong', { n: lv.level })}
            </h2>
            <Bar ratio={lv.progress} tone="accent" size="l" label={t('app.profile.levelBar', { n: lv.level + 1 })} />
            <p className="app-card-meta">
              {t('app.profile.xpTotal', { xp: f.num(state.xp) })} · {t('app.profile.xpToNext', { xp: f.num(lv.next - state.xp), n: lv.level + 1 })}
            </p>
          </div>
        </section>

        <section className="app-card app-streak-card" aria-labelledby="app-streak-title">
          <div className="app-streak-main">
            <Icon name="flame" size={40} className="app-ic-warn" />
            <div>
              <h2 id="app-streak-title" className="app-eyebrow">
                {t('app.stats.streak')}
              </h2>
              <span className="app-streak-value">{plural('app.profile.days', streak)}</span>
            </div>
          </div>
          <p className="app-card-meta">{t('app.profile.bestStreak', { days: plural('app.profile.days', state.streak.best) })}</p>
          <div className="app-streak-goal">
            <div className="app-learn-progress-row">
              <span className="app-tx2">{t('app.goal.title')}</span>
              <span className="app-tx2">{t('app.goal.value', { xp: daily, goal: DAILY_GOAL })}</span>
            </div>
            <Bar ratio={daily / DAILY_GOAL} tone="warn" label={t('app.goal.title')} />
          </div>
        </section>
      </div>

      <section aria-labelledby="app-stats-title" className="app-profile-section">
        <h2 id="app-stats-title" className="app-visually-hidden">
          {t('app.profile.stats')}
        </h2>
        <ul className="app-stat-grid">
          {stats.map((s) => (
            <li key={s.label} className="app-card app-stat">
              <Icon name={s.icon} size={22} className="app-ic-accent" />
              <span className="app-stat-value">{f.num(s.value)}</span>
              <span className="app-stat-label">{s.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="app-badges-title" className="app-profile-section">
        <div className="app-section-head">
          <h2 id="app-badges-title" className="app-h2">
            {t('app.profile.badges')}
          </h2>
          <span className="app-card-meta">{t('app.profile.badgesCount', { n: earned, total: medals.length })}</span>
        </div>
        <ul className="app-badge-grid">
          {medals.map((b) => (
            <li key={b.id} className={`app-card app-medal${b.earned ? ' is-earned' : ''}`}>
              <span className="app-medal-icon" aria-hidden="true">
                <Icon name={b.earned ? (BADGE_ICONS[b.id] ?? 'star') : 'lock'} size={26} strokeWidth={2.2} />
              </span>
              <span className="app-medal-text">
                <span className="app-medal-name">{t(`app.badge.${b.id}.name`)}</span>
                <span className="app-medal-desc">{t(`app.badge.${b.id}.desc`)}</span>
                <span className="app-medal-state">{t(b.earned ? 'app.profile.badgeEarned' : 'app.profile.badgeLocked')}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="app-courses-title" className="app-profile-section">
        <h2 id="app-courses-title" className="app-h2">
          {t('app.profile.courses')}
        </h2>
        <div className="app-course-cards">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} state={state} />
          ))}
        </div>
      </section>

      <section aria-labelledby="app-account-heading" className="app-profile-section">
        <h2 className="app-h2" id="app-account-heading">
          {t('app.settings.tab.account')}
        </h2>
        <AccountSection headingId="app-account-title" headingLevel={3} />
      </section>
    </div>
  );
}
