// Utilidades de los tests: app contra el PostgreSQL de pruebas, cuentas y cookies.

import os from 'node:os';
import path from 'node:path';
import type { FastifyInstance, LightMyRequestResponse } from 'fastify';
import { expect, inject } from 'vitest';
import { buildApp, type AppOptions } from '../src/app';
import { loadConfig, type Config } from '../src/config';
import { createPool, type Pool } from '../src/db';
import type { ScryptParams } from '../src/password';
import type { User } from '../src/users';

export const databaseUrl = inject('databaseUrl');

/** scrypt barato para que los tests vayan rápidos (el coste real se prueba en password.test.ts). */
export const FAST_SCRYPT: ScryptParams = { ln: 10, r: 8, p: 1 };

let pool: Pool | undefined;

export function testPool(): Pool {
  pool ??= createPool(databaseUrl, { max: 5 });
  return pool;
}

export async function closePool(): Promise<void> {
  await pool?.end();
  pool = undefined;
}

export async function resetDatabase(): Promise<void> {
  await testPool().query('TRUNCATE users, sessions, progress CASCADE');
}

export function testConfig(env: Record<string, string> = {}): Config {
  return loadConfig({
    NODE_ENV: 'test',
    DATABASE_URL: databaseUrl,
    // Por defecto sin web compilada; los tests de la web pasan su propia carpeta.
    CLIENT_DIST: path.join(os.tmpdir(), 'chessblizzard-test-no-client'),
    ...env,
  });
}

type TestAppOptions = Partial<Omit<AppOptions, 'config' | 'pool'>> & { env?: Record<string, string> };

export async function createTestApp({ env, ...options }: TestAppOptions = {}): Promise<FastifyInstance> {
  const app = await buildApp({ config: testConfig(env), pool: testPool(), passwordParams: FAST_SCRYPT, logger: false, ...options });
  await app.ready();
  return app;
}

let counter = 0;
export function uniqueEmail(): string {
  counter += 1;
  return `alumno${counter}.${process.pid}@example.com`;
}

export const PASSWORD = 'torre-de-hielo-42';

export interface Account {
  email: string;
  password: string;
  displayName: string;
  cookie: string;
  user: User;
}

export async function registerUser(app: FastifyInstance, overrides: Partial<Pick<Account, 'email' | 'password' | 'displayName'>> = {}): Promise<Account> {
  const body = { email: uniqueEmail(), password: PASSWORD, displayName: 'Magnus', ...overrides };
  const res = await app.inject({ method: 'POST', url: '/api/auth/register', payload: body });
  expect(res.statusCode, res.body).toBe(201);
  return { ...body, cookie: sessionCookie(res), user: res.json().user };
}

/** Cabecera Cookie con la sesión que ha puesto una respuesta. */
export function sessionCookie(res: LightMyRequestResponse): string {
  const cookie = res.cookies.find((c) => c.name === 'cb_session');
  if (!cookie?.value) throw new Error(`La respuesta no abre sesión: ${res.statusCode} ${res.body}`);
  return `cb_session=${cookie.value}`;
}

export function tokenOf(cookie: string): string {
  return cookie.slice('cb_session='.length);
}

export function errorCode(res: LightMyRequestResponse): string | undefined {
  return (res.json() as { error?: { code?: string } }).error?.code;
}
