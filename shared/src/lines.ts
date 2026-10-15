import { Chess } from 'chess.js';
import type { Color, Course, LineDef, MoveNote } from './types';

export const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export interface Ply {
  /** Índice desde 0 dentro de la línea. */
  index: number;
  san: string;
  from: string;
  to: string;
  promotion?: string;
  color: Color;
  moveNumber: number;
  /** "6...e5" o "9.Ne1". */
  key: string;
  fenBefore: string;
  fenAfter: string;
  note?: MoveNote;
}

/** "1.d4 Nf6 2.c4 g6" -> ["d4", "Nf6", "c4", "g6"]. */
export function splitMoves(moves: string): string[] {
  return moves
    .replace(/\{[^}]*\}/g, ' ')
    .split(/\s+/)
    .map((t) => t.replace(/^\d+\.(\.\.)?/, ''))
    .filter((t) => t && !/^(1-0|0-1|1\/2-1\/2|\*)$/.test(t));
}

export function noteKey(moveNumber: number, color: Color, san: string): string {
  return `${moveNumber}${color === 'w' ? '.' : '...'}${san}`;
}

/** Reproduce una secuencia de jugadas y devuelve cada media jugada. Lanza un error si alguna es ilegal. */
export function playMoves(moves: string | string[], startFen = START_FEN, notes?: Record<string, MoveNote>): Ply[] {
  const sans = Array.isArray(moves) ? moves : splitMoves(moves);
  const chess = new Chess(startFen);
  return sans.map((san, index) => {
    const fenBefore = chess.fen();
    const color = chess.turn() as Color;
    const moveNumber = chess.moveNumber();
    let mv;
    try {
      mv = chess.move(san);
    } catch {
      throw new Error(`Jugada ilegal "${san}" (media jugada ${index + 1}) en: ${sans.join(' ')}`);
    }
    const key = noteKey(moveNumber, color, mv.san);
    return {
      index,
      san: mv.san,
      from: mv.from,
      to: mv.to,
      promotion: mv.promotion,
      color,
      moveNumber,
      key,
      fenBefore,
      fenAfter: chess.fen(),
      note: notes?.[key],
    };
  });
}

export function playLine(line: LineDef): Ply[] {
  return playMoves(line.moves, START_FEN, line.notes);
}

/** FEN sin los contadores de jugadas: identifica una posición aunque se llegue por otro orden. */
export function positionKey(fen: string): string {
  return fen.split(' ').slice(0, 4).join(' ');
}

/** FEN de la posición tras unas jugadas (o el propio FEN si se da). */
export function resolvePosition(spec: { fen?: string; moves?: string }): string {
  if (spec.fen) return spec.fen;
  if (!spec.moves) return START_FEN;
  const plies = playMoves(spec.moves);
  return plies.length ? plies[plies.length - 1].fenAfter : START_FEN;
}

export interface RepertoireNode {
  /** Jugada del repertorio cuando le toca al alumno. */
  user?: string;
  /** Respuestas del rival que el curso cubre. */
  opponent: string[];
  /** Líneas que pasan por esta posición. */
  lines: string[];
}

export interface Repertoire {
  side: Color;
  nodes: Map<string, RepertoireNode>;
  /** Conflictos: posiciones donde dos líneas recomiendan jugadas distintas al alumno. */
  conflicts: string[];
}

/** Árbol de repertorio de un curso, indexado por posición (detecta transposiciones). */
export function buildRepertoire(course: Course): Repertoire {
  const nodes = new Map<string, RepertoireNode>();
  const conflicts: string[] = [];
  for (const line of course.lines) {
    if (line.practice === false) continue;
    for (const ply of playLine(line)) {
      const key = positionKey(ply.fenBefore);
      let node = nodes.get(key);
      if (!node) {
        node = { opponent: [], lines: [] };
        nodes.set(key, node);
      }
      if (!node.lines.includes(line.id)) node.lines.push(line.id);
      if (ply.color === course.side) {
        if (node.user && node.user !== ply.san) {
          conflicts.push(`${line.id}: en ${key} el curso dice ${node.user} y esta línea ${ply.san}`);
        } else {
          node.user = ply.san;
        }
      } else if (!node.opponent.includes(ply.san)) {
        node.opponent.push(ply.san);
      }
    }
  }
  return { side: course.side, nodes, conflicts };
}

export interface Arrow {
  from: string;
  to: string;
  /** Casillas intermedias (para dibujar el codo del caballo). */
  via: string[];
}

/** "e2e4" o "g1f3:g1g3f3" (con codo) -> flecha. */
export function parseArrow(spec: string): Arrow {
  const [main, path] = spec.split(':');
  const from = main.slice(0, 2);
  const to = main.slice(2, 4);
  if (!/^[a-h][1-8][a-h][1-8]$/.test(main)) throw new Error(`Flecha inválida: ${spec}`);
  let via: string[] = [];
  if (path) {
    const squares = path.match(/[a-h][1-8]/g) ?? [];
    via = squares.slice(1, -1);
  } else if (isKnightJump(from, to)) {
    via = [knightElbow(from, to)];
  }
  return { from, to, via };
}

function isKnightJump(a: string, b: string): boolean {
  const dx = Math.abs(a.charCodeAt(0) - b.charCodeAt(0));
  const dy = Math.abs(Number(a[1]) - Number(b[1]));
  return (dx === 1 && dy === 2) || (dx === 2 && dy === 1);
}

/** Codo de la flecha de caballo: primero el tramo largo, como en los tableros de Lichess. */
function knightElbow(a: string, b: string): string {
  const dx = b.charCodeAt(0) - a.charCodeAt(0);
  const dy = Number(b[1]) - Number(a[1]);
  if (Math.abs(dy) === 2) return a[0] + b[1];
  return String.fromCharCode(a.charCodeAt(0) + dx) + a[1];
}
