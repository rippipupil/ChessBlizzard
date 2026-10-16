// Cuenta: invitación a crear cuenta (modo invitado) o datos de la sesión y cierre de sesión.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ACCOUNTS_ENABLED } from '../config';
import { useT } from '../i18n';
import { useAuth } from '../state/auth';
import { useProgress } from '../state/progress';
import { Ghost } from '../theme/Ghost';
import { useFormat } from './hooks';
import { Icon } from './icons';
import { useToast } from './Toaster';

export function AccountSection({ headingId, headingLevel = 2 }: { headingId: string; headingLevel?: 2 | 3 }) {
  const t = useT();
  const f = useFormat();
  const toast = useToast();
  const { user, server, logout } = useAuth();
  const { syncStatus } = useProgress();
  const [leaving, setLeaving] = useState(false);
  const H = headingLevel === 2 ? 'h2' : 'h3';

  if (!user) {
    return (
      <section className="app-card app-account" aria-labelledby={headingId}>
        <div className="app-account-row">
          <span className="app-account-ghost" aria-hidden="true">
            <Ghost size={52} mood="thinking" />
          </span>
          <div className="app-account-text">
            <H id={headingId} className="app-h3">
              {t('app.account.guestTitle')}
            </H>
            <p className="app-card-text">{t(ACCOUNTS_ENABLED ? 'app.account.guestText' : 'app.account.localText')}</p>
            {server === 'offline' && (
              <p className="app-card-note">
                <Icon name="cloudOff" size={16} /> {t('app.account.serverDown')}
              </p>
            )}
          </div>
        </div>
        {ACCOUNTS_ENABLED && (
          <div className="app-account-actions">
            <Link to="/registro" className="app-btn app-btn--primary">
              {t('app.auth.register.cta')}
            </Link>
            <Link to="/entrar" className="app-btn app-btn--outline">
              {t('app.auth.login.cta')}
            </Link>
          </div>
        )}
      </section>
    );
  }

  const offline = server === 'offline' || syncStatus === 'offline';
  return (
    <section className="app-card app-account" aria-labelledby={headingId}>
      <div className="app-account-row">
        <span className="app-avatar app-avatar--l" aria-hidden="true">
          {user.displayName.trim().charAt(0).toUpperCase() || '?'}
        </span>
        <div className="app-account-text">
          <H id={headingId} className="app-h3">
            {user.displayName}
          </H>
          <span className="app-tx2">{user.email}</span>
          {user.createdAt && <span className="app-card-note">{t('app.account.since', { date: f.date(user.createdAt) })}</span>}
        </div>
      </div>
      <p className={`app-sync-line${offline ? ' is-offline' : ''}`}>
        <Icon name={offline ? 'cloudOff' : 'cloud'} size={18} />
        {t(offline ? 'app.account.syncOffline' : syncStatus === 'syncing' ? 'app.sync.syncing' : 'app.account.synced')}
      </p>
      <div className="app-account-actions">
        <button
          type="button"
          className="app-btn app-btn--outline"
          disabled={leaving}
          onClick={async () => {
            setLeaving(true);
            await logout();
            toast(t('app.account.loggedOut'), 'info');
          }}
        >
          <Icon name="logout" size={18} />
          {t('app.account.logout')}
        </button>
      </div>
    </section>
  );
}
