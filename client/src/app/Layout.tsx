// Marco de las páginas con menú: lateral en escritorio y barra inferior en móvil. Las
// pantallas de etapa y de repaso van a pantalla completa, sin este marco.
import { useMemo, type ReactNode } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { courses, dueLines } from '@chessblizzard/shared';
import { useT } from '../i18n';
import { useAuth } from '../state/auth';
import { useProgress } from '../state/progress';
import { useSettings } from '../state/settings';
import { Ghost } from '../theme/Ghost';
import { Icon, type IconName } from './icons';

interface NavItem {
  to: string;
  key: 'learn' | 'review' | 'puzzles' | 'analysis' | 'profile' | 'settings';
  icon: IconName;
}

const NAV: NavItem[] = [
  { to: '/', key: 'learn', icon: 'learn' },
  { to: '/repaso', key: 'review', icon: 'review' },
  { to: '/puzzles', key: 'puzzles', icon: 'puzzle' },
  { to: '/analisis', key: 'analysis', icon: 'analysis' },
  { to: '/perfil', key: 'profile', icon: 'profile' },
  { to: '/ajustes', key: 'settings', icon: 'settings' },
];

/** Líneas pendientes de repaso hoy (contador del menú). */
export function useDueCount(): number {
  const { state, today } = useProgress();
  return useMemo(() => dueLines(courses, state, today).length, [state, today]);
}

export function Logo() {
  const t = useT();
  return (
    <Link to="/" className="app-logo" aria-label={t('app.nav.home')}>
      <span className="app-logo-mark" aria-hidden="true">
        <Ghost size={28} />
      </span>
      <span className="app-logo-text">
        Chess<span>Blizzard</span>
      </span>
    </Link>
  );
}

function DueBadge({ count }: { count: number }) {
  const t = useT();
  if (count <= 0) return null;
  return (
    <span className="app-badge">
      {count > 99 ? '99+' : count}
      <span className="app-visually-hidden"> {t('app.nav.pending')}</span>
    </span>
  );
}

function AccountBox() {
  const t = useT();
  const { user, server } = useAuth();
  const { syncStatus } = useProgress();
  if (!user) {
    return (
      <div className="app-side-guest">
        <span className="app-side-guest-title">
          <Icon name="cloudOff" size={16} />
          {t('app.guest.title')}
        </span>
        <span className="app-side-guest-text">{t('app.guest.text')}</span>
        <span className="app-side-guest-actions">
          <Link to="/registro" className="app-link-strong">
            {t('app.auth.register.cta')}
          </Link>
          <Link to="/entrar" className="app-link">
            {t('app.auth.login.cta')}
          </Link>
        </span>
      </div>
    );
  }
  const offline = server === 'offline' || syncStatus === 'offline';
  return (
    <Link to="/perfil" className="app-side-user">
      <span className="app-avatar" aria-hidden="true">
        {user.displayName.trim().charAt(0).toUpperCase() || '?'}
      </span>
      <span className="app-side-user-text">
        <span className="app-side-user-name">{user.displayName}</span>
        <span className={`app-side-user-sync${offline ? ' is-offline' : ''}`}>
          <Icon name={offline ? 'cloudOff' : 'cloud'} size={14} />
          {t(offline ? 'app.sync.offline' : syncStatus === 'syncing' ? 'app.sync.syncing' : 'app.sync.saved')}
        </span>
      </span>
    </Link>
  );
}

function SideNav() {
  const t = useT();
  const due = useDueCount();
  const { settings, update, mode } = useSettings();
  return (
    <nav className="app-side" aria-label={t('app.nav.main')}>
      <Logo />
      <ul className="app-side-list">
        {NAV.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} end={item.to === '/'} className="app-side-link">
              <Icon name={item.icon} />
              <span className="app-side-text">{t(`app.nav.${item.key}`)}</span>
              {item.key === 'review' && <DueBadge count={due} />}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="app-side-foot">
        <AccountBox />
        <span className="app-eyebrow">{t('app.nav.appearance')}</span>
        <div role="group" aria-label={t('app.settings.mode.title')} className="app-seg app-seg--side">
          <button type="button" className="app-seg-btn" aria-pressed={mode === 'dark'} onClick={() => update({ colorMode: 'dark' })}>
            {t('app.settings.mode.dark')}
          </button>
          <button type="button" className="app-seg-btn" aria-pressed={mode === 'light'} onClick={() => update({ colorMode: 'light' })}>
            {t('app.settings.mode.light')}
          </button>
        </div>
        <Link to="/ajustes" className="app-side-theme">
          <span>{t('app.nav.theme')}</span>
          <strong>{t(`app.theme.${settings.theme}.name`)}</strong>
        </Link>
      </div>
    </nav>
  );
}

function BottomNav() {
  const t = useT();
  const due = useDueCount();
  return (
    <nav className="app-bottom" aria-label={t('app.nav.main')}>
      <ul className="app-bottom-list">
        {NAV.filter((item) => item.key !== 'settings').map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} end={item.to === '/'} className="app-bottom-link">
              <Icon name={item.icon} />
              <span>{t(`app.nav.${item.key}`)}</span>
              {item.key === 'review' && <DueBadge count={due} />}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function AppFrame({ children }: { children: ReactNode }) {
  const t = useT();
  return (
    <div className="app-frame">
      <a
        className="app-skip"
        href="#app-main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('app-main')?.focus();
        }}
      >
        {t('app.skip')}
      </a>
      <SideNav />
      <main id="app-main" className="app-main" tabIndex={-1}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

export function NavLayout() {
  return (
    <AppFrame>
      <Outlet />
    </AppFrame>
  );
}
