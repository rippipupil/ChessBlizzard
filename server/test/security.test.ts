import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { isOriginAllowed } from '../src/security';
import { closePool, createTestApp, errorCode, PASSWORD, registerUser, resetDatabase, testPool, uniqueEmail } from './helpers';

let app: FastifyInstance;

beforeAll(async () => {
  app = await createTestApp({ env: { ALLOWED_ORIGINS: 'http://localhost:5173' } });
});
beforeEach(resetDatabase);
afterAll(async () => {
  await app.close();
  await closePool();
});

const registerWithOrigin = (origin: string) =>
  app.inject({
    method: 'POST',
    url: '/api/auth/register',
    headers: { origin },
    payload: { email: uniqueEmail(), password: PASSWORD, displayName: 'Kasparov' },
  });

describe('CSRF por la cabecera Origin', () => {
  it('rechaza con 403 las peticiones que modifican datos desde otro origen', async () => {
    const account = await registerUser(app);
    const evil = { origin: 'https://evil.example', cookie: account.cookie };
    const attempts = [
      await registerWithOrigin('https://evil.example'),
      await app.inject({ method: 'POST', url: '/api/auth/login', headers: evil, payload: { email: account.email, password: PASSWORD } }),
      await app.inject({ method: 'PATCH', url: '/api/me/settings', headers: evil, payload: { theme: 'neon' } }),
      await app.inject({ method: 'POST', url: '/api/progress/import', headers: evil, payload: { progress: { v: 1, xp: 999 } } }),
      await app.inject({ method: 'POST', url: '/api/auth/logout', headers: evil }),
      await registerWithOrigin('null'),
      await registerWithOrigin('http://localhost.evil.example'),
      await registerWithOrigin('http://localhost:8080'),
    ];
    for (const res of attempts) {
      expect(res.statusCode).toBe(403);
      expect(res.json()).toEqual({ error: { code: 'forbidden', message: expect.any(String) } });
    }
    // Nada ha cambiado: una sola cuenta, sin ajustes, y la sesión sigue abierta.
    const { rows } = await testPool().query('SELECT settings FROM users');
    expect(rows).toEqual([{ settings: {} }]);
    expect((await app.inject({ method: 'GET', url: '/api/auth/me', headers: { cookie: account.cookie } })).statusCode).toBe(200);
  });

  it('acepta el mismo origen, los orígenes permitidos y las peticiones sin Origin', async () => {
    // inject() envía Host: localhost:80
    expect((await registerWithOrigin('http://localhost')).statusCode).toBe(201);
    expect((await registerWithOrigin('http://LOCALHOST:80')).statusCode).toBe(201);
    expect((await registerWithOrigin('http://localhost:5173')).statusCode).toBe(201);
    await registerUser(app); // sin Origin (curl, tests...)
  });

  it('no afecta a las peticiones de lectura', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/health', headers: { origin: 'https://evil.example' } });
    expect(res.statusCode).toBe(200);
  });

  it('compara host y puerto normalizando el puerto por defecto', () => {
    const none = new Set<string>();
    expect(isOriginAllowed('https://chess.example', 'chess.example', none)).toBe(true);
    expect(isOriginAllowed('https://chess.example', 'chess.example:443', none)).toBe(true);
    expect(isOriginAllowed('https://chess.example', 'chess.example:8443', none)).toBe(false);
    expect(isOriginAllowed('http://chess.example:3000', 'chess.example:3000', none)).toBe(true);
    expect(isOriginAllowed('https://evil.example', 'chess.example', none)).toBe(false);
    expect(isOriginAllowed('null', 'chess.example', none)).toBe(false);
    expect(isOriginAllowed('file://', 'chess.example', none)).toBe(false);
    expect(isOriginAllowed('https://chess.example', '', none)).toBe(false);
    expect(isOriginAllowed(undefined, 'chess.example', none)).toBe(true);
  });
});

describe('cabeceras de seguridad', () => {
  it('van en todas las respuestas, y la API no se guarda en caché', async () => {
    for (const res of [
      await app.inject({ method: 'GET', url: '/api/health' }),
      await app.inject({ method: 'GET', url: '/api/auth/me' }),
      await app.inject({ method: 'GET', url: '/api/no-existe' }),
    ]) {
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(res.headers['x-frame-options']).toBe('DENY');
      expect(res.headers['cache-control']).toBe('no-store');
      const csp = String(res.headers['content-security-policy']);
      for (const directive of [
        "script-src 'self' 'wasm-unsafe-eval'",
        "worker-src 'self' blob:",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data:",
        "connect-src 'self'",
        "frame-ancestors 'none'",
      ]) {
        expect(csp).toContain(directive);
      }
      expect(res.headers['strict-transport-security']).toBeUndefined();
    }
  });

  it('HSTS solo en producción con cookies Secure', async () => {
    const prod = await createTestApp({ env: { NODE_ENV: 'production', LOG_LEVEL: 'silent' } });
    try {
      const res = await prod.inject({ method: 'GET', url: '/api/health' });
      expect(res.headers['strict-transport-security']).toBe('max-age=15552000; includeSubDomains');
    } finally {
      await prod.close();
    }
  });
});

describe('formato de las peticiones y errores', () => {
  it('GET /api/health', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ ok: true });
    expect(res.headers['content-type']).toMatch(/^application\/json/);
  });

  it('una ruta de la API que no existe da 404 not_found', async () => {
    for (const res of [
      await app.inject({ method: 'GET', url: '/api/no-existe' }),
      await app.inject({ method: 'DELETE', url: '/api/auth/me' }),
      await app.inject({ method: 'GET', url: '/' }),
    ]) {
      expect(res.statusCode).toBe(404);
      expect(res.json()).toEqual({ error: { code: 'not_found', message: expect.any(String) } });
    }
  });

  it('solo admite JSON (415 validation)', async () => {
    for (const [type, payload] of [
      ['text/plain', '{"email":"a@b.co"}'],
      ['application/x-www-form-urlencoded', 'email=a%40b.co&password=12345678&displayName=Ana'],
      ['multipart/form-data; boundary=x', '--x--'],
    ]) {
      const res = await app.inject({ method: 'POST', url: '/api/auth/register', headers: { 'content-type': type }, payload });
      expect(res.statusCode).toBe(415);
      expect(errorCode(res)).toBe('validation');
    }
  });

  it('JSON mal formado da 400 validation', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      headers: { 'content-type': 'application/json' },
      payload: '{"email": ',
    });
    expect(res.statusCode).toBe(400);
    expect(errorCode(res)).toBe('validation');
  });

  it('un cuerpo demasiado grande da 413 validation', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      headers: { 'content-type': 'application/json' },
      payload: JSON.stringify({ email: 'a@b.co', password: 'x'.repeat(20_000) }),
    });
    expect(res.statusCode).toBe(413);
    expect(errorCode(res)).toBe('validation');
  });

  it('un error inesperado da 500 internal sin detalles', async () => {
    const broken = await createTestApp();
    // Simula una caída de la base de datos.
    const pool = testPool();
    const original = pool.query.bind(pool);
    try {
      pool.query = (() => Promise.reject(new Error('conexión perdida con datos internos'))) as typeof pool.query;
      const res = await broken.inject({ method: 'POST', url: '/api/auth/login', payload: { email: 'a@b.co', password: PASSWORD } });
      expect(res.statusCode).toBe(500);
      expect(res.json()).toEqual({ error: { code: 'internal', message: 'Internal server error' } });
    } finally {
      pool.query = original;
      await broken.close();
    }
  });
});
