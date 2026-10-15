// Hook de análisis en directo: lanza Stockfish sobre una posición y devuelve las
// mejores líneas (con la variante en SAN) a medida que el motor profundiza.
import { useEffect, useState } from 'react';
import { gameEnd, makeChess, pvToSan, type GameEnd } from '../board/chess';
import type { Score } from './score';
import { getEngine, type EngineLine } from './stockfish';

export interface AnalysisLine extends EngineLine {
  /** Variante principal en SAN inglés (hasta 12 medias jugadas). */
  san: string[];
}

export interface AnalysisState {
  fen: string | null;
  /** Profundidad de la línea principal. */
  depth: number;
  lines: AnalysisLine[];
  /** El motor sigue pensando. */
  running: boolean;
  /** La partida ha terminado en esta posición (no hay nada que analizar). */
  end: GameEnd;
  error: string | null;
}

export interface AnalysisOptions {
  enabled?: boolean;
  multipv?: number;
  depth?: number;
}

const IDLE: AnalysisState = { fen: null, depth: 0, lines: [], running: false, end: null, error: null };

function toDisplay(fen: string, lines: EngineLine[]): AnalysisLine[] {
  return lines.map((l) => ({ ...l, san: pvToSan(fen, l.pv, 12) }));
}

export function useAnalysis(fen: string | null, { enabled = true, multipv = 1, depth = 18 }: AnalysisOptions = {}): AnalysisState {
  const [state, setState] = useState<AnalysisState>(IDLE);

  useEffect(() => {
    if (!enabled || !fen) {
      setState(IDLE);
      return;
    }
    const chess = makeChess(fen);
    if (!chess) {
      setState({ ...IDLE, fen, error: 'fen' });
      return;
    }
    const end = gameEnd(chess);
    if (end) {
      setState({ ...IDLE, fen, end });
      return;
    }
    let alive = true;
    let pending: EngineLine[] | null = null;
    let flushTimer: ReturnType<typeof setTimeout> | undefined;
    let task: ReturnType<ReturnType<typeof getEngine>['analyze']> | undefined;

    const flush = () => {
      flushTimer = undefined;
      if (!alive || !pending) return;
      const lines = toDisplay(fen, pending);
      pending = null;
      setState({ fen, depth: lines[0]?.depth ?? 0, lines, running: true, end: null, error: null });
    };

    setState((s) => ({ fen, depth: 0, lines: s.fen === fen ? s.lines : [], running: true, end: null, error: null }));

    // Pequeña espera: si el usuario recorre jugadas deprisa, no lanzamos una búsqueda por cada una.
    const start = setTimeout(() => {
      task = getEngine().analyze(fen, {
        multipv,
        depth,
        channel: 'live',
        preemptible: true,
        onUpdate: (lines) => {
          pending = lines;
          if (!flushTimer) flushTimer = setTimeout(flush, 120);
        },
      });
      task.promise.then(
        (res) => {
          if (!alive) return;
          if (flushTimer) clearTimeout(flushTimer);
          const lines = toDisplay(fen, res.lines);
          setState((s) => ({
            fen,
            depth: lines[0]?.depth ?? s.depth,
            lines: lines.length ? lines : s.lines,
            running: false,
            end: null,
            error: null,
          }));
        },
        (err: unknown) => {
          if (alive) setState((s) => ({ ...s, running: false, error: err instanceof Error ? err.message : String(err) }));
        },
      );
    }, 70);

    return () => {
      alive = false;
      clearTimeout(start);
      if (flushTimer) clearTimeout(flushTimer);
      task?.cancel();
    };
  }, [fen, enabled, multipv, depth]);

  return state;
}

/** Evaluación de la línea principal (desde las blancas), o la del final de partida. */
export function analysisScore(a: AnalysisState): Score | null {
  if (a.end === 'checkmate' && a.fen) {
    // Le toca mover al bando que ha recibido mate.
    return { winner: a.fen.split(' ')[1] === 'w' ? 'b' : 'w' };
  }
  if (a.end) return { winner: 'draw' };
  const top = a.lines[0];
  if (!top) return null;
  return { cp: top.cp, mate: top.mate };
}
