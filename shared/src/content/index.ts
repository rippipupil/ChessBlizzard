import type { Course, Puzzle } from '../types';
import { dragon } from './dragon';
import { english } from './english';
import { kingsIndian } from './kings-indian';
import { dragonPuzzles } from './puzzles/dragon';
import { englishPuzzles } from './puzzles/english';
import { kingsIndianPuzzles } from './puzzles/kings-indian';

/**
 * Une un curso con sus puzzles. Las etapas de puzzles y el examen que no
 * enumeran puzzles usan todos los del curso.
 */
function assemble(course: Course, puzzles: Puzzle[]): Course {
  const all = [...course.puzzles, ...puzzles];
  const ids = all.map((p) => p.id);
  return {
    ...course,
    puzzles: all,
    camps: course.camps.map((camp) => ({
      ...camp,
      stages: camp.stages.map((stage) =>
        (stage.type === 'puzzles' || stage.type === 'exam') && stage.puzzles.length === 0 ? { ...stage, puzzles: ids } : stage,
      ),
    })),
  };
}

export const courses: Course[] = [
  assemble(english, englishPuzzles),
  assemble(kingsIndian, kingsIndianPuzzles),
  assemble(dragon, dragonPuzzles),
];

export function getCourse(id: string): Course | undefined {
  return courses.find((c) => c.id === id);
}
