// Ajustes de la cuenta.

import { sanitizeSettings } from '@chessblizzard/shared';
import type { FastifyInstance } from 'fastify';
import { currentUser, requireUser } from '../auth';
import type { AppContext } from '../context';
import { parse, unauthorized } from '../errors';
import { toUser, userColumns, type UserRow } from '../users';
import { settingsPatchSchema } from '../validation';

export function registerMeRoutes(app: FastifyInstance, ctx: AppContext): void {
  const { pool, config } = ctx;

  app.patch('/api/me/settings', { onRequest: requireUser(pool, config), bodyLimit: 16 * 1024 }, async (request) => {
    const user = currentUser(request);
    // El esquema rechaza claves o valores desconocidos; sanitizeSettings es la misma regla que usa el cliente.
    const patch = sanitizeSettings(parse(settingsPatchSchema, request.body));
    // `||` une los objetos jsonb: solo cambian las claves enviadas, de forma atómica.
    const { rows } = await pool.query<UserRow>(
      `UPDATE users SET settings = settings || $2::jsonb WHERE id = $1 RETURNING ${userColumns()}`,
      [user.id, JSON.stringify(patch)],
    );
    if (!rows[0]) throw unauthorized();
    return { user: toUser(rows[0]) };
  });
}
