// Provisional: el equipo del núcleo de ajedrez sustituye estos componentes por los reales.
// Mantén estas firmas: las usa el equipo de la aplicación desde las rutas.
import { createElement } from 'react';
import type { Course, Puzzle, Stage } from '@chessblizzard/shared';

const Pending = (name: string) => createElement('p', { style: { padding: 32 } }, `${name}: en construcción`);

export function StagePlayer(_props: { course: Course; stage: Stage; onExit: () => void }) {
  return Pending('StagePlayer');
}

export function ReviewSession(_props: { onExit: () => void }) {
  return Pending('ReviewSession');
}

export function PuzzleSolver(_props: { puzzle: Puzzle; course: Course; onDone: (solved: boolean) => void }) {
  return Pending('PuzzleSolver');
}

export function AnalysisBoard() {
  return Pending('AnalysisBoard');
}
