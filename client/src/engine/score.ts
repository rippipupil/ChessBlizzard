// Utilidades de evaluación: probabilidad de ganar, formato y clasificación de jugadas.

export interface Score {
  /** Centipeones desde el punto de vista de las blancas. */
  cp?: number;
  /** Mate en N desde el punto de vista de las blancas (positivo: ganan las blancas). */
  mate?: number;
  /** Partida terminada en esta posición: quién ha ganado (o tablas). */
  winner?: 'w' | 'b' | 'draw';
}

/** Valor numérico comparable: los mates se convierten en ±10000 (más cerca, más grande). */
export function scoreValue(s: Score | null | undefined): number {
  if (!s) return 0;
  if (s.winner) return s.winner === 'w' ? 10000 : s.winner === 'b' ? -10000 : 0;
  if (s.mate !== undefined) {
    if (s.mate === 0) return 0;
    return s.mate > 0 ? 10000 - s.mate * 10 : -10000 - s.mate * 10;
  }
  return s.cp ?? 0;
}

/** Cambia el punto de vista: de las blancas al bando indicado. */
export function povScore(s: Score, color: 'w' | 'b'): Score {
  if (color === 'w') return s;
  const winner = s.winner === 'w' ? 'b' : s.winner === 'b' ? 'w' : s.winner;
  return { cp: s.cp !== undefined ? -s.cp : undefined, mate: s.mate !== undefined ? -s.mate : undefined, winner };
}

/** Probabilidad de ganar de las blancas (0–100), con la fórmula de Lichess. */
export function winPercent(s: Score | null | undefined): number {
  if (!s) return 50;
  if (s.winner) return s.winner === 'w' ? 100 : s.winner === 'b' ? 0 : 50;
  if (s.mate !== undefined) return s.mate > 0 ? 100 : s.mate < 0 ? 0 : 50;
  const cp = Math.max(-1000, Math.min(1000, s.cp ?? 0));
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1);
}

const MINUS = '−';

/**
 * "+0,3", "−1,2", "M3", "−M2". Con locale 'es' se usa coma decimal.
 * `pov` cambia el signo para mostrar la evaluación desde el punto de vista de un bando.
 */
export function formatScore(s: Score | null | undefined, locale: 'es' | 'en', opts: { pov?: 'w' | 'b'; digits?: number } = {}): string {
  if (!s) return '…';
  // El resultado se escribe siempre desde las blancas, como en un PGN.
  if (s.winner) return s.winner === 'draw' ? '½-½' : s.winner === 'w' ? '1-0' : '0-1';
  const v = povScore(s, opts.pov ?? 'w');
  if (v.mate !== undefined) {
    if (v.mate === 0) return '#';
    return `${v.mate < 0 ? MINUS : ''}M${Math.abs(v.mate)}`;
  }
  const pawns = (v.cp ?? 0) / 100;
  const digits = opts.digits ?? 1;
  const abs = Math.abs(pawns).toFixed(digits);
  const num = locale === 'es' ? abs.replace('.', ',') : abs;
  if (Number(abs) === 0) return num;
  return `${pawns < 0 ? MINUS : '+'}${num}`;
}

export type MoveClass = 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';

/**
 * Clasifica una jugada por lo que pierde en probabilidad de ganar (puntos de 0 a 100) para
 * el bando que juega, con los umbrales de Lichess (0,1 / 0,2 / 0,3 en "winning chances").
 */
export function classifyLoss(loss: number, isBest: boolean): MoveClass {
  if (isBest || loss <= 1) return 'best';
  if (loss < 5) return 'good';
  if (loss < 10) return 'inaccuracy';
  if (loss < 15) return 'mistake';
  return 'blunder';
}

/** Precisión de una jugada (0–100) a partir de la pérdida, como en Lichess. */
export function moveAccuracy(loss: number): number {
  const acc = 103.1668 * Math.exp(-0.04354 * Math.max(0, loss)) - 3.1669;
  return Math.max(0, Math.min(100, acc));
}
