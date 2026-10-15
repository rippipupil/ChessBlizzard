// Copia el motor Stockfish (versión lite de un hilo) a public/ para servirlo como Web Worker.
import { copyFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const bin = join(dirname(require.resolve('stockfish/package.json')), 'bin');
const out = join(here, '..', 'public', 'stockfish');
mkdirSync(out, { recursive: true });
for (const file of ['stockfish-19-lite-single.js', 'stockfish-19-lite-single.wasm']) {
  copyFileSync(join(bin, file), join(out, file));
}
console.log('Stockfish copiado a public/stockfish');
