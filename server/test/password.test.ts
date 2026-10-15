import { describe, expect, it } from 'vitest';
import { DEFAULT_SCRYPT_PARAMS, hashPassword, needsRehash, verifyPassword } from '../src/password';
import { FAST_SCRYPT } from './helpers';

describe('contraseñas con scrypt', () => {
  it('con los parámetros por defecto guarda sal y parámetros, y verifica en tiempo constante', async () => {
    const hash = await hashPassword('alfil-en-fianchetto');
    expect(hash).toMatch(/^\$scrypt\$ln=14,r=8,p=5\$[A-Za-z0-9+/]{22}\$[A-Za-z0-9+/]{86}$/);
    expect(await verifyPassword('alfil-en-fianchetto', hash)).toBe(true);
    expect(await verifyPassword('alfil-en-fianchettO', hash)).toBe(false);
    expect(needsRehash(hash)).toBe(false);
    expect(needsRehash(hash, FAST_SCRYPT)).toBe(true);
  });

  it('cada hash lleva una sal distinta', async () => {
    const [a, b] = await Promise.all([hashPassword('misma', FAST_SCRYPT), hashPassword('misma', FAST_SCRYPT)]);
    expect(a).not.toBe(b);
    expect(await verifyPassword('misma', a)).toBe(true);
    expect(await verifyPassword('misma', b)).toBe(true);
  });

  it('verifica con los parámetros guardados en el hash, no con los actuales', async () => {
    const old = await hashPassword('peón-pasado', FAST_SCRYPT);
    expect(await verifyPassword('peón-pasado', old)).toBe(true);
    expect(needsRehash(old, DEFAULT_SCRYPT_PARAMS)).toBe(true);
  });

  it('normaliza la contraseña a NFC (ñ compuesta = n + virgulilla)', async () => {
    const hash = await hashPassword('contraseña', FAST_SCRYPT);
    expect(await verifyPassword('contraseña', hash)).toBe(true);
  });

  it('un hash mal formado nunca coincide', async () => {
    for (const stored of ['', 'texto-plano', '$scrypt$ln=99,r=8,p=1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAA', '$argon2id$v=19$m=65536']) {
      expect(await verifyPassword('lo-que-sea', stored)).toBe(false);
      expect(needsRehash(stored)).toBe(true);
    }
  });
});
