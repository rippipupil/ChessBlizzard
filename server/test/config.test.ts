import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadConfig, SERVER_DIR } from '../src/config';

describe('configuración', () => {
  it('valores por defecto en desarrollo', () => {
    const config = loadConfig({});
    expect(config).toMatchObject({
      nodeEnv: 'development',
      isProduction: false,
      port: 3000,
      host: 'localhost',
      cookieSecure: false,
      migrateOnStart: true,
      trustProxy: false,
      clientDist: path.resolve(SERVER_DIR, '../client/dist'),
    });
    expect(config.allowedOrigins).toContain('http://localhost:5173');
    expect(config.databaseUrl).toMatch(/^postgres:\/\//);
  });

  it('en producción exige DATABASE_URL y activa Secure', () => {
    expect(() => loadConfig({ NODE_ENV: 'production' })).toThrow(/DATABASE_URL/);
    const config = loadConfig({ NODE_ENV: 'production', DATABASE_URL: 'postgres://u:p@db/x', PORT: '10000' });
    expect(config).toMatchObject({ isProduction: true, cookieSecure: true, host: '0.0.0.0', port: 10000, allowedOrigins: [] });
    expect(config.authRateLimit.max).toBe(10);
  });

  it('lee y valida las variables', () => {
    const config = loadConfig({
      DATABASE_URL: 'postgres://x',
      COOKIE_SECURE: 'false',
      MIGRATE_ON_START: '0',
      CLIENT_DIST: '/srv/web',
      TRUST_PROXY: 'true',
      ALLOWED_ORIGINS: 'https://a.example/, https://b.example:8443',
    });
    expect(config).toMatchObject({
      cookieSecure: false,
      migrateOnStart: false,
      clientDist: '/srv/web',
      trustProxy: true,
      allowedOrigins: ['https://a.example', 'https://b.example:8443'],
    });
    expect(loadConfig({ TRUST_PROXY: '10.0.0.0/8, 127.0.0.1' }).trustProxy).toBe('10.0.0.0/8, 127.0.0.1');
    expect(() => loadConfig({ PORT: 'abc' })).toThrow(/PORT/);
    expect(() => loadConfig({ COOKIE_SECURE: 'quizá' })).toThrow(/COOKIE_SECURE/);
    expect(() => loadConfig({ TRUST_PROXY: '1' })).toThrow(/TRUST_PROXY/);
    expect(() => loadConfig({ ALLOWED_ORIGINS: 'no es una url' })).toThrow(/ALLOWED_ORIGINS/);
  });
});
