// Cabeceras de seguridad y protección CSRF por la cabecera Origin.

import type { FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from './errors';

/**
 * Content-Security-Policy de la web. Stockfish es WebAssembly en un Web Worker
 * ('wasm-unsafe-eval' y worker-src), y las fuentes vienen de Google Fonts.
 * `scriptHashes` son los sha256 de los <script> en línea de index.html, si los hubiera.
 */
export function contentSecurityPolicy(scriptHashes: string[] = []): string {
  return [
    "default-src 'self'",
    ["script-src 'self' 'wasm-unsafe-eval'", ...scriptHashes.map((h) => `'${h}'`)].join(' '),
    "worker-src 'self' blob:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');
}

export function securityHeaders(options: { csp: string; hsts: boolean }): Record<string, string> {
  const headers: Record<string, string> = {
    'content-security-policy': options.csp,
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'x-frame-options': 'DENY',
    'cross-origin-opener-policy': 'same-origin',
    'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  };
  // Solo tiene efecto servido por HTTPS; se activa en producción con cookies Secure.
  if (options.hsts) headers['strict-transport-security'] = 'max-age=15552000; includeSubDomains';
  return headers;
}

export function isApiPath(url: string): boolean {
  return url === '/api' || url.startsWith('/api/') || url.startsWith('/api?');
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * true si una petición puede modificar datos según su cabecera Origin: o no la trae
 * (clientes que no son navegadores), o coincide con el host al que va dirigida, o está en
 * la lista de orígenes permitidos (ALLOWED_ORIGINS, p. ej. Vite en desarrollo).
 */
export function isOriginAllowed(origin: string | undefined, host: string, allowed: ReadonlySet<string>): boolean {
  if (origin === undefined) return true;
  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    return false; // incluido "null" (iframes con sandbox, redirecciones entre orígenes...)
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
  if (allowed.has(url.origin)) return true;
  if (!host) return false;
  try {
    // Se interpreta el host con el esquema del origen para normalizar el puerto por defecto.
    return new URL(`${url.protocol}//${host}`).host === url.host;
  } catch {
    return false;
  }
}

/** Hook onRequest: 403 si una petición que modifica datos viene de otro origen. */
export function csrfGuard(allowedOrigins: string[]) {
  const allowed = new Set(allowedOrigins);
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    if (SAFE_METHODS.has(request.method)) return;
    if (!isOriginAllowed(request.headers.origin, request.host, allowed)) {
      throw new AppError(403, 'forbidden', 'Cross-origin request blocked');
    }
  };
}
