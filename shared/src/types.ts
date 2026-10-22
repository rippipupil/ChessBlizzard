// Tipos del contenido de los cursos de aperturas.
//
// Todas las jugadas se guardan en notación algebraica inglesa (SAN), que es la
// que entiende chess.js. La interfaz las traduce a la notación elegida.

export type Locale = 'es' | 'en';
export type L10n = { es: string; en: string };
export type Color = 'w' | 'b';

/** Flechas en formato "e2e4". Para el salto de un caballo se puede dar el codo: "g1f3:g1g3f3". */
export type ArrowSpec = string;

/**
 * Longitud máxima (caracteres, en cada idioma) de los textos del contenido. Las lecciones
 * se leen en una tarjeta pequeña en el móvil: una idea por texto y lo demás en `more`.
 */
export const TEXT_LIMITS = {
  /** Título de una diapositiva. */
  slideTitle: 44,
  /** Texto de una diapositiva: una o dos frases. */
  slideText: 180,
  /** Comentario de una jugada. */
  noteText: 160,
  /** Ampliación (`more`) de una diapositiva o de un comentario. */
  more: 420,
  /** Resumen de una línea. */
  summary: 200,
  /** Enunciado de una pregunta. */
  question: 110,
  /** Explicación de la respuesta de una pregunta. */
  explanation: 200,
  /** Opción de una pregunta de elegir. */
  option: 60,
} as const;

export interface MoveNote {
  /**
   * Explicación de la jugada, corta (TEXT_LIMITS.noteText). Las jugadas entre corchetes
   * ([Nf3], [9...Nd7]) se formatean.
   */
  text?: L10n;
  /** Ampliación opcional: se muestra plegada ("¿Por qué?"). */
  more?: L10n;
  /** Flechas del plan del alumno, dibujadas sobre la posición después de la jugada. */
  arrows?: ArrowSpec[];
  /** Flechas del plan rival. */
  rival?: ArrowSpec[];
  /** Casillas destacadas. */
  marks?: string[];
  /**
   * Pregunta que se hace justo después de esta jugada, sobre la posición resultante (si la
   * pregunta no trae `fen` ni `moves`). Sirve para hacer pensar en vez de leer.
   */
  ask?: QuizItem;
}

export interface LineDef {
  id: string;
  name: L10n;
  /** Jugadas desde la posición inicial, con números: "1.d4 Nf6 2.c4 g6". */
  moves: string;
  /** Comentarios por jugada. Clave: número + puntos + SAN, p. ej. "6...e5" o "9.Ne1". */
  notes?: Record<string, MoveNote>;
  /** Resumen que se muestra al terminar la línea. */
  summary?: L10n;
  /**
   * Si es false, la línea solo se estudia (por ejemplo, un error del propio alumno
   * que hay que evitar) y no entra en la práctica ni en la repetición espaciada.
   */
  practice?: boolean;
}

export type StageType = 'ideas' | 'line' | 'practice' | 'branch' | 'trap' | 'puzzles' | 'sparring' | 'exam';

export interface Slide {
  title: L10n;
  /** Una o dos frases (TEXT_LIMITS.slideText). */
  text: L10n;
  /** Ampliación opcional, plegada. */
  more?: L10n;
  /** Posición: o un FEN o las jugadas desde el inicio. */
  fen?: string;
  moves?: string;
  arrows?: ArrowSpec[];
  rival?: ArrowSpec[];
  marks?: string[];
  /**
   * Pregunta de la diapositiva: el alumno la responde sobre el tablero (o eligiendo) antes
   * de pasar a la siguiente. Usa la posición de la diapositiva si no trae la suya.
   */
  ask?: QuizItem;
}

/** Pregunta de "encuentra la jugada" sobre el tablero. */
export interface QuizMove {
  kind: 'move';
  question: L10n;
  fen?: string;
  moves?: string;
  /** Jugadas aceptadas (SAN). */
  answers: string[];
  explanation: L10n;
}

/** Pregunta de opción múltiple. */
export interface QuizChoice {
  kind: 'choice';
  question: L10n;
  fen?: string;
  moves?: string;
  options: L10n[];
  correct: number;
  explanation: L10n;
}

/** "Toca la casilla…" (o la pieza que está en ella): se responde tocando el tablero. */
export interface QuizSquare {
  kind: 'square';
  question: L10n;
  fen?: string;
  moves?: string;
  /** Casillas aceptadas ("d5"). */
  answers: string[];
  explanation: L10n;
}

/** Afirmación de verdadero o falso. */
export interface QuizTrueFalse {
  kind: 'truefalse';
  question: L10n;
  fen?: string;
  moves?: string;
  correct: boolean;
  explanation: L10n;
}

export type QuizItem = QuizMove | QuizChoice | QuizSquare | QuizTrueFalse;

interface StageBase {
  id: string;
  type: StageType;
  title: L10n;
  subtitle: L10n;
  /** Texto de la tarjeta "Siguiente etapa". */
  intro: L10n;
}

export interface IdeasStage extends StageBase {
  type: 'ideas';
  slides: Slide[];
  quiz: QuizItem[];
}

export interface LinesStage extends StageBase {
  /** line/branch/trap: primero se estudia y luego se practica. practice: solo práctica. */
  type: 'line' | 'practice' | 'branch' | 'trap';
  lines: string[];
}

export interface PuzzlesStage extends StageBase {
  type: 'puzzles';
  puzzles: string[];
  /** Proporción de puzzles resueltos necesaria para completar la etapa. */
  passRatio: number;
}

export interface SparringStage extends StageBase {
  type: 'sparring';
  /** Líneas de las que sale la partida: el rival juega del libro mientras pueda. */
  lines: string[];
}

export interface ExamStage extends StageBase {
  type: 'exam';
  lines: string[];
  puzzles: string[];
  /** Nota mínima (0-1) para aprobar. */
  passScore: number;
}

export type Stage = IdeasStage | LinesStage | PuzzlesStage | SparringStage | ExamStage;

export interface Camp {
  id: string;
  name: L10n;
  title: L10n;
  stages: Stage[];
}

export interface Reference {
  kind: 'book' | 'game' | 'player';
  title: string;
  author?: string;
  year?: number;
  note: L10n;
}

export interface Puzzle {
  id: string;
  /** Posición de partida: o FEN o jugadas desde el inicio. */
  fen?: string;
  moves?: string;
  /** Solución en SAN empezando por el bando que mueve: alumno, respuesta, alumno... */
  solution: string;
  theme: L10n;
  hint: L10n;
  explanation: L10n;
  /** Dificultad aproximada (Elo). */
  rating: number;
}

export interface Course {
  id: string;
  name: L10n;
  side: Color;
  eco: string;
  /** "contra 1.d4", "1.c4"... */
  vs: L10n;
  tagline: L10n;
  history: L10n;
  camps: Camp[];
  lines: LineDef[];
  puzzles: Puzzle[];
  references: Reference[];
}
