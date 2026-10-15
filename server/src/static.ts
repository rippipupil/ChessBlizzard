// Web compilada (client/dist) servida con @fastify/static, con vuelta a index.html para
// las rutas del SPA (/curso/..., /perfil...). En desarrollo no hace falta: Vite sirve la web
// y reenvía /api a este servidor.

import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import fastifyStatic from '@fastify/static';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { isApiPath } from './security';

export interface ClientBuild {
  root: string;
  /** sha256 de los <script> en línea de index.html, para permitirlos en la CSP. */
  inlineScriptHashes: string[];
}

/** Devuelve la web compilada de `dir`, o null si no hay index.html. */
export function loadClientBuild(dir: string): ClientBuild | null {
  const indexFile = path.join(dir, 'index.html');
  if (!existsSync(indexFile)) return null;
  return { root: dir, inlineScriptHashes: inlineScriptHashes(readFileSync(indexFile, 'utf8')) };
}

export function inlineScriptHashes(html: string): string[] {
  const hashes: string[] = [];
  for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    if (/\bsrc\s*=/i.test(attrs) || body.trim() === '') continue;
    hashes.push(`sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}`);
  }
  return hashes;
}

function cacheControl(relPath: string): string {
  // Vite pone un hash en el nombre de todo lo que hay en assets/: nunca cambia.
  if (relPath.startsWith('assets/')) return 'public, max-age=31536000, immutable';
  // El motor lleva la versión en el nombre (stockfish-19-lite-single.*) y pesa casi 2 MB.
  if (relPath.startsWith('stockfish/')) return 'public, max-age=604800';
  // index.html y el resto: siempre se revalida (ETag / Last-Modified).
  return 'no-cache';
}

export async function registerClient(app: FastifyInstance, build: ClientBuild): Promise<void> {
  await app.register(fastifyStatic, {
    root: build.root,
    prefix: '/',
    index: ['index.html'],
    // Si el build trae ficheros .br/.gz (p. ej. con un plugin de compresión), se usan.
    preCompressed: true,
    cacheControl: false,
    setHeaders(reply, filePath) {
      const rel = path.relative(build.root, filePath).split(path.sep).join('/').replace(/\.(br|gz)$/, '');
      reply.header('cache-control', cacheControl(rel));
      if (rel.endsWith('.wasm')) reply.header('content-type', 'application/wasm');
    },
  });
}

/**
 * ¿Se responde con index.html? Solo a GET/HEAD fuera de /api. Un fichero que no existe
 * (/assets/x.js) da 404 en vez de HTML, salvo que el navegador pida una página.
 */
export function wantsSpaFallback(request: FastifyRequest): boolean {
  if (request.method !== 'GET' && request.method !== 'HEAD') return false;
  const pathname = request.url.split('?')[0];
  if (isApiPath(pathname)) return false;
  const last = pathname.slice(pathname.lastIndexOf('/') + 1);
  return !last.includes('.') || (request.headers.accept ?? '').includes('text/html');
}
