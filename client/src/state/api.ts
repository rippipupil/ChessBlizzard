// Cliente de la API del servidor (ver docs/ARCHITECTURE.md, "API del servidor").
//
// Todas las peticiones van a /api con JSON y la cookie de sesión `cb_session`. Los errores
// del servidor llegan como { error: { code, message } } y se convierten en ApiError. Si el
// servidor no responde (sin red, caído o sin desplegar) el código es "network" o "server":
// la app sigue funcionando en modo invitado.
import type { ProgressEvent, ProgressState, Settings } from '@chessblizzard/shared';

export interface User {
  id: string;
  email: string;
  displayName: string;
  settings: Settings;
  createdAt: string;
}

/** Códigos de error de la API más dos propios del cliente: sin conexión y fallo del servidor. */
export type ApiErrorCode =
  | 'validation'
  | 'email_taken'
  | 'invalid_credentials'
  | 'unauthorized'
  | 'rate_limited'
  | 'not_found'
  | 'network'
  | 'server';

const SERVER_CODES: ReadonlySet<string> = new Set([
  'validation',
  'email_taken',
  'invalid_credentials',
  'unauthorized',
  'rate_limited',
  'not_found',
]);

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;

  constructor(code: ApiErrorCode, message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}

const TIMEOUT_MS = 15_000;

async function request<T>(method: 'GET' | 'POST' | 'PATCH', path: string, body?: unknown): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'include',
      // Sin cuerpo no se manda Content-Type: Fastify rechaza un JSON vacío.
      headers: body === undefined ? { Accept: 'application/json' } : { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: ctrl.signal,
    });
  } catch {
    throw new ApiError('network', 'No se puede conectar con el servidor', 0);
  } finally {
    clearTimeout(timer);
  }

  let data: unknown = null;
  try {
    const text = await res.text();
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null; // Respuesta sin JSON (por ejemplo, una página de error del proxy).
  }

  if (!res.ok) {
    const err = (data as { error?: { code?: unknown; message?: unknown } } | null)?.error;
    const serverCode = typeof err?.code === 'string' && SERVER_CODES.has(err.code) ? (err.code as ApiErrorCode) : null;
    const code: ApiErrorCode =
      serverCode ?? (res.status === 401 ? 'unauthorized' : res.status === 429 ? 'rate_limited' : !err || res.status >= 500 ? 'server' : 'validation');
    throw new ApiError(code, typeof err?.message === 'string' ? err.message : res.statusText, res.status);
  }
  return data as T;
}

export interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
}

export const api = {
  /** Usuario de la sesión actual. Lanza ApiError "unauthorized" si no hay sesión. */
  me: () => request<{ user: User }>('GET', '/auth/me').then((r) => r.user),
  login: (email: string, password: string) => request<{ user: User }>('POST', '/auth/login', { email, password }).then((r) => r.user),
  register: (input: RegisterInput) => request<{ user: User }>('POST', '/auth/register', input).then((r) => r.user),
  logout: () => request<void>('POST', '/auth/logout'),
  updateSettings: (patch: Partial<Settings>) => request<{ user: User }>('PATCH', '/me/settings', patch).then((r) => r.user),
  getProgress: () => request<{ progress: ProgressState }>('GET', '/progress').then((r) => r.progress),
  pushEvents: (events: ProgressEvent[]) => request<{ progress: ProgressState; xp: number }>('POST', '/progress/events', { events }),
  /** Fusiona un progreso (el de invitado) con el de la cuenta y devuelve el resultado. */
  importProgress: (progress: ProgressState) => request<{ progress: ProgressState }>('POST', '/progress/import', { progress }).then((r) => r.progress),
};
