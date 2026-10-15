// Configuración del servidor a partir de variables de entorno (ver .env.example).

import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Carpeta del paquete del servidor (`server/`). */
export const SERVER_DIR = fileURLToPath(new URL('..', import.meta.url));

/**
 * Carga el `.env` de la raíz del repositorio si existe (cómodo en desarrollo). Las
 * variables que ya estén definidas en el entorno tienen prioridad.
 */
export function loadEnvFile(file = path.resolve(SERVER_DIR, '..', '.env')): void {
  if (existsSync(file)) process.loadEnvFile(file);
}

export type NodeEnv = 'development' | 'production' | 'test';

export interface Config {
  nodeEnv: NodeEnv;
  isProduction: boolean;
  host: string;
  port: number;
  databaseUrl: string;
  /** Cookie de sesión con el atributo Secure (solo viaja por HTTPS). */
  cookieSecure: boolean;
  /** Carpeta con la web compilada (`vite build`). Si no existe, solo se sirve la API. */
  clientDist: string;
  migrateOnStart: boolean;
  /**
   * Opción `trustProxy` de Fastify: false, true o una lista de IP/CIDR de proxies de
   * confianza. Con ella, `request.ip` (el que usa el límite de peticiones) sale de
   * X-Forwarded-For. Fastify 5 ya no admite un número de saltos.
   */
  trustProxy: boolean | string;
  /** Orígenes extra aceptados en peticiones que modifican datos (además del propio host). */
  allowedOrigins: string[];
  /** Límite de peticiones por IP en registro e inicio de sesión (cada ruta por separado). */
  authRateLimit: { max: number; windowMs: number };
  logLevel: string;
}

type Env = Record<string, string | undefined>;

const DEV_DATABASE_URL = 'postgres://chessblizzard:chessblizzard@localhost:5432/chessblizzard';
// Vite (desarrollo y `vite preview`) reenvía /api al servidor desde estos orígenes.
const DEV_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4173', 'http://127.0.0.1:4173'];

export function loadConfig(env: Env = process.env): Config {
  const nodeEnv: NodeEnv = env.NODE_ENV === 'production' ? 'production' : env.NODE_ENV === 'test' ? 'test' : 'development';
  const isProduction = nodeEnv === 'production';

  const databaseUrl = text(env.DATABASE_URL) ?? (isProduction ? undefined : DEV_DATABASE_URL);
  if (!databaseUrl) throw new Error('Falta la variable de entorno DATABASE_URL');

  const clientDist = text(env.CLIENT_DIST) ?? '../client/dist';

  return {
    nodeEnv,
    isProduction,
    // En desarrollo "localhost" escucha en IPv4 e IPv6 sin exponer el puerto a la red.
    host: text(env.HOST) ?? (isProduction ? '0.0.0.0' : 'localhost'),
    port: int('PORT', env.PORT, 3000, 0, 65535),
    databaseUrl,
    cookieSecure: bool('COOKIE_SECURE', env.COOKIE_SECURE, isProduction),
    clientDist: path.resolve(SERVER_DIR, clientDist),
    migrateOnStart: bool('MIGRATE_ON_START', env.MIGRATE_ON_START, true),
    trustProxy: trustProxy(env.TRUST_PROXY),
    allowedOrigins: origins(env.ALLOWED_ORIGINS) ?? (nodeEnv === 'development' ? DEV_ORIGINS : []),
    authRateLimit: {
      max: int('AUTH_RATE_LIMIT_MAX', env.AUTH_RATE_LIMIT_MAX, isProduction ? 10 : nodeEnv === 'test' ? 1000 : 100, 1, 1_000_000),
      windowMs: int('AUTH_RATE_LIMIT_WINDOW_MS', env.AUTH_RATE_LIMIT_WINDOW_MS, 60_000, 1000, 86_400_000),
    },
    logLevel: text(env.LOG_LEVEL) ?? (nodeEnv === 'test' ? 'silent' : 'info'),
  };
}

function text(value: string | undefined): string | undefined {
  const v = value?.trim();
  return v ? v : undefined;
}

function bool(name: string, value: string | undefined, fallback: boolean): boolean {
  const v = text(value)?.toLowerCase();
  if (v === undefined) return fallback;
  if (['1', 'true', 'yes', 'on'].includes(v)) return true;
  if (['0', 'false', 'no', 'off'].includes(v)) return false;
  throw new Error(`${name} debe ser true o false (es "${value}")`);
}

function int(name: string, value: string | undefined, fallback: number, min: number, max: number): number {
  const v = text(value);
  if (v === undefined) return fallback;
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > max) throw new Error(`${name} debe ser un entero entre ${min} y ${max} (es "${value}")`);
  return n;
}

function trustProxy(value: string | undefined): boolean | string {
  const v = text(value);
  if (v === undefined || v.toLowerCase() === 'false') return false;
  if (v.toLowerCase() === 'true') return true;
  if (/^\d+$/.test(v)) {
    throw new Error('TRUST_PROXY debe ser true, false o una lista de IP/CIDR (Fastify 5 no admite un número de saltos)');
  }
  return v;
}

function origins(value: string | undefined): string[] | undefined {
  const v = text(value);
  if (v === undefined) return undefined;
  return v
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
    .map((o) => {
      try {
        return new URL(o).origin;
      } catch {
        throw new Error(`ALLOWED_ORIGINS contiene un origen no válido: "${o}"`);
      }
    });
}
