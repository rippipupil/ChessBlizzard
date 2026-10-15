// Entrar (/entrar) y crear cuenta (/registro). Al entrar, el progreso de invitado se sube a
// la cuenta (lo hace el adaptador de sincronización) y los ajustes de la cuenta mandan.
import { useId, useRef, useState, type FormEvent, type InputHTMLAttributes, type ReactNode, type Ref } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useT } from '../../i18n';
import { isApiError } from '../../state/api';
import { authErrorKey, useAuth } from '../../state/auth';
import { Ghost } from '../../theme/Ghost';
import { useDocumentTitle } from '../hooks';
import { Icon } from '../icons';
import { useToast } from '../Toaster';

type Mode = 'login' | 'register';
type FieldName = 'name' | 'email' | 'password';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Field({
  id,
  label,
  error,
  hint,
  trailing,
  inputRef,
  ...input
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  trailing?: ReactNode;
  inputRef?: Ref<HTMLInputElement>;
} & InputHTMLAttributes<HTMLInputElement>) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`app-field${error ? ' is-invalid' : ''}`}>
      <label htmlFor={id} className="app-field-label">
        {label}
      </label>
      <div className="app-field-control">
        <input id={id} ref={inputRef} className="app-input" aria-invalid={error ? true : undefined} aria-describedby={describedBy} {...input} />
        {trailing}
      </div>
      {hint && (
        <span id={`${id}-hint`} className="app-field-hint">
          {hint}
        </span>
      )}
      {error && (
        <span id={`${id}-error`} className="app-field-error">
          <Icon name="info" size={16} />
          {error}
        </span>
      )}
    </div>
  );
}

export function AuthPage({ mode }: { mode: Mode }) {
  const t = useT();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, register, server } = useAuth();
  const uid = useId();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldName, string>>>({});
  const refs = { name: useRef<HTMLInputElement>(null), email: useRef<HTMLInputElement>(null), password: useRef<HTMLInputElement>(null) };
  const register_ = mode === 'register';
  useDocumentTitle(t(register_ ? 'app.auth.register.title' : 'app.auth.login.title'));

  const from = (location.state as { from?: string } | null)?.from ?? '/';
  if (user && !busy) return <Navigate to="/perfil" replace />;

  const validate = (): Partial<Record<FieldName, string>> => {
    const errs: Partial<Record<FieldName, string>> = {};
    if (register_) {
      const n = name.trim();
      if (n.length < 2 || n.length > 40) errs.name = t('app.auth.error.name');
    }
    if (!EMAIL_RE.test(email.trim())) errs.email = t('app.auth.error.email');
    if (register_ ? password.length < 8 : password.length === 0) errs.password = t(register_ ? 'app.auth.error.passwordShort' : 'app.auth.error.passwordEmpty');
    return errs;
  };

  const focusFirst = (errs: Partial<Record<FieldName, string>>) => {
    const first = (['name', 'email', 'password'] as FieldName[]).find((f) => errs[f]);
    if (first) refs[first].current?.focus();
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setFieldErrors(errs);
    setError(null);
    if (Object.keys(errs).length > 0) {
      focusFirst(errs);
      return;
    }
    setBusy(true);
    try {
      const u = register_ ? await register({ email, password, displayName: name }) : await login(email, password);
      toast(t(register_ ? 'app.auth.register.done' : 'app.auth.login.done', { name: u.displayName }), 'success');
      navigate(from, { replace: true });
    } catch (err) {
      setBusy(false);
      // El servidor indica el campo que no acepta: se marca ese campo.
      if (isApiError(err) && err.code === 'validation' && err.details.length > 0) {
        const byField: Partial<Record<FieldName, string>> = {};
        for (const d of err.details) {
          if (d.path === 'displayName') byField.name = t('app.auth.error.name');
          else if (d.path === 'email') byField.email = t('app.auth.error.email');
          else if (d.path === 'password') byField.password = t('app.auth.error.passwordShort');
        }
        if (Object.keys(byField).length > 0) {
          setFieldErrors(byField);
          focusFirst(byField);
          return;
        }
      }
      setError(t(authErrorKey(err)));
    }
  };

  return (
    <div className="app-page app-page--center">
      <section className="app-card app-auth" aria-labelledby={`${uid}-title`}>
        <div className="app-auth-head">
          <span className="app-float" aria-hidden="true">
            <Ghost size={64} mood={error ? 'sad' : 'happy'} />
          </span>
          <h1 id={`${uid}-title`} className="app-h1 app-auth-title">
            {t(register_ ? 'app.auth.register.title' : 'app.auth.login.title')}
          </h1>
          <p className="app-card-text">{t(register_ ? 'app.auth.register.lead' : 'app.auth.login.lead')}</p>
        </div>

        {server === 'offline' && !error && (
          <p className="app-alert app-alert--info">
            <Icon name="cloudOff" size={18} />
            {t('app.account.serverDown')}
          </p>
        )}
        {error && (
          <p className="app-alert" role="alert">
            <Icon name="info" size={18} />
            {error}
          </p>
        )}

        <form className="app-form" noValidate onSubmit={onSubmit}>
          {register_ && (
            <Field
              id={`${uid}-name`}
              inputRef={refs.name}
              label={t('app.auth.field.name')}
              hint={t('app.auth.field.nameHint')}
              error={fieldErrors.name}
              type="text"
              autoComplete="nickname"
              maxLength={40}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <Field
            id={`${uid}-email`}
            inputRef={refs.email}
            label={t('app.auth.field.email')}
            error={fieldErrors.email}
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={254}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Field
            id={`${uid}-password`}
            inputRef={refs.password}
            label={t('app.auth.field.password')}
            hint={register_ ? t('app.auth.field.passwordHint') : undefined}
            error={fieldErrors.password}
            type={show ? 'text' : 'password'}
            autoComplete={register_ ? 'new-password' : 'current-password'}
            maxLength={200}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            trailing={
              <button
                type="button"
                className="app-field-btn"
                aria-pressed={show}
                aria-label={t(show ? 'app.auth.field.hide' : 'app.auth.field.show')}
                onClick={() => setShow((s) => !s)}
              >
                <Icon name={show ? 'eyeOff' : 'eye'} size={20} />
              </button>
            }
          />
          <button type="submit" className="app-btn app-btn--primary app-btn--block" disabled={busy}>
            {busy ? t('app.auth.wait') : t(register_ ? 'app.auth.register.submit' : 'app.auth.login.submit')}
          </button>
        </form>

        {register_ && (
          <p className="app-auth-note">
            <Icon name="cloud" size={18} />
            {t('app.auth.register.note')}
          </p>
        )}
        <p className="app-auth-switch">
          {t(register_ ? 'app.auth.register.switch' : 'app.auth.login.switch')}{' '}
          <Link to={register_ ? '/entrar' : '/registro'} state={location.state} className="app-link-strong">
            {t(register_ ? 'app.auth.login.cta' : 'app.auth.register.cta')}
          </Link>
        </p>
        <Link to="/" className="app-link app-auth-guest">
          {t('app.auth.guest')}
        </Link>
      </section>
    </div>
  );
}

export function LoginPage() {
  return <AuthPage mode="login" />;
}

export function RegisterPage() {
  return <AuthPage mode="register" />;
}
