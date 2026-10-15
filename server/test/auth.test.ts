import { createHash } from 'node:crypto';
import { DEFAULT_SETTINGS } from '@chessblizzard/shared';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { LOGIN_FAILURE_LIMIT } from '../src/routes/auth';
import {
  closePool,
  createTestApp,
  errorCode,
  FAST_SCRYPT,
  PASSWORD,
  registerUser,
  resetDatabase,
  sessionCookie,
  testPool,
  tokenOf,
  uniqueEmail,
} from './helpers';

let app: FastifyInstance;

beforeAll(async () => {
  app = await createTestApp();
});
beforeEach(resetDatabase);
afterAll(async () => {
  await app.close();
  await closePool();
});

const login = (body: unknown, headers: Record<string, string> = {}, remoteAddress?: string) =>
  app.inject({ method: 'POST', url: '/api/auth/login', payload: body as object, headers, remoteAddress });

const me = (cookie?: string) => app.inject({ method: 'GET', url: '/api/auth/me', headers: cookie ? { cookie } : {} });

describe('registro', () => {
  it('crea la cuenta, abre sesión y devuelve el usuario con los ajustes por defecto', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: '  Hikaru@Example.COM ', password: PASSWORD, displayName: '  Hikaru   Nakamura ' },
    });
    expect(res.statusCode).toBe(201);
    const { user } = res.json();
    expect(user).toEqual({
      id: expect.stringMatching(/^[0-9a-f-]{36}$/),
      email: 'hikaru@example.com',
      displayName: 'Hikaru Nakamura',
      settings: DEFAULT_SETTINGS,
      createdAt: expect.any(String),
    });
    expect(new Date(user.createdAt).toISOString()).toBe(user.createdAt);

    const cookie = res.cookies.find((c) => c.name === 'cb_session');
    expect(cookie).toMatchObject({ httpOnly: true, sameSite: 'Lax', path: '/', maxAge: 30 * 24 * 3600 });
    expect(cookie?.secure).toBeFalsy();
    expect(cookie?.value).toMatch(/^[A-Za-z0-9_-]{43}$/);

    // En la base de datos solo está el sha256 del token, y la contraseña con scrypt.
    const { rows: sessions } = await testPool().query('SELECT token_hash, user_agent FROM sessions');
    expect(sessions).toEqual([
      { token_hash: createHash('sha256').update(cookie!.value).digest('hex'), user_agent: 'lightMyRequest' },
    ]);
    const { rows: users } = await testPool().query('SELECT password_hash FROM users');
    expect(users[0].password_hash).toMatch(/^\$scrypt\$ln=10,r=8,p=1\$/);
    expect(users[0].password_hash).not.toContain(PASSWORD);

    expect((await me(sessionCookie(res))).json().user).toEqual(user);
  });

  it('rechaza un email ya registrado (sin distinguir mayúsculas)', async () => {
    const first = await registerUser(app, { email: 'anand@example.com' });
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: 'ANAND@example.com', password: 'otra-contraseña', displayName: 'Vishy' },
    });
    expect(res.statusCode).toBe(409);
    expect(res.json()).toEqual({ error: { code: 'email_taken', message: expect.any(String) } });
    expect(res.cookies).toHaveLength(0);
    const { rows } = await testPool().query('SELECT id FROM users');
    expect(rows).toEqual([{ id: first.user.id }]);
  });

  it.each([
    ['email no válido', { email: 'no-es-un-email', password: PASSWORD, displayName: 'Ana' }, 'email'],
    ['contraseña de 7 caracteres', { email: uniqueEmail(), password: '1234567', displayName: 'Ana' }, 'password'],
    ['contraseña de 201 caracteres', { email: uniqueEmail(), password: 'x'.repeat(201), displayName: 'Ana' }, 'password'],
    ['nombre de 1 carácter', { email: uniqueEmail(), password: PASSWORD, displayName: ' A ' }, 'displayName'],
    ['nombre de 41 caracteres', { email: uniqueEmail(), password: PASSWORD, displayName: 'A'.repeat(41) }, 'displayName'],
    ['nombre con caracteres de control', { email: uniqueEmail(), password: PASSWORD, displayName: 'Ana‮txt' }, 'displayName'],
    ['falta la contraseña', { email: uniqueEmail(), displayName: 'Ana' }, 'password'],
  ])('valida el cuerpo: %s', async (_name, payload, field) => {
    const res = await app.inject({ method: 'POST', url: '/api/auth/register', payload });
    expect(res.statusCode).toBe(400);
    const { error } = res.json();
    expect(error.code).toBe('validation');
    expect(error.details.map((d: { path: string }) => d.path)).toContain(field);
  });

  it('admite contraseñas de 8 y de 200 caracteres', async () => {
    await registerUser(app, { password: '12345678' });
    await registerUser(app, { password: 'ñ'.repeat(200) });
  });
});

describe('inicio de sesión', () => {
  it('con la contraseña correcta abre una sesión nueva', async () => {
    const account = await registerUser(app, { email: 'carlsen@example.com' });
    const res = await login({ email: 'Carlsen@Example.com', password: PASSWORD });
    expect(res.statusCode).toBe(200);
    expect(res.json().user).toEqual(account.user);
    const cookie = sessionCookie(res);
    expect(cookie).not.toBe(account.cookie);
    expect((await me(cookie)).statusCode).toBe(200);
  });

  it('con contraseña errónea o email desconocido responde lo mismo: invalid_credentials', async () => {
    const account = await registerUser(app);
    const wrong = await login({ email: account.email, password: 'contraseña-incorrecta' });
    const unknown = await login({ email: 'nadie@example.com', password: PASSWORD });
    for (const res of [wrong, unknown]) {
      expect(res.statusCode).toBe(401);
      expect(res.cookies).toHaveLength(0);
    }
    expect(wrong.json()).toEqual({ error: { code: 'invalid_credentials', message: 'Invalid email or password' } });
    expect(unknown.json()).toEqual(wrong.json());
    // Una contraseña demasiado corta para registrarse tampoco revela nada.
    expect(errorCode(await login({ email: account.email, password: 'corta' }))).toBe('invalid_credentials');
  });

  it('valida que vengan email y contraseña', async () => {
    const res = await login({ email: 'a@example.com' });
    expect(res.statusCode).toBe(400);
    expect(errorCode(res)).toBe('validation');
  });

  it('cierra la sesión anterior que traía la petición', async () => {
    const account = await registerUser(app);
    const res = await login({ email: account.email, password: PASSWORD }, { cookie: account.cookie });
    expect(res.statusCode).toBe(200);
    expect((await me(account.cookie)).statusCode).toBe(401);
    expect((await me(sessionCookie(res))).statusCode).toBe(200);
  });

  it('recalcula el hash si se guardó con otros parámetros de scrypt', async () => {
    const account = await registerUser(app);
    const stronger = await createTestApp({ passwordParams: { ...FAST_SCRYPT, ln: FAST_SCRYPT.ln + 1 } });
    try {
      const res = await stronger.inject({ method: 'POST', url: '/api/auth/login', payload: { email: account.email, password: PASSWORD } });
      expect(res.statusCode).toBe(200);
      const { rows } = await testPool().query('SELECT password_hash FROM users');
      expect(rows[0].password_hash).toMatch(/^\$scrypt\$ln=11,r=8,p=1\$/);
    } finally {
      await stronger.close();
    }
    // Y la contraseña sigue funcionando con el hash nuevo.
    expect((await login({ email: account.email, password: PASSWORD })).statusCode).toBe(200);
  });
});

describe('límites de intentos', () => {
  it('limita las peticiones por IP en login y registro (429 rate_limited)', async () => {
    const limited = await createTestApp({ env: { AUTH_RATE_LIMIT_MAX: '3' } });
    try {
      const attempt = (remoteAddress: string) =>
        limited.inject({ method: 'POST', url: '/api/auth/login', payload: { email: 'x@example.com', password: 'nope' }, remoteAddress });
      for (let i = 0; i < 3; i++) expect((await attempt('10.0.0.1')).statusCode).toBe(401);
      const blocked = await attempt('10.0.0.1');
      expect(blocked.statusCode).toBe(429);
      expect(blocked.json()).toEqual({ error: { code: 'rate_limited', message: expect.stringContaining('retry in') } });
      expect(blocked.headers['retry-after']).toBeDefined();
      // Otra IP tiene su propio contador, y el registro cuenta aparte.
      expect((await attempt('10.0.0.2')).statusCode).toBe(401);
      const register = await limited.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: { email: uniqueEmail(), password: PASSWORD, displayName: 'Judit' },
        remoteAddress: '10.0.0.1',
      });
      expect(register.statusCode).toBe(201);
    } finally {
      await limited.close();
    }
  });

  it(`bloquea una cuenta tras ${LOGIN_FAILURE_LIMIT.max} contraseñas erróneas aunque cambie la IP`, async () => {
    const account = await registerUser(app);
    for (let i = 0; i < LOGIN_FAILURE_LIMIT.max; i++) {
      const res = await login({ email: account.email, password: `mala-${i}` }, {}, `10.1.0.${i + 1}`);
      expect(res.statusCode).toBe(401);
    }
    const blocked = await login({ email: account.email.toUpperCase(), password: PASSWORD }, {}, '10.2.0.1');
    expect(blocked.statusCode).toBe(429);
    expect(errorCode(blocked)).toBe('rate_limited');
    // Otras cuentas no se ven afectadas.
    const other = await registerUser(app);
    expect((await login({ email: other.email, password: PASSWORD })).statusCode).toBe(200);
  });
});

describe('sesión', () => {
  it('GET /api/auth/me sin sesión da 401 unauthorized', async () => {
    const res = await me();
    expect(res.statusCode).toBe(401);
    expect(res.json()).toEqual({ error: { code: 'unauthorized', message: expect.any(String) } });
  });

  it('una cookie inventada da 401 y se borra', async () => {
    for (const cookie of ['cb_session=no-es-un-token', `cb_session=${'A'.repeat(43)}`]) {
      const res = await me(cookie);
      expect(res.statusCode).toBe(401);
      const cleared = res.cookies.find((c) => c.name === 'cb_session');
      expect(cleared?.value).toBe('');
      expect(cleared?.expires?.getTime()).toBeLessThan(Date.now());
    }
  });

  it('una sesión caducada ya no vale', async () => {
    const account = await registerUser(app);
    await testPool().query("UPDATE sessions SET expires_at = now() - interval '1 second'");
    const res = await me(account.cookie);
    expect(res.statusCode).toBe(401);
    expect(errorCode(res)).toBe('unauthorized');
    expect(res.cookies.find((c) => c.name === 'cb_session')?.value).toBe('');
  });

  it('se renueva al usarla si la última renovación fue hace más de un día', async () => {
    const account = await registerUser(app);
    // Recién creada: no se toca.
    expect((await me(account.cookie)).cookies).toHaveLength(0);

    await testPool().query("UPDATE sessions SET expires_at = now() + interval '10 days', last_seen_at = now() - interval '20 days'");
    const res = await me(account.cookie);
    expect(res.statusCode).toBe(200);
    expect(res.cookies.find((c) => c.name === 'cb_session')).toMatchObject({ value: tokenOf(account.cookie), maxAge: 30 * 24 * 3600 });
    const { rows } = await testPool().query(
      "SELECT expires_at > now() + interval '29 days' AS renewed, last_seen_at > now() - interval '1 minute' AS seen FROM sessions",
    );
    expect(rows).toEqual([{ renewed: true, seen: true }]);
  });

  it('la sesión muere con la cuenta (ON DELETE CASCADE)', async () => {
    const account = await registerUser(app);
    await testPool().query('DELETE FROM users WHERE id = $1', [account.user.id]);
    expect((await me(account.cookie)).statusCode).toBe(401);
  });

  it('la cookie lleva Secure con COOKIE_SECURE=true', async () => {
    const secure = await createTestApp({ env: { COOKIE_SECURE: 'true' } });
    try {
      const res = await secure.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: { email: uniqueEmail(), password: PASSWORD, displayName: 'Hou Yifan' },
      });
      expect(res.cookies.find((c) => c.name === 'cb_session')).toMatchObject({ secure: true, httpOnly: true, sameSite: 'Lax' });
    } finally {
      await secure.close();
    }
  });
});

describe('cierre de sesión', () => {
  it('borra la sesión y la cookie', async () => {
    const account = await registerUser(app);
    const res = await app.inject({ method: 'POST', url: '/api/auth/logout', headers: { cookie: account.cookie } });
    expect(res.statusCode).toBe(204);
    expect(res.body).toBe('');
    const cleared = res.cookies.find((c) => c.name === 'cb_session');
    expect(cleared?.value).toBe('');
    expect(cleared?.expires?.getTime()).toBeLessThan(Date.now());
    const { rows } = await testPool().query('SELECT count(*)::int AS n FROM sessions');
    expect(rows[0].n).toBe(0);
    expect((await me(account.cookie)).statusCode).toBe(401);
  });

  it('acepta Content-Type JSON con el cuerpo vacío y funciona sin sesión', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/auth/logout', headers: { 'content-type': 'application/json' } });
    expect(res.statusCode).toBe(204);
  });
});
