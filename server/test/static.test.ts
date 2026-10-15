import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { inlineScriptHashes } from '../src/static';
import { closePool, createTestApp } from './helpers';

// Una web compilada de mentira, con la misma estructura que la de Vite.
const INLINE = "document.documentElement.dataset.mode='dark'";
const INDEX_HTML = `<!doctype html><html><head><script>${INLINE}</script><script type="module" src="/assets/index-abc123.js"></script></head><body><div id="root"></div></body></html>`;
const WASM = Buffer.from([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]);

let dist: string;
let app: FastifyInstance;

beforeAll(async () => {
  dist = mkdtempSync(path.join(os.tmpdir(), 'chessblizzard-dist-'));
  mkdirSync(path.join(dist, 'assets'));
  mkdirSync(path.join(dist, 'stockfish'));
  writeFileSync(path.join(dist, 'index.html'), INDEX_HTML);
  writeFileSync(path.join(dist, 'assets', 'index-abc123.js'), 'console.log("hola")');
  writeFileSync(path.join(dist, 'stockfish', 'stockfish-19-lite-single.js'), 'self.onmessage = () => {}');
  writeFileSync(path.join(dist, 'stockfish', 'stockfish-19-lite-single.wasm'), WASM);
  writeFileSync(path.join(dist, 'favicon.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>');
  app = await createTestApp({ env: { CLIENT_DIST: dist } });
});

afterAll(async () => {
  await app.close();
  await closePool();
  rmSync(dist, { recursive: true, force: true });
});

const get = (url: string, headers: Record<string, string> = {}) => app.inject({ method: 'GET', url, headers });

describe('web compilada', () => {
  it('sirve index.html en / sin caché larga', async () => {
    const res = await get('/');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/^text\/html/);
    expect(res.headers['cache-control']).toBe('no-cache');
    expect(res.body).toBe(INDEX_HTML);
  });

  it.each(['/curso/kings-indian/main-line', '/repaso', '/perfil?tab=medallas', '/entrar/', '/ajustes'])(
    'vuelve a index.html en las rutas del SPA: %s',
    async (url) => {
      const res = await get(url);
      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toMatch(/^text\/html/);
      expect(res.headers['cache-control']).toBe('no-cache');
      expect(res.body).toBe(INDEX_HTML);
    },
  );

  it('responde a HEAD en las rutas del SPA', async () => {
    const res = await app.inject({ method: 'HEAD', url: '/puzzles' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/^text\/html/);
  });

  it('los ficheros de /assets llevan caché larga e inmutable', async () => {
    const res = await get('/assets/index-abc123.js');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/javascript/);
    expect(res.headers['cache-control']).toBe('public, max-age=31536000, immutable');
  });

  it('Stockfish: el .wasm se sirve como application/wasm', async () => {
    const wasm = await get('/stockfish/stockfish-19-lite-single.wasm');
    expect(wasm.statusCode).toBe(200);
    expect(wasm.headers['content-type']).toBe('application/wasm');
    expect(wasm.headers['cache-control']).toBe('public, max-age=604800');
    expect(wasm.rawPayload.equals(WASM)).toBe(true);
    const js = await get('/stockfish/stockfish-19-lite-single.js');
    expect(js.headers['content-type']).toMatch(/javascript/);
  });

  it('otros ficheros se revalidan', async () => {
    const res = await get('/favicon.svg');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/^image\/svg\+xml/);
    expect(res.headers['cache-control']).toBe('no-cache');
    expect(res.headers.etag).toBeDefined();
  });

  it('un fichero que no existe da 404 (no index.html)', async () => {
    for (const url of ['/assets/no-existe.js', '/stockfish/stockfish-18.wasm']) {
      const res = await get(url);
      expect(res.statusCode).toBe(404);
      expect(res.json().error.code).toBe('not_found');
    }
    // ...salvo que el navegador pida una página.
    expect((await get('/curso/v1.2', { accept: 'text/html,application/xhtml+xml' })).body).toBe(INDEX_HTML);
  });

  it('las rutas de /api nunca devuelven index.html', async () => {
    for (const url of ['/api/no-existe', '/api', '/api/auth']) {
      const res = await get(url, { accept: 'text/html' });
      expect(res.statusCode).toBe(404);
      expect(res.json()).toEqual({ error: { code: 'not_found', message: expect.any(String) } });
    }
    expect((await get('/api/health')).json()).toEqual({ ok: true });
  });

  it('solo GET y HEAD vuelven a index.html', async () => {
    const res = await app.inject({ method: 'POST', url: '/curso/kings-indian/main-line', payload: {} });
    expect(res.statusCode).toBe(404);
    expect(res.json().error.code).toBe('not_found');
  });

  it('la CSP permite el <script> en línea de index.html por su hash', async () => {
    const hash = createHash('sha256').update(INLINE).digest('base64');
    expect(inlineScriptHashes(INDEX_HTML)).toEqual([`sha256-${hash}`]);
    const res = await get('/');
    expect(res.headers['content-security-policy']).toContain(`script-src 'self' 'wasm-unsafe-eval' 'sha256-${hash}'`);
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('no sirve ficheros fuera de CLIENT_DIST', async () => {
    for (const url of ['/../package.json', '/%2e%2e/package.json', '/assets/..%2f..%2fpackage.json']) {
      const res = await get(url);
      expect(res.body).not.toContain('"name"');
    }
  });
});

describe('sin web compilada', () => {
  it('el servidor arranca igual y solo sirve la API', async () => {
    const apiOnly = await createTestApp({ env: { CLIENT_DIST: path.join(dist, 'no-existe') } });
    try {
      expect((await apiOnly.inject({ method: 'GET', url: '/api/health' })).statusCode).toBe(200);
      const res = await apiOnly.inject({ method: 'GET', url: '/curso/kings-indian/main-line' });
      expect(res.statusCode).toBe(404);
      expect(res.json().error.code).toBe('not_found');
    } finally {
      await apiOnly.close();
    }
  });
});
