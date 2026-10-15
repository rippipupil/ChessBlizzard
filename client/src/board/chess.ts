// Ayudas sobre chess.js para el tablero y las lecciones.
import { Chess, type Move } from 'chess.js';

export type Side = 'w' | 'b';

export function makeChess(fen: string): Chess | null {
  try {
    return new Chess(fen);
  } catch {
    return null;
  }
}

/** Destinos legales por casilla de origen, en el formato que espera <Board movable>. */
export function legalDests(fenOrChess: string | Chess): Map<string, string[]> {
  const chess = typeof fenOrChess === 'string' ? makeChess(fenOrChess) : fenOrChess;
  const map = new Map<string, string[]>();
  if (!chess) return map;
  for (const m of chess.moves({ verbose: true })) {
    const list = map.get(m.from);
    if (!list) map.set(m.from, [m.to]);
    else if (!list.includes(m.to)) list.push(m.to);
  }
  return map;
}

/** Casilla del rey en jaque (del bando al que le toca), o null. */
export function checkSquare(fenOrChess: string | Chess): string | null {
  const chess = typeof fenOrChess === 'string' ? makeChess(fenOrChess) : fenOrChess;
  if (!chess || !chess.inCheck()) return null;
  const turn = chess.turn();
  const [sq] = chess.findPiece({ type: 'k', color: turn });
  return sq ?? null;
}

export function sideToMove(fen: string): Side {
  return fen.split(' ')[1] === 'b' ? 'b' : 'w';
}

export interface PlayedMove {
  san: string;
  from: string;
  to: string;
  promotion?: string;
  captured?: string;
  fenBefore: string;
  fenAfter: string;
  color: Side;
  moveNumber: number;
  /** "e2e4", "e7e8q". */
  uci: string;
}

function toPlayed(m: Move, moveNumber: number): PlayedMove {
  return {
    san: m.san,
    from: m.from,
    to: m.to,
    promotion: m.promotion,
    captured: m.captured,
    fenBefore: m.before,
    fenAfter: m.after,
    color: m.color,
    moveNumber,
    uci: m.from + m.to + (m.promotion ?? ''),
  };
}

/** Intenta una jugada desde un FEN. Devuelve null si es ilegal. */
export function tryMove(fen: string, from: string, to: string, promotion?: string): PlayedMove | null {
  const chess = makeChess(fen);
  if (!chess) return null;
  const moveNumber = chess.moveNumber();
  try {
    const m = chess.move({ from, to, promotion: promotion ?? 'q' });
    return toPlayed(m, moveNumber);
  } catch {
    return null;
  }
}

/** Juega una jugada en SAN o UCI desde un FEN. */
export function playOne(fen: string, move: string): PlayedMove | null {
  const chess = makeChess(fen);
  if (!chess) return null;
  const moveNumber = chess.moveNumber();
  try {
    const uci = /^[a-h][1-8][a-h][1-8][qrbn]?$/.exec(move);
    const m = uci
      ? chess.move({ from: move.slice(0, 2), to: move.slice(2, 4), promotion: move[4] })
      : chess.move(move);
    return toPlayed(m, moveNumber);
  } catch {
    return null;
  }
}

export function uciToSan(fen: string, uci: string): string | null {
  return playOne(fen, uci)?.san ?? null;
}

export function sanToUci(fen: string, san: string): string | null {
  return playOne(fen, san)?.uci ?? null;
}

/** Convierte una variante UCI a SAN (se corta en la primera jugada ilegal). */
export function pvToSan(fen: string, pv: string[], max = 12): string[] {
  const chess = makeChess(fen);
  if (!chess) return [];
  const out: string[] = [];
  for (const uci of pv.slice(0, max)) {
    try {
      const m = chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });
      out.push(m.san);
    } catch {
      break;
    }
  }
  return out;
}

export type GameEnd = 'checkmate' | 'stalemate' | 'threefold' | 'insufficient' | 'fifty' | null;

export function gameEnd(chess: Chess): GameEnd {
  if (chess.isCheckmate()) return 'checkmate';
  if (chess.isStalemate()) return 'stalemate';
  if (chess.isInsufficientMaterial()) return 'insufficient';
  if (chess.isThreefoldRepetition()) return 'threefold';
  if (chess.isDrawByFiftyMoves()) return 'fifty';
  return null;
}

/** "10...f5" o "9.Ne1" a partir del número de jugada, el bando y la SAN ya traducida. */
export function moveText(moveNumber: number, color: Side, san: string): string {
  return `${moveNumber}${color === 'w' ? '.' : '...'}${san}`;
}
