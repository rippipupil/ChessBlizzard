// Comprobación de eventos con un contenido simulado, para cubrir casos que el contenido real
// puede no tener en cada momento (puzzles, cursos sin examen, varios exámenes).

import type { Course, ProgressEvent } from '@chessblizzard/shared';
import { describe, expect, it, vi } from 'vitest';
import { AppError } from '../src/errors';
import { checkEvents } from '../src/progress';

const fake = vi.hoisted(() => {
  const stage = (id: string, type: string, extra: object = {}) => ({ id, type, lines: [], puzzles: [], ...extra });
  const course = (id: string, stages: object[]) => ({ id, lines: [{ id: `${id}-main` }], puzzles: [{ id: `${id}-p1` }], camps: [{ id: 'base', stages }] });
  return {
    'dos-examenes': course('dos-examenes', [stage('intro', 'ideas'), stage('final', 'exam', { passScore: 0.9 }), stage('repaso', 'exam', { passScore: 0.6 })]),
    'sin-examen': course('sin-examen', [stage('intro', 'ideas')]),
  } as unknown as Record<string, Course>;
});

vi.mock('@chessblizzard/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@chessblizzard/shared')>();
  const all = Object.values(fake);
  return {
    ...actual,
    getCourse: (id: string) => fake[id],
    findStage: (courseId: string, stageId: string) => {
      const course = fake[courseId];
      const stage = course?.camps.flatMap((c) => c.stages).find((s) => s.id === stageId);
      return course && stage ? { course, stage } : undefined;
    },
    findLine: (id: string) => all.flatMap((course) => course.lines.filter((l) => l.id === id).map((line) => ({ course, line })))[0],
    findPuzzle: (id: string) => all.flatMap((course) => course.puzzles.filter((p) => p.id === id).map((puzzle) => ({ course, puzzle })))[0],
  };
});

const TODAY = '2026-10-15';

/** Los detalles del error `validation` que lanza checkEvents (o [] si no lanza). */
function problems(events: ProgressEvent[]): { path: string; message: string }[] {
  try {
    checkEvents(events, TODAY);
    return [];
  } catch (err) {
    expect(err).toBeInstanceOf(AppError);
    expect(err).toMatchObject({ statusCode: 400, code: 'validation' });
    return (err as AppError).details ?? [];
  }
}

describe('checkEvents', () => {
  it('acepta los ids que existen y señala cada uno de los que no', () => {
    const events: ProgressEvent[] = [
      { type: 'puzzle_attempt', puzzle: 'sin-examen-p1', solved: true, day: TODAY },
      { type: 'puzzle_attempt', puzzle: 'otro', solved: true, day: TODAY },
      { type: 'stage_complete', course: 'sin-examen', stage: 'intro', day: TODAY },
      { type: 'stage_complete', course: 'sin-examen', stage: 'final', day: TODAY },
      { type: 'line_review', line: 'dos-examenes-main', grade: 'good', day: TODAY },
      { type: 'sparring_result', course: 'nada', result: 'win', day: TODAY },
    ];
    const valid = [events[0], events[2], events[4]];
    expect(checkEvents(valid, TODAY)).toEqual(valid);
    expect(problems(events)).toEqual([
      { path: 'events[1].puzzle', message: 'Unknown puzzle' },
      { path: 'events[3].stage', message: 'Unknown stage' },
      { path: 'events[5].course', message: 'Unknown course' },
    ]);
  });

  it('el aprobado del examen nunca baja de la nota más baja que pide el contenido', () => {
    const exam = (passScore: number): ProgressEvent => ({ type: 'exam_result', course: 'dos-examenes', score: 0.7, passScore, day: TODAY });
    const checked = checkEvents([exam(0), exam(0.6), exam(0.95)], TODAY);
    expect(checked.map((e) => (e.type === 'exam_result' ? e.passScore : null))).toEqual([0.6, 0.6, 0.95]);
  });

  it('rechaza un examen de un curso sin examen', () => {
    expect(problems([{ type: 'exam_result', course: 'sin-examen', score: 1, passScore: 0.5, day: TODAY }])).toEqual([
      { path: 'events[0].course', message: 'This course has no exam' },
    ]);
  });

  it('solo acepta fechas a ±2 días', () => {
    const at = (day: string): ProgressEvent => ({ type: 'line_review', line: 'sin-examen-main', grade: 'good', day });
    expect(checkEvents(['2026-10-13', '2026-10-15', '2026-10-17'].map(at), TODAY)).toHaveLength(3);
    const days = ['2026-10-12', '2026-10-13', '2026-10-17', '2026-10-18', '2025-10-15'];
    expect(problems(days.map(at)).map((p) => p.path)).toEqual(['events[0].day', 'events[3].day', 'events[4].day']);
  });
});
