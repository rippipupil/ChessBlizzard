import { DEFAULT_SETTINGS } from '@chessblizzard/shared';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { closePool, createTestApp, errorCode, registerUser, resetDatabase, testPool } from './helpers';

let app: FastifyInstance;

beforeAll(async () => {
  app = await createTestApp();
});
beforeEach(resetDatabase);
afterAll(async () => {
  await app.close();
  await closePool();
});

const patch = (cookie: string | undefined, payload: unknown) =>
  app.inject({ method: 'PATCH', url: '/api/me/settings', headers: cookie ? { cookie } : {}, payload: payload as object });

describe('PATCH /api/me/settings', () => {
  it('cambia solo las claves enviadas y lo guarda en la cuenta', async () => {
    const { cookie } = await registerUser(app);
    const first = await patch(cookie, { theme: 'neon', sounds: true });
    expect(first.statusCode).toBe(200);
    expect(first.json().user.settings).toEqual({ ...DEFAULT_SETTINGS, theme: 'neon', sounds: true });

    const second = await patch(cookie, { locale: 'en', notation: 'en', colorMode: 'system', coordinates: false });
    expect(second.json().user.settings).toEqual({
      ...DEFAULT_SETTINGS,
      theme: 'neon',
      sounds: true,
      locale: 'en',
      notation: 'en',
      colorMode: 'system',
      coordinates: false,
    });

    const me = await app.inject({ method: 'GET', url: '/api/auth/me', headers: { cookie } });
    expect(me.json().user.settings).toEqual(second.json().user.settings);
    // En la base de datos solo están las claves cambiadas.
    const { rows } = await testPool().query('SELECT settings FROM users');
    expect(rows[0].settings).toEqual({ theme: 'neon', sounds: true, locale: 'en', notation: 'en', colorMode: 'system', coordinates: false });
  });

  it('un objeto vacío no cambia nada', async () => {
    const { cookie, user } = await registerUser(app);
    const res = await patch(cookie, {});
    expect(res.statusCode).toBe(200);
    expect(res.json().user).toEqual(user);
  });

  it.each([
    ['valor no válido', { theme: 'rosa' }, 'theme'],
    ['booleano como texto', { sounds: 'true' }, 'sounds'],
    ['clave desconocida', { fontSize: 14 }, ''],
  ])('rechaza %s con 400 validation', async (_name, payload, path) => {
    const { cookie } = await registerUser(app);
    const res = await patch(cookie, payload);
    expect(res.statusCode).toBe(400);
    const { error } = res.json();
    expect(error.code).toBe('validation');
    expect(error.details[0].path).toBe(path);
    const { rows } = await testPool().query('SELECT settings FROM users');
    expect(rows[0].settings).toEqual({});
  });

  it('rechaza un cuerpo que no es un objeto', async () => {
    const { cookie } = await registerUser(app);
    for (const payload of [[], 'neon', null]) {
      const res = await app.inject({
        method: 'PATCH',
        url: '/api/me/settings',
        headers: { cookie, 'content-type': 'application/json' },
        payload: JSON.stringify(payload),
      });
      expect(res.statusCode).toBe(400);
      expect(errorCode(res)).toBe('validation');
    }
  });

  it('exige sesión', async () => {
    const res = await patch(undefined, { theme: 'neon' });
    expect(res.statusCode).toBe(401);
    expect(errorCode(res)).toBe('unauthorized');
  });

  it('ignora al leer los ajustes guardados que ya no sean válidos', async () => {
    const { cookie } = await registerUser(app);
    await testPool().query(`UPDATE users SET settings = '{"theme":"neon","locale":"fr","old":1}'::jsonb`);
    const me = await app.inject({ method: 'GET', url: '/api/auth/me', headers: { cookie } });
    expect(me.json().user.settings).toEqual({ ...DEFAULT_SETTINGS, theme: 'neon' });
  });
});
