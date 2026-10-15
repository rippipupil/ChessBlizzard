// Cliente de Stockfish 19 (WASM, versión lite de un hilo) en un Web Worker.
//
// Hay un único motor para toda la app, creado la primera vez que alguien lo pide.
// Habla UCI por postMessage. Las búsquedas se hacen de una en una en una cola:
//  - Cada búsqueda pertenece a un "canal" ('live', 'compare', 'review', 'play'...). Una
//    búsqueda nueva cancela las anteriores de su mismo canal (en cola o en curso).
//  - Las búsquedas "interrumpibles" (el análisis en directo) se detienen con `stop` en
//    cuanto llega cualquier otra petición, para que la jugada del sparring o una
//    comparación no tengan que esperar.
// Las evaluaciones se devuelven siempre desde el punto de vista de las blancas.
import { pvToSan } from '../board/chess';

export interface EngineLine {
  multipv: number;
  depth: number;
  /** Centipeones desde el punto de vista de las blancas (cuando no hay mate). */
  cp?: number;
  /** Mate en N desde el punto de vista de las blancas (positivo: ganan las blancas). */
  mate?: number;
  /** Variante principal en UCI ("e2e4", "e7e8q"). */
  pv: string[];
  /** La misma variante en SAN inglés (en el resultado final; en directo la añade useAnalysis). */
  san?: string[];
}

export interface EngineResult {
  lines: EngineLine[];
  /** Mejor jugada en UCI, o null si no hay jugadas legales o la búsqueda se canceló pronto. */
  best: string | null;
  cancelled: boolean;
}

export interface AnalyzeOptions {
  multipv?: number;
  depth?: number;
  movetime?: number;
  /** Limita la búsqueda a estas jugadas (UCI). */
  searchmoves?: string[];
  channel?: string;
  /** Si es true, cualquier otra petición detiene esta búsqueda. */
  preemptible?: boolean;
  /** Se llama con las líneas cada vez que el motor informa (sin limitar la frecuencia). */
  onUpdate?: (lines: EngineLine[]) => void;
}

export interface PlayOptions {
  /** Skill Level de Stockfish, 0–20 (20 = fuerza completa). */
  skill?: number;
  /** Elo con UCI_LimitStrength (Stockfish acepta 1320 como mínimo). */
  elo?: number;
  movetime?: number;
  depth?: number;
  channel?: string;
}

export interface EngineTask<T> {
  promise: Promise<T>;
  cancel(): void;
}

interface Job {
  channel: string;
  preemptible: boolean;
  fen: string;
  stm: 'w' | 'b';
  options: Record<string, string>;
  go: string;
  onUpdate?: (lines: EngineLine[]) => void;
  lines: Map<number, EngineLine>;
  cancelled: boolean;
  started: boolean;
  resolve(result: EngineResult): void;
}

interface Waiter {
  test(line: string): boolean;
  resolve(line: string): void;
  reject(err: Error): void;
  timer?: ReturnType<typeof setTimeout>;
}

export const MIN_ELO = 1320;
const BOOT_TIMEOUT = 30_000;

function engineUrl(): string {
  const base = (import.meta.env?.BASE_URL as string | undefined) ?? '/';
  return `${base.replace(/\/?$/, '/')}stockfish/stockfish-19-lite-single.js`;
}

/** Interpreta una línea "info ... score ... pv ..." (puntuación del bando que mueve). */
export function parseInfo(line: string, stm: 'w' | 'b'): EngineLine | null {
  if (!line.startsWith('info ') || !line.includes(' pv ')) return null;
  if (line.includes(' lowerbound') || line.includes(' upperbound')) return null;
  const depth = Number(/ depth (\d+)/.exec(line)?.[1] ?? NaN);
  if (!Number.isFinite(depth)) return null;
  const multipv = Number(/ multipv (\d+)/.exec(line)?.[1] ?? 1);
  const cpM = / score cp (-?\d+)/.exec(line);
  const mateM = / score mate (-?\d+)/.exec(line);
  if (!cpM && !mateM) return null;
  const sign = stm === 'w' ? 1 : -1;
  const pv = line.slice(line.indexOf(' pv ') + 4).trim().split(/\s+/).filter(Boolean);
  const out: EngineLine = { multipv, depth, pv };
  if (mateM) out.mate = Number(mateM[1]) * sign;
  else out.cp = Number(cpM![1]) * sign;
  return out;
}

export class StockfishEngine {
  private worker: Worker | null = null;
  private booting: Promise<void> | null = null;
  private queue: Job[] = [];
  private current: Job | null = null;
  private waiters: Waiter[] = [];
  private optionState = new Map<string, string>();
  private pumping = false;
  /** Último error al arrancar (para mostrarlo en la interfaz). */
  error: Error | null = null;
  /** Escucha opcional de todas las líneas del motor (depuración). */
  debug?: (dir: '<' | '>', line: string) => void;

  /** Analiza una posición. Devuelve las líneas finales (o las parciales si se cancela). */
  analyze(fen: string, opts: AnalyzeOptions = {}): EngineTask<EngineResult> {
    const multipv = Math.max(1, Math.min(5, opts.multipv ?? 1));
    const limit = opts.movetime ? `movetime ${opts.movetime}` : `depth ${opts.depth ?? 16}`;
    const search = opts.searchmoves?.length ? ` searchmoves ${opts.searchmoves.join(' ')}` : '';
    return this.enqueue({
      channel: opts.channel ?? 'analysis',
      preemptible: opts.preemptible ?? false,
      fen,
      options: { MultiPV: String(multipv), UCI_LimitStrength: 'false', 'Skill Level': '20' },
      go: `go ${limit}${search}`,
      onUpdate: opts.onUpdate,
    });
  }

  /** Pide una jugada con la fuerza indicada. Resuelve con la jugada en UCI (o null). */
  play(fen: string, opts: PlayOptions = {}): EngineTask<string | null> {
    const options: Record<string, string> = { MultiPV: '1' };
    if (opts.elo !== undefined) {
      options.UCI_LimitStrength = 'true';
      options.UCI_Elo = String(Math.max(MIN_ELO, Math.round(opts.elo)));
      options['Skill Level'] = '20';
    } else {
      options.UCI_LimitStrength = 'false';
      options['Skill Level'] = String(Math.max(0, Math.min(20, Math.round(opts.skill ?? 20))));
    }
    const parts = ['go'];
    if (opts.depth) parts.push(`depth ${opts.depth}`);
    if (opts.movetime || !opts.depth) parts.push(`movetime ${opts.movetime ?? 500}`);
    const task = this.enqueue({ channel: opts.channel ?? 'play', preemptible: false, fen, options, go: parts.join(' ') });
    return { promise: task.promise.then((r) => r.best), cancel: task.cancel };
  }

  /** Arranca el motor sin pedir nada (para precargarlo). */
  warmUp(): Promise<void> {
    return this.boot();
  }

  private enqueue(spec: Omit<Job, 'stm' | 'lines' | 'cancelled' | 'started' | 'resolve'>): EngineTask<EngineResult> {
    let resolve!: (r: EngineResult) => void;
    const promise = new Promise<EngineResult>((r) => (resolve = r));
    const job: Job = {
      ...spec,
      stm: spec.fen.split(' ')[1] === 'b' ? 'b' : 'w',
      lines: new Map(),
      cancelled: false,
      started: false,
      resolve,
    };
    // Una búsqueda nueva sustituye a las de su canal.
    for (const other of [...this.queue, this.current]) {
      if (other && other.channel === job.channel) this.cancelJob(other);
    }
    // El análisis en directo cede el paso a cualquier otra petición.
    if (this.current && this.current.preemptible && this.current !== job) this.cancelJob(this.current);
    this.queue.push(job);
    void this.pump();
    return { promise, cancel: () => this.cancelJob(job) };
  }

  private cancelJob(job: Job) {
    if (job.cancelled) return;
    job.cancelled = true;
    if (this.current === job && job.started) this.send('stop');
  }

  private finish(job: Job, best: string | null) {
    const lines = [...job.lines.values()]
      .sort((a, b) => a.multipv - b.multipv)
      .map((l) => ({ ...l, san: pvToSan(job.fen, l.pv, 16) }));
    job.resolve({ lines, best, cancelled: job.cancelled });
  }

  /** Detiene la búsqueda en curso y descarta las que esperan en la cola. */
  stop() {
    for (const job of [...this.queue, this.current]) if (job) this.cancelJob(job);
  }

  private async pump() {
    if (this.pumping) return;
    this.pumping = true;
    try {
      while (this.queue.length) {
        const job = this.queue.shift()!;
        if (job.cancelled) {
          this.finish(job, null);
          continue;
        }
        try {
          await this.boot();
          await this.run(job);
        } catch (err) {
          this.current = null;
          this.finish(job, null);
          this.reset(err instanceof Error ? err : new Error(String(err)));
        }
      }
    } finally {
      this.pumping = false;
    }
  }

  private async run(job: Job) {
    for (const [name, value] of Object.entries(job.options)) {
      if (this.optionState.get(name) !== value) {
        this.send(`setoption name ${name} value ${value}`);
        this.optionState.set(name, value);
      }
    }
    await this.request('isready', (l) => l === 'readyok', 15_000);
    if (job.cancelled) {
      this.finish(job, null);
      return;
    }
    this.current = job;
    const done = this.waitFor((l) => l.startsWith('bestmove'), 0);
    this.send(`position fen ${job.fen}`);
    this.send(job.go);
    job.started = true;
    // Si se canceló justo antes de empezar, paramos ya.
    if (job.cancelled) this.send('stop');
    const line = await done;
    this.current = null;
    const best = line.split(/\s+/)[1];
    this.finish(job, best && best !== '(none)' ? best : null);
  }

  private boot(): Promise<void> {
    if (this.booting) return this.booting;
    this.booting = new Promise<void>((resolve, reject) => {
      let worker: Worker;
      try {
        worker = new Worker(engineUrl());
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
        return;
      }
      this.worker = worker;
      worker.onmessage = (ev: MessageEvent) => {
        const data = ev.data;
        if (typeof data !== 'string') return;
        for (const line of data.split('\n')) if (line) this.onLine(line.trim());
      };
      worker.onerror = (ev) => {
        ev.preventDefault?.();
        this.reset(new Error(ev.message || 'Stockfish no se pudo cargar'));
      };
      this.request('uci', (l) => l === 'uciok', BOOT_TIMEOUT)
        .then(() => this.request('isready', (l) => l === 'readyok', BOOT_TIMEOUT))
        .then(() => {
          this.error = null;
          resolve();
        }, reject);
    });
    // Si falla el arranque, permitimos reintentarlo más tarde.
    this.booting.catch((err: Error) => this.reset(err));
    return this.booting;
  }

  /** Tira el worker y rechaza todo lo pendiente. La siguiente petición lo vuelve a crear. */
  private reset(err: Error) {
    this.error = err;
    const worker = this.worker;
    this.worker = null;
    this.booting = null;
    this.optionState.clear();
    try {
      worker?.terminate();
    } catch {
      // Nada que hacer.
    }
    const waiters = this.waiters.splice(0);
    for (const w of waiters) {
      if (w.timer) clearTimeout(w.timer);
      w.reject(err);
    }
    if (this.current) {
      const job = this.current;
      this.current = null;
      this.finish(job, null);
    }
  }

  private onLine(line: string) {
    this.debug?.('<', line);
    const job = this.current;
    if (job && line.startsWith('info ')) {
      const info = parseInfo(line, job.stm);
      if (info && !job.cancelled) {
        // Al empezar una profundidad nueva, las líneas de MultiPV llegan de una en una.
        job.lines.set(info.multipv, info);
        job.onUpdate?.([...job.lines.values()].sort((a, b) => a.multipv - b.multipv));
      }
    }
    const i = this.waiters.findIndex((w) => w.test(line));
    if (i >= 0) {
      const [w] = this.waiters.splice(i, 1);
      if (w.timer) clearTimeout(w.timer);
      w.resolve(line);
    }
  }

  private send(cmd: string) {
    this.debug?.('>', cmd);
    this.worker?.postMessage(cmd);
  }

  private waitFor(test: (line: string) => boolean, timeout: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const w: Waiter = { test, resolve, reject };
      if (timeout > 0) {
        w.timer = setTimeout(() => {
          const i = this.waiters.indexOf(w);
          if (i >= 0) this.waiters.splice(i, 1);
          reject(new Error('Stockfish no responde'));
        }, timeout);
      }
      this.waiters.push(w);
    });
  }

  private request(cmd: string, test: (line: string) => boolean, timeout: number): Promise<string> {
    const p = this.waitFor(test, timeout);
    this.send(cmd);
    return p;
  }
}

let shared: StockfishEngine | null = null;

/** El motor compartido de la app (se crea al pedirlo por primera vez). */
export function getEngine(): StockfishEngine {
  if (!shared) shared = new StockfishEngine();
  return shared;
}
