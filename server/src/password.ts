// Contraseñas con scrypt de node:crypto. Cada hash lleva su sal aleatoria y los parámetros
// con los que se calculó, en formato PHC: $scrypt$ln=14,r=8,p=5$<sal>$<hash> (base64 sin
// relleno). Así se pueden endurecer los parámetros más adelante sin invalidar las cuentas:
// al iniciar sesión, los hashes antiguos se recalculan (ver `needsRehash`).

import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

export interface ScryptParams {
  /** log2(N): coste de CPU y memoria (memoria ≈ 128 · N · r bytes). */
  ln: number;
  r: number;
  p: number;
}

/** N = 2^14 (16 MiB), r = 8, p = 5: una de las configuraciones que recomienda OWASP. */
export const DEFAULT_SCRYPT_PARAMS: ScryptParams = { ln: 14, r: 8, p: 5 };

const SALT_BYTES = 16;
const KEY_BYTES = 64;
const HASH_RE = /^\$scrypt\$ln=(\d{1,2}),r=(\d{1,2}),p=(\d{1,2})\$([A-Za-z0-9+/]{16,})\$([A-Za-z0-9+/]{16,})$/;

interface ParsedHash {
  params: ScryptParams;
  salt: Buffer;
  key: Buffer;
}

function derive(password: string, salt: Buffer, keyLength: number, { ln, r, p }: ScryptParams): Promise<Buffer> {
  const N = 2 ** ln;
  return new Promise((resolve, reject) => {
    // maxmem con margen: OpenSSL necesita algo más de 128 · N · r bytes.
    scrypt(normalize(password), salt, keyLength, { N, r, p, maxmem: 256 * N * r }, (err, key) => (err ? reject(err) : resolve(key)));
  });
}

/** Misma contraseña escrita con caracteres compuestos o descompuestos (á, ñ...) = mismo hash. */
function normalize(password: string): string {
  return password.normalize('NFC');
}

const b64 = (buf: Buffer) => buf.toString('base64').replace(/=+$/, '');

export async function hashPassword(password: string, params: ScryptParams = DEFAULT_SCRYPT_PARAMS): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const key = await derive(password, salt, KEY_BYTES, params);
  return `$scrypt$ln=${params.ln},r=${params.r},p=${params.p}$${b64(salt)}$${b64(key)}`;
}

function parseHash(stored: string): ParsedHash | null {
  const m = HASH_RE.exec(stored);
  if (!m) return null;
  const params = { ln: Number(m[1]), r: Number(m[2]), p: Number(m[3]) };
  // Límites para no aceptar parámetros absurdos (o peligrosos para la memoria).
  if (params.ln < 1 || params.ln > 20 || params.r < 1 || params.r > 32 || params.p < 1 || params.p > 16) return null;
  const salt = Buffer.from(m[4], 'base64');
  const key = Buffer.from(m[5], 'base64');
  if (salt.length < 8 || key.length < 16) return null;
  return { params, salt, key };
}

/** Comprueba una contraseña en tiempo constante. Un hash mal formado nunca coincide. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parsed = parseHash(stored);
  if (!parsed) return false;
  const key = await derive(password, parsed.salt, parsed.key.length, parsed.params);
  return timingSafeEqual(key, parsed.key);
}

/** true si el hash se calculó con otros parámetros y conviene recalcularlo. */
export function needsRehash(stored: string, params: ScryptParams = DEFAULT_SCRYPT_PARAMS): boolean {
  const parsed = parseHash(stored);
  return !parsed || parsed.params.ln !== params.ln || parsed.params.r !== params.r || parsed.params.p !== params.p || parsed.key.length !== KEY_BYTES;
}

const dummyHashes = new Map<string, Promise<string>>();

/**
 * Hash de una contraseña aleatoria con los mismos parámetros que los reales. Al iniciar
 * sesión con un email que no existe se verifica contra él, para que la respuesta tarde lo
 * mismo que con una contraseña errónea y no delate qué emails tienen cuenta.
 */
export function dummyHash(params: ScryptParams = DEFAULT_SCRYPT_PARAMS): Promise<string> {
  const id = `${params.ln},${params.r},${params.p}`;
  let hash = dummyHashes.get(id);
  if (!hash) {
    hash = hashPassword(randomBytes(32).toString('hex'), params);
    dummyHashes.set(id, hash);
  }
  return hash;
}
