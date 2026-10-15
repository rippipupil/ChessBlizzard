// Cuenta del usuario: sesión, registro, inicio y cierre de sesión.
//
// Sin sesión la app funciona entera en modo invitado (ajustes y progreso en el navegador).
// Con sesión:
//  - Los ajustes de la cuenta mandan: se aplican al iniciar sesión y cada cambio posterior se
//    envía con PATCH /api/me/settings. Una cuenta recién creada hereda los del invitado.
//  - El progreso se sincroniza con el adaptador `sync` de ProgressProvider: al entrar se sube
//    el de invitado (POST /api/progress/import) y después cada evento (POST /api/progress/events).
// El usuario se guarda en el navegador para arrancar al instante y seguir funcionando sin
// conexión; la sesión se confirma en segundo plano con GET /api/auth/me.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { DEFAULT_SETTINGS, sanitizeSettings, type Settings } from '@chessblizzard/shared';
import { api, isApiError, type RegisterInput, type User } from './api';
import type { ProgressSync } from './progress';
import { useSettings } from './settings';

const USER_KEY = 'cb.user.v1';

/** unknown: aún no se sabe · online: responde · offline: no se puede contactar. */
export type ServerStatus = 'unknown' | 'online' | 'offline';

interface AuthContextValue {
  user: User | null;
  /** Se está comprobando la sesión con el servidor. */
  checking: boolean;
  server: ServerStatus;
  /** Adaptador de sincronización del progreso (null en modo invitado). */
  sync: ProgressSync | null;
  /** Lanzan ApiError (ver authErrorKey para el mensaje). */
  login(email: string, password: string): Promise<User>;
  register(input: RegisterInput): Promise<User>;
  logout(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function parseUser(raw: string | null): User | null {
  if (!raw) return null;
  try {
    const u = JSON.parse(raw) as User;
    return u && typeof u.id === 'string' && typeof u.email === 'string' ? u : null;
  } catch {
    return null;
  }
}

function loadUser(): User | null {
  try {
    return parseUser(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

function saveUser(user: User | null) {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch {
    // Sin almacenamiento: la sesión se comprobará en cada carga.
  }
}

const normalize = (s: Partial<Settings> | undefined): Settings => ({ ...DEFAULT_SETTINGS, ...sanitizeSettings(s) });

function diffSettings(base: Settings, next: Settings): Partial<Settings> | null {
  const out: Record<string, unknown> = {};
  let changed = false;
  for (const key of Object.keys(next) as (keyof Settings)[]) {
    if (base[key] !== next[key]) {
      out[key] = next[key];
      changed = true;
    }
  }
  return changed ? (out as Partial<Settings>) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { settings, replace: replaceSettings } = useSettings();
  const [user, setUser] = useState<User | null>(loadUser);
  const [checking, setChecking] = useState(true);
  const [server, setServer] = useState<ServerStatus>('unknown');
  /** Ajustes que tiene la cuenta en el servidor (null sin sesión). */
  const accountSettings = useRef<Settings | null>(user ? normalize(user.settings) : null);
  const userRef = useRef(user);
  /** Cambios de ajustes enviados desde que se abrió la app. */
  const patches = useRef(0);

  useEffect(() => {
    userRef.current = user;
    saveUser(user);
  }, [user]);

  const adopt = useCallback(
    (u: User, useAccountSettings: boolean) => {
      const s = normalize(u.settings);
      accountSettings.current = s;
      if (useAccountSettings) replaceSettings(s);
      setUser({ ...u, settings: s });
      setServer('online');
    },
    [replaceSettings],
  );

  const drop = useCallback(() => {
    accountSettings.current = null;
    setUser(null);
  }, []);

  // Comprobar la sesión al cargar la app.
  useEffect(() => {
    let cancelled = false;
    api
      .me()
      // Si el usuario ya ha cambiado algún ajuste mientras tanto, no se lo pisamos.
      .then((u) => !cancelled && adopt(u, patches.current === 0))
      .catch((err: unknown) => {
        if (cancelled) return;
        if (isApiError(err) && err.code === 'unauthorized') {
          drop();
          setServer('online');
        } else {
          setServer('offline');
        }
      })
      .finally(() => !cancelled && setChecking(false));
    return () => {
      cancelled = true;
    };
  }, [adopt, drop]);

  // Con sesión, cada cambio de ajustes se envía a la cuenta.
  useEffect(() => {
    const base = accountSettings.current;
    if (!user || !base) return;
    const patch = diffSettings(base, settings);
    if (!patch) return;
    accountSettings.current = { ...base, ...patch };
    patches.current += 1;
    api
      .updateSettings(patch)
      .then((u) => setUser((cur) => (cur && cur.id === u.id ? { ...u, settings: normalize(u.settings) } : cur)))
      .catch((err: unknown) => {
        if (isApiError(err) && err.code === 'unauthorized') {
          drop();
          return;
        }
        // No se ha guardado: se marca como pendiente para que salga en el siguiente envío.
        const cur = accountSettings.current;
        if (!cur) return;
        const reverted: Record<string, unknown> = { ...cur };
        for (const key of Object.keys(patch) as (keyof Settings)[]) {
          if (cur[key] === patch[key]) reverted[key] = base[key];
        }
        accountSettings.current = reverted as unknown as Settings;
      });
  }, [settings, user, drop]);

  // Inicio o cierre de sesión en otra pestaña.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== USER_KEY) return;
      const next = parseUser(e.newValue);
      if (!next) {
        if (userRef.current) drop();
      } else if (next.id !== userRef.current?.id) {
        accountSettings.current = normalize(next.settings);
        setUser(next);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [drop]);

  const userId = user?.id ?? null;
  const sync = useMemo<ProgressSync | null>(() => {
    if (!userId) return null;
    const guard = <T,>(p: Promise<T>): Promise<T> =>
      p.then(
        (v) => {
          setServer('online');
          return v;
        },
        (err: unknown) => {
          if (isApiError(err)) {
            if (err.code === 'unauthorized') drop();
            else if (err.code === 'network' || err.code === 'server') setServer('offline');
          }
          throw err;
        },
      );
    return {
      attach: (local) => guard(api.importProgress(local)),
      push: (events) => guard(api.pushEvents(events)).then((r) => r.progress),
      pull: () => guard(api.getProgress()),
    };
  }, [userId, drop]);

  const login = useCallback(
    async (email: string, password: string) => {
      const u = await api.login(email.trim().toLowerCase(), password);
      adopt(u, true);
      return u;
    },
    [adopt],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const u = await api.register({ email: input.email.trim().toLowerCase(), password: input.password, displayName: input.displayName.trim() });
      // La cuenta nueva hereda los ajustes del invitado: el efecto de arriba envía las diferencias.
      adopt(u, false);
      return u;
    },
    [adopt],
  );

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // Sin conexión: la sesión se cierra igualmente en este navegador.
    }
    drop();
  }, [drop]);

  const value = useMemo(
    () => ({ user, checking, server, sync, login, register, logout }),
    [user, checking, server, sync, login, register, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth necesita <AuthProvider>');
  return ctx;
}

/** Clave de texto (strings/app.ts) para un error de la API en los formularios de cuenta. */
export function authErrorKey(err: unknown): string {
  const code = isApiError(err) ? err.code : 'server';
  switch (code) {
    case 'invalid_credentials':
      return 'app.auth.error.invalid';
    case 'email_taken':
      return 'app.auth.error.taken';
    case 'rate_limited':
      return 'app.auth.error.rate';
    case 'validation':
      return 'app.auth.error.validation';
    case 'network':
      return 'app.auth.error.network';
    default:
      return 'app.auth.error.server';
  }
}
