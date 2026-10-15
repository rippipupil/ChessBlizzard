// Sesión de la petición: cookie `cb_session` (httpOnly, SameSite=Lax, Secure en producción).

import type { CookieSerializeOptions } from '@fastify/cookie';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Config } from './config';
import type { Pool } from './db';
import { unauthorized } from './errors';
import { SESSION_COOKIE, SESSION_TTL_SECONDS, createSession, deleteSession, findSession, isSessionToken, renewSession } from './sessions';
import { toUser, type User } from './users';

declare module 'fastify' {
  interface FastifyRequest {
    /** Usuario con sesión iniciada; lo rellena el hook de `requireUser`. */
    user: User | null;
  }
}

function cookieOptions(config: Config): CookieSerializeOptions {
  return { path: '/', httpOnly: true, sameSite: 'lax', secure: config.cookieSecure };
}

function setSessionCookie(reply: FastifyReply, config: Config, token: string): void {
  reply.setCookie(SESSION_COOKIE, token, { ...cookieOptions(config), maxAge: SESSION_TTL_SECONDS });
}

export function clearSessionCookie(reply: FastifyReply, config: Config): void {
  reply.clearCookie(SESSION_COOKIE, cookieOptions(config));
}

function userAgent(request: FastifyRequest): string | null {
  const ua = request.headers['user-agent'];
  return typeof ua === 'string' && ua ? ua.slice(0, 512) : null;
}

/**
 * Abre una sesión nueva para el usuario y envía la cookie. Si la petición traía otra
 * sesión, se cierra: un token que existía antes de iniciar sesión nunca pasa a ser válido.
 */
export async function startSession(pool: Pool, config: Config, request: FastifyRequest, reply: FastifyReply, userId: string): Promise<void> {
  const previous = request.cookies[SESSION_COOKIE];
  if (isSessionToken(previous)) await deleteSession(pool, previous);
  setSessionCookie(reply, config, await createSession(pool, userId, userAgent(request)));
}

/** Cierra la sesión de la cookie (si la hay) y borra la cookie. */
export async function endSession(pool: Pool, config: Config, request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const token = request.cookies[SESSION_COOKIE];
  if (isSessionToken(token)) await deleteSession(pool, token);
  clearSessionCookie(reply, config);
}

/**
 * Hook que exige sesión: deja el usuario en `request.user` o responde 401 `unauthorized`
 * (borrando la cookie si estaba caducada o no era válida). Renueva la sesión al usarla.
 */
export function requireUser(pool: Pool, config: Config) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const token = request.cookies[SESSION_COOKIE];
    if (isSessionToken(token)) {
      const session = await findSession(pool, token);
      if (session) {
        if (session.needsRenewal) {
          await renewSession(pool, token);
          setSessionCookie(reply, config, token);
        }
        request.user = toUser(session.user);
        return;
      }
    }
    if (token !== undefined) clearSessionCookie(reply, config);
    throw unauthorized();
  };
}

/** Usuario de una ruta protegida con `requireUser`. */
export function currentUser(request: FastifyRequest): User {
  if (!request.user) throw unauthorized();
  return request.user;
}
