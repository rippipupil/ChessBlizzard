// Sesiones: la cookie lleva un token aleatorio de 32 bytes y la base de datos solo guarda
// su sha256, de modo que una copia de la base de datos no permite suplantar a nadie.
// Duran 30 días desde el último uso: al usarse se renuevan, como mucho una vez al día.

import { createHash, randomBytes } from 'node:crypto';
import type { Pool, PoolClient } from './db';
import { userColumns, type UserRow } from './users';

export const SESSION_COOKIE = 'cb_session';
export const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;
/** La caducidad se alarga cuando han pasado más de 24 h desde la última renovación. */
export const SESSION_RENEW_AFTER_SECONDS = 24 * 60 * 60;

type Db = Pool | PoolClient;

// 32 bytes en base64url = 43 caracteres.
const TOKEN_RE = /^[A-Za-z0-9_-]{43}$/;

export function isSessionToken(value: unknown): value is string {
  return typeof value === 'string' && TOKEN_RE.test(value);
}

export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Crea una sesión y devuelve el token para la cookie. */
export async function createSession(db: Db, userId: string, userAgent: string | null): Promise<string> {
  const token = randomBytes(32).toString('base64url');
  await db.query(
    `INSERT INTO sessions (token_hash, user_id, expires_at, user_agent)
     VALUES ($1, $2, now() + make_interval(secs => $3), $4)`,
    [hashSessionToken(token), userId, SESSION_TTL_SECONDS, userAgent],
  );
  return token;
}

export interface FoundSession {
  user: UserRow;
  /** Toca alargar la caducidad (y reenviar la cookie). */
  needsRenewal: boolean;
}

/** Busca una sesión vigente. Las caducadas no cuentan aunque sigan en la tabla. */
export async function findSession(db: Db, token: string): Promise<FoundSession | null> {
  const { rows } = await db.query<UserRow & { needs_renewal: boolean }>(
    `SELECT ${userColumns('u')},
            s.expires_at < now() + make_interval(secs => $2) AS needs_renewal
       FROM sessions s
       JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = $1 AND s.expires_at > now()`,
    [hashSessionToken(token), SESSION_TTL_SECONDS - SESSION_RENEW_AFTER_SECONDS],
  );
  const row = rows[0];
  if (!row) return null;
  const { needs_renewal, ...user } = row;
  return { user, needsRenewal: needs_renewal };
}

export async function renewSession(db: Db, token: string): Promise<void> {
  await db.query(
    `UPDATE sessions SET expires_at = now() + make_interval(secs => $2), last_seen_at = now()
      WHERE token_hash = $1`,
    [hashSessionToken(token), SESSION_TTL_SECONDS],
  );
}

export async function deleteSession(db: Db, token: string): Promise<void> {
  await db.query('DELETE FROM sessions WHERE token_hash = $1', [hashSessionToken(token)]);
}

/** Borra las sesiones caducadas (de un usuario o de todos). Devuelve cuántas. */
export async function deleteExpiredSessions(db: Db, userId?: string): Promise<number> {
  const result = userId
    ? await db.query('DELETE FROM sessions WHERE user_id = $1 AND expires_at <= now()', [userId])
    : await db.query('DELETE FROM sessions WHERE expires_at <= now()');
  return result.rowCount ?? 0;
}
