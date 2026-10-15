// Progreso de la cuenta.

import type { FastifyInstance } from 'fastify';
import { currentUser, requireUser } from '../auth';
import type { AppContext } from '../context';
import { parse } from '../errors';
import { checkEvents, importProgress, readProgress, recordEvents, utcDay } from '../progress';
import { eventsBodySchema, importBodySchema } from '../validation';

export function registerProgressRoutes(app: FastifyInstance, ctx: AppContext): void {
  const { pool, config, now } = ctx;
  const auth = requireUser(pool, config);

  app.get('/api/progress', { onRequest: auth }, async (request) => ({
    progress: await readProgress(pool, currentUser(request).id),
  }));

  // Si un evento está mal formado, tiene un id que no existe o una fecha fuera de ±2 días,
  // se rechaza la petición entera con 400 `validation` (un detalle por problema) y no se
  // aplica nada. 200 eventos de ~120 bytes caben de sobra en 256 KiB.
  app.post('/api/progress/events', { onRequest: auth, bodyLimit: 256 * 1024 }, async (request) => {
    const user = currentUser(request);
    const { events } = parse(eventsBodySchema, request.body);
    return recordEvents(pool, user.id, checkEvents(events, utcDay(now())));
  });

  app.post('/api/progress/import', { onRequest: auth, bodyLimit: 2 * 1024 * 1024 }, async (request) => {
    const user = currentUser(request);
    const { progress } = parse(importBodySchema(utcDay(now())), request.body);
    return { progress: await importProgress(pool, user.id, progress) };
  });
}
