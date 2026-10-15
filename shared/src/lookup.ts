import { courses } from './content';
import type { Course, LineDef, Puzzle, Stage } from './types';

export function findLine(lineId: string): { course: Course; line: LineDef } | undefined {
  for (const course of courses) {
    const line = course.lines.find((l) => l.id === lineId);
    if (line) return { course, line };
  }
  return undefined;
}

export function findPuzzle(puzzleId: string): { course: Course; puzzle: Puzzle } | undefined {
  for (const course of courses) {
    const puzzle = course.puzzles.find((p) => p.id === puzzleId);
    if (puzzle) return { course, puzzle };
  }
  return undefined;
}

export function findStage(courseId: string, stageId: string): { course: Course; stage: Stage } | undefined {
  const course = courses.find((c) => c.id === courseId);
  if (!course) return undefined;
  for (const camp of course.camps) {
    const stage = camp.stages.find((s) => s.id === stageId);
    if (stage) return { course, stage };
  }
  return undefined;
}
