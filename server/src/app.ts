// Aplicación Fastify: la API (/api/...) y, si existe CLIENT_DIST, la web compilada.
// `buildApp` no se pone a escuchar: eso lo hace index.ts (y los tests usan `inject`).

import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import Fastify, { type FastifyInstance, type FastifyRequest, type FastifyServerOptions } from 'fastify';
import type { Config } from './config';
import type { AppContext } from './context';
import type { Pool } from './db';
import { AppError, errorHandler, notFound, sendError } from './errors';
import { DEFAULT_SCRYPT_PARAMS, type ScryptParams } from './password';
import { registerAuthRoutes } from './routes/auth';
import { registerMeRoutes } from './routes/me';
import { registerProgressRoutes } from './routes/progress';
import { contentSecurityPolicy, csrfGuard, isApiPath, securityHeaders } from './security';
import { loadClientBuild, registerClient, wantsSpaFallback } from './static';

export interface AppOptions {
  config: Config;
  pool: Pool;
  /** Reloj del servidor (los tests lo fijan para comprobar el margen de fechas). */
  now?: () => Date;
  /** Coste de scrypt (los tests usan uno bajo para ir rápido). */
  passwordParams?: ScryptParams;
  logger?: FastifyServerOptions['logger'];
}

export async function buildApp(options: AppOptions): Promise<FastifyInstance> {
  const { config, pool } = options;
  const ctx: AppContext = {
    config,
    pool,
    now: options.now ?? (() => new Date()),
    passwordParams: options.passwordParams ?? DEFAULT_SCRYPT_PARAMS,
  };

  const app = Fastify({
    logger: options.logger ?? { level: config.logLevel },
    trustProxy: config.trustProxy,
    bodyLimit: 1024 * 1024,
  });

  // Solo se admiten cuerpos JSON (otro Content-Type da 415). Un cuerpo vacío con
  // Content-Type JSON, como un POST /logout hecho con fetch, se acepta como "sin cuerpo".
  // El analizador por defecto (con protección frente a __proto__ y constructor.prototype)
  // tiene la forma con callback; el tipo de Fastify es la unión de las dos formas.
  const parseJson = app.getDefaultJsonParser('error', 'error') as (
    request: FastifyRequest,
    body: string,
    done: (err: Error | null, body?: unknown) => void,
  ) => void;
  app.removeContentTypeParser(['application/json', 'text/plain']);
  app.addContentTypeParser<string>('application/json', { parseAs: 'string' }, (request, body, done) => {
    if (body.length === 0) done(null, undefined);
    else parseJson(request, body, done);
  });

  app.decorateRequest('user', null);
  app.setErrorHandler(errorHandler);

  await app.register(cookie);
  await app.register(rateLimit, {
    global: false,
    errorResponseBuilder: (_request, context) => new AppError(429, 'rate_limited', `Too many attempts, retry in ${context.after}`),
  });

  const client = loadClientBuild(config.clientDist);
  const headers = securityHeaders({
    csp: contentSecurityPolicy(client?.inlineScriptHashes),
    hsts: config.isProduction && config.cookieSecure,
  });

  app.addHook('onRequest', csrfGuard(config.allowedOrigins));
  app.addHook('onSend', async (request, reply, payload) => {
    reply.headers(headers);
    // Las respuestas de la API son datos de la cuenta: que no se guarden en ninguna caché.
    if (isApiPath(request.url) && !reply.hasHeader('cache-control')) reply.header('cache-control', 'no-store');
    return payload;
  });

  app.get('/api/health', async () => ({ ok: true }));
  registerAuthRoutes(app, ctx);
  registerMeRoutes(app, ctx);
  registerProgressRoutes(app, ctx);

  if (client) await registerClient(app, client);
  else app.log.warn(`No hay web compilada en ${config.clientDist}: solo se sirve la API`);

  app.setNotFoundHandler((request, reply) => {
    if (client && wantsSpaFallback(request)) {
      // Aunque estemos en el manejador de 404, index.html se sirve con 200.
      return reply.code(200).sendFile('index.html');
    }
    return sendError(reply, notFound(`Route ${request.method} ${request.url.split('?')[0]} not found`));
  });

  return app;
}
