// Geometría del tablero: casillas, coordenadas en pantalla, FEN y flechas.
import type { PieceColor, PieceType } from './pieces';

export type Orientation = 'white' | 'black';

export const FILES = 'abcdefgh';

/** Columna y fila en pantalla (0–7, la fila 0 arriba) de una casilla. */
export function toXY(square: string, orientation: Orientation): { x: number; y: number } {
  const f = FILES.indexOf(square[0]);
  const r = Number(square[1]) - 1;
  return orientation === 'white' ? { x: f, y: 7 - r } : { x: 7 - f, y: r };
}

export function fromXY(x: number, y: number, orientation: Orientation): string {
  return orientation === 'white' ? `${FILES[x]}${8 - y}` : `${FILES[7 - x]}${y + 1}`;
}

export function isLightSquare(square: string): boolean {
  const f = FILES.indexOf(square[0]);
  const r = Number(square[1]) - 1;
  return (f + r) % 2 === 1;
}

export interface BoardPiece {
  color: PieceColor;
  type: PieceType;
}

/** Piezas de la parte de colocación de un FEN. */
export function parsePlacement(fen: string): Map<string, BoardPiece> {
  const map = new Map<string, BoardPiece>();
  const rows = (fen.split(' ')[0] ?? '').split('/');
  rows.forEach((row, r) => {
    let f = 0;
    for (const ch of row) {
      if (/\d/.test(ch)) {
        f += Number(ch);
        continue;
      }
      const lower = ch.toLowerCase();
      if ('pnbrqk'.includes(lower) && f < 8 && r < 8) {
        map.set(`${FILES[f]}${8 - r}`, { color: ch === lower ? 'b' : 'w', type: lower as PieceType });
      }
      f++;
    }
  });
  return map;
}

export function squareDistance(a: string, b: string): number {
  const dx = FILES.indexOf(a[0]) - FILES.indexOf(b[0]);
  const dy = Number(a[1]) - Number(b[1]);
  return Math.hypot(dx, dy);
}

// --- Flechas ---------------------------------------------------------------
// Unidades del SVG: 100 por casilla (tablero de 800×800). Las medidas salen de la
// maqueta (casilla de 75 px: trazo 14, punta 28 × 38, inicio separado 16 del centro).

export const ARROW = {
  width: 18.5,
  headLength: 37,
  headHalf: 25,
  startOffset: 21,
} as const;

interface Pt {
  x: number;
  y: number;
}

export function squareCenter(square: string, orientation: Orientation): Pt {
  const { x, y } = toXY(square, orientation);
  return { x: x * 100 + 50, y: y * 100 + 50 };
}

const fmt = (p: Pt) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`;

/**
 * Trazo y punta de una flecha que pasa por las casillas dadas (origen, codos, destino).
 * El trazo es una polilínea de grosor fijo; la punta, un triángulo.
 */
export function arrowPaths(squares: string[], orientation: Orientation): { shaft: string; head: string } | null {
  const pts = squares.map((s) => squareCenter(s, orientation));
  if (pts.length < 2) return null;
  const a = pts[pts.length - 2];
  const b = pts[pts.length - 1];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  if (len === 0) return null;
  const ux = dx / len;
  const uy = dy / len;
  const base = { x: b.x - ux * ARROW.headLength, y: b.y - uy * ARROW.headLength };
  const s = pts[0];
  const n = pts[1];
  const sl = Math.hypot(n.x - s.x, n.y - s.y) || 1;
  const start = { x: s.x + ((n.x - s.x) / sl) * ARROW.startOffset, y: s.y + ((n.y - s.y) / sl) * ARROW.startOffset };
  const shaft = [start, ...pts.slice(1, -1), base].map(fmt).join(' ');
  const head = [
    { x: base.x - uy * ARROW.headHalf, y: base.y + ux * ARROW.headHalf },
    b,
    { x: base.x + uy * ARROW.headHalf, y: base.y - ux * ARROW.headHalf },
  ]
    .map(fmt)
    .join(' ');
  return { shaft, head };
}
