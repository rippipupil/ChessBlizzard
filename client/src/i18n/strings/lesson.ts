import type { Dict } from '../index';

// Textos de tablero, lecciones, práctica, puzzles, sparring y análisis. Claves con prefijo "lesson.".
export const lessonStrings: Dict = {
  'lesson.exit': { es: 'Salir', en: 'Exit' },

  // --- Tablero ---
  'lesson.board.label': { es: 'Tablero de ajedrez', en: 'Chessboard' },
  'lesson.board.empty': { es: 'vacía', en: 'empty' },
  'lesson.board.selected': { es: 'seleccionada', en: 'selected' },
  'lesson.board.dest': { es: 'destino posible', en: 'possible move' },
  'lesson.board.check': { es: 'en jaque', en: 'in check' },
  'lesson.board.arrows': { es: 'Flechas', en: 'Arrows' },
  'lesson.board.promote': { es: 'Coronar', en: 'Promote to' },
  'lesson.board.piece.wp': { es: 'peón blanco', en: 'white pawn' },
  'lesson.board.piece.wn': { es: 'caballo blanco', en: 'white knight' },
  'lesson.board.piece.wb': { es: 'alfil blanco', en: 'white bishop' },
  'lesson.board.piece.wr': { es: 'torre blanca', en: 'white rook' },
  'lesson.board.piece.wq': { es: 'dama blanca', en: 'white queen' },
  'lesson.board.piece.wk': { es: 'rey blanco', en: 'white king' },
  'lesson.board.piece.bp': { es: 'peón negro', en: 'black pawn' },
  'lesson.board.piece.bn': { es: 'caballo negro', en: 'black knight' },
  'lesson.board.piece.bb': { es: 'alfil negro', en: 'black bishop' },
  'lesson.board.piece.br': { es: 'torre negra', en: 'black rook' },
  'lesson.board.piece.bq': { es: 'dama negra', en: 'black queen' },
  'lesson.board.piece.bk': { es: 'rey negro', en: 'black king' },
  'lesson.arrow.plan': { es: 'tu plan', en: 'your plan' },
  'lesson.arrow.rival': { es: 'plan rival', en: 'opponent’s plan' },
  'lesson.arrow.hint': { es: 'pista', en: 'hint' },
  'lesson.arrow.best': { es: 'jugada correcta', en: 'correct move' },

  // --- Motor ---
  'lesson.engine.evalBar': { es: 'Evaluación de Stockfish', en: 'Stockfish evaluation' },
};
