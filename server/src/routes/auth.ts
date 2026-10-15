// Cuentas: registro, inicio y cierre de sesión, y usuario actual.

import type { FastifyInstance } from 'fastify';
import { currentUser, endSession, requireUser, startSession } from '../auth';
import type { AppContext } from '../context';
import { isUniqueViolation } from '../db';
import { AppError, parse } from '../errors';
import { dummyHash, hashPassword, needsRehash, verifyPassword } from '../password';
import { deleteExpiredSessions } from '../sessions';
import { toUser, userColumns, type UserRow } from '../users';
import { loginBodySchema, registerBodySchema } from '../validation';

const AUTH_BODY_LIMIT = 16 * 1024;

/** Intentos fallidos de inicio de sesión por email antes de bloquearlo un rato. */
export const LOGIN_FAILURE_LIMIT = { max: 10, timeWindow: 15 * 60 * 1000 };

export function registerAuthRoutes(app: FastifyInstance, ctx: AppContext): void {
  const { pool, config, passwordParams } = ctx;
  // Límite por IP, con un contador por ruta.
  const rateLimit = { max: config.authRateLimit.max, timeWindow: config.authRateLimit.windowMs };
  // Y otro de intentos fallidos por email, que frena los ataques a una cuenta concreta
  // aunque lleguen desde muchas IP. Cuenta igual exista o no la cuenta.
  const loginFailures = app.createRateLimit({
    ...LOGIN_FAILURE_LIMIT,
    keyGenerator: (request) => {
      const email = (request.body as { email?: unknown } | undefined)?.email;
      return `login:${typeof email === 'string' ? email.trim().toLowerCase() : ''}`;
    },
  });

  // El hash ficticio del login se calcula al arrancar, no en la primera petición.
  app.addHook('onReady', async () => {
    await dummyHash(passwordParams);
  });

  app.post('/api/auth/register', { config: { rateLimit }, bodyLimit: AUTH_BODY_LIMIT }, async (request, reply) => {
    const body = parse(registerBodySchema, request.body);
    const passwordHash = await hashPassword(body.password, passwordParams);
    let row: UserRow;
    try {
      const { rows } = await pool.query<UserRow>(
        `INSERT INTO users (email, password_hash, display_name) VALUES ($1, $2, $3) RETURNING ${userColumns()}`,
        [body.email, passwordHash, body.displayName],
      );
      row = rows[0];
    } catch (err) {
      if (isUniqueViolation(err)) throw new AppError(409, 'email_taken', 'There is already an account with this email');
      throw err;
    }
    await startSession(pool, config, request, reply, row.id);
    return reply.code(201).send({ user: toUser(row) });
  });

  app.post('/api/auth/login', { config: { rateLimit }, bodyLimit: AUTH_BODY_LIMIT }, async (request, reply) => {
    const { email, password } = parse(loginBodySchema, request.body);
    const failures = await loginFailures(request, { increment: false });
    if (!failures.isAllowed && failures.remaining === 0) {
      throw new AppError(429, 'rate_limited', `Too many failed attempts, retry in ${Math.ceil(failures.ttlInSeconds / 60)} min`);
    }

    const { rows } = await pool.query<UserRow & { password_hash: string }>(
      `SELECT ${userColumns()}, password_hash FROM users WHERE email = $1`,
      [email],
    );
    const found = rows[0];
    // Si el email no existe se verifica igualmente contra un hash ficticio: la respuesta es
    // la misma y tarda lo mismo, así que no delata qué emails tienen cuenta.
    const valid = await verifyPassword(password, found?.password_hash ?? (await dummyHash(passwordParams)));
    if (!found || !valid) {
      await loginFailures(request);
      throw new AppError(401, 'invalid_credentials', 'Invalid email or password');
    }

    if (needsRehash(found.password_hash, passwordParams)) {
      await pool.query('UPDATE users SET password_hash = $2 WHERE id = $1', [found.id, await hashPassword(password, passwordParams)]);
    }
    await deleteExpiredSessions(pool, found.id);
    await startSession(pool, config, request, reply, found.id);
    return reply.send({ user: toUser(found) });
  });

  app.post('/api/auth/logout', async (request, reply) => {
    await endSession(pool, config, request, reply);
    return reply.code(204).send();
  });

  app.get('/api/auth/me', { onRequest: requireUser(pool, config) }, async (request) => ({ user: currentUser(request) }));
}
