// Stockfish (WASM) en Node para revisar el contenido. Solo se usa en scripts de desarrollo.
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export interface PvLine {
  multipv: number;
  /** Evaluación en centipeones desde el punto de vista del bando que mueve (mate = ±100000). */
  cp: number;
  mate?: number;
  depth: number;
  pv: string[];
}

export class Engine {
  private sf: { processCommand(cmd: string): void; terminate(): void; listener?: (line: string) => void };
  private waiters: Array<{ test: (line: string) => boolean; resolve: (line: string) => void }> = [];
  private onInfo?: (line: string) => void;

  constructor(flavor = 'single') {
    const init = require('stockfish') as (flavor: string, cb: (line: string) => void) => Engine['sf'];
    this.sf = init(flavor, (line: string) => this.handle(line));
  }

  private handle(line: string) {
    if (typeof line !== 'string') return;
    this.onInfo?.(line);
    const i = this.waiters.findIndex((w) => w.test(line));
    if (i >= 0) {
      const [w] = this.waiters.splice(i, 1);
      w.resolve(line);
    }
  }

  private waitFor(test: (line: string) => boolean): Promise<string> {
    return new Promise((resolve) => this.waiters.push({ test, resolve }));
  }

  send(cmd: string) {
    this.sf.processCommand(cmd);
  }

  async init(options: Record<string, string | number> = {}) {
    const ok = this.waitFor((l) => l === 'uciok');
    this.send('uci');
    await ok;
    for (const [k, v] of Object.entries(options)) this.send(`setoption name ${k} value ${v}`);
    await this.ready();
  }

  async ready() {
    const ok = this.waitFor((l) => l === 'readyok');
    this.send('isready');
    await ok;
  }

  /** Analiza una posición. Con `moves` se limita la búsqueda a esas jugadas (UCI). */
  async analyse(fen: string, opts: { depth?: number; multipv?: number; moves?: string[]; movetime?: number } = {}): Promise<PvLine[]> {
    const multipv = opts.multipv ?? 1;
    const lines = new Map<number, PvLine>();
    this.send(`setoption name MultiPV value ${multipv}`);
    await this.ready();
    this.onInfo = (line) => {
      if (!line.startsWith('info') || !line.includes(' pv ')) return;
      const depth = Number(line.match(/ depth (\d+)/)?.[1] ?? 0);
      const mpv = Number(line.match(/ multipv (\d+)/)?.[1] ?? 1);
      const cpM = line.match(/ score cp (-?\d+)/);
      const mateM = line.match(/ score mate (-?\d+)/);
      const pv = line.split(' pv ')[1].trim().split(/\s+/);
      if (line.includes('lowerbound') || line.includes('upperbound')) return;
      let cp: number;
      let mate: number | undefined;
      if (mateM) {
        mate = Number(mateM[1]);
        cp = mate > 0 ? 100000 - mate : -100000 - mate;
      } else cp = Number(cpM?.[1] ?? 0);
      lines.set(mpv, { multipv: mpv, cp, mate, depth, pv });
    };
    const done = this.waitFor((l) => l.startsWith('bestmove'));
    this.send(`position fen ${fen}`);
    const limit = opts.movetime ? `movetime ${opts.movetime}` : `depth ${opts.depth ?? 16}`;
    this.send(`go ${limit}${opts.moves?.length ? ` searchmoves ${opts.moves.join(' ')}` : ''}`);
    await done;
    this.onInfo = undefined;
    return [...lines.values()].sort((a, b) => a.multipv - b.multipv);
  }

  quit() {
    this.sf.terminate();
  }
}

/** Convierte una jugada SAN de chess.js a UCI. */
export function uci(move: { from: string; to: string; promotion?: string }): string {
  return move.from + move.to + (move.promotion ?? '');
}

export function fmt(cp: number): string {
  if (Math.abs(cp) > 90000) return cp > 0 ? `#${100000 - cp}` : `#-${100000 + cp}`;
  return (cp >= 0 ? '+' : '') + (cp / 100).toFixed(2);
}
