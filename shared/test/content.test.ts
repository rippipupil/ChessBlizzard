import { describe, expect, it } from 'vitest';
import { Chess } from 'chess.js';
import {
  buildRepertoire,
  courses,
  flattenStages,
  parseArrow,
  playLine,
  playMoves,
  resolvePosition,
  type Course,
  type MoveNote,
} from '../src';

const SQUARE = /^[a-h][1-8]$/;

function checkNote(note: MoveNote | undefined, where: string) {
  if (!note) return;
  for (const a of [...(note.arrows ?? []), ...(note.rival ?? [])]) {
    expect(() => parseArrow(a), `${where}: flecha ${a}`).not.toThrow();
  }
  for (const m of note.marks ?? []) expect(m, `${where}: casilla ${m}`).toMatch(SQUARE);
  if (note.text) {
    expect(note.text.es.length, `${where}: texto es`).toBeGreaterThan(0);
    expect(note.text.en.length, `${where}: texto en`).toBeGreaterThan(0);
  }
}

describe.each(courses.map((c) => [c.id, c] as [string, Course]))('curso %s', (_id, course) => {
  it('tiene ids de líneas únicos', () => {
    const ids = course.lines.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('todas las líneas son legales y sus comentarios apuntan a jugadas existentes', () => {
    for (const line of course.lines) {
      const plies = playLine(line);
      const keys = new Set(plies.map((p) => p.key));
      for (const key of Object.keys(line.notes ?? {})) {
        expect(keys.has(key), `${line.id}: el comentario "${key}" no corresponde a ninguna jugada`).toBe(true);
      }
      for (const p of plies) checkNote(p.note, `${line.id} ${p.key}`);
      expect(plies.some((p) => p.color === course.side), `${line.id}: el alumno no juega nada`).toBe(true);
    }
  });

  it('el repertorio es coherente: una sola jugada del alumno por posición', () => {
    const rep = buildRepertoire(course);
    expect(rep.conflicts).toEqual([]);
  });

  it('las etapas referencian líneas y puzzles existentes', () => {
    const lineIds = new Set(course.lines.map((l) => l.id));
    const puzzleIds = new Set(course.puzzles.map((p) => p.id));
    const stageIds = flattenStages(course).map((f) => f.stage.id);
    expect(new Set(stageIds).size).toBe(stageIds.length);
    for (const { stage } of flattenStages(course)) {
      if ('lines' in stage) for (const id of stage.lines) expect(lineIds.has(id), `${stage.id}: línea ${id}`).toBe(true);
      if ('puzzles' in stage) for (const id of stage.puzzles) expect(puzzleIds.has(id), `${stage.id}: puzzle ${id}`).toBe(true);
      if (stage.type === 'practice' || stage.type === 'sparring' || stage.type === 'exam') {
        for (const id of stage.lines) {
          const line = course.lines.find((l) => l.id === id)!;
          expect(line.practice, `${stage.id}: ${id} no se puede practicar`).not.toBe(false);
        }
      }
    }
  });

  it('las diapositivas y el test usan posiciones legales', () => {
    for (const { stage } of flattenStages(course)) {
      if (stage.type !== 'ideas') continue;
      for (const slide of stage.slides) {
        const fen = resolvePosition(slide);
        expect(() => new Chess(fen)).not.toThrow();
        checkNote({ arrows: slide.arrows, rival: slide.rival, marks: slide.marks }, `${stage.id}: ${slide.title.es}`);
      }
      for (const q of stage.quiz) {
        const fen = resolvePosition(q);
        if (q.kind === 'move') {
          for (const ans of q.answers) {
            const chess = new Chess(fen);
            expect(() => chess.move(ans), `quiz "${q.question.es}": ${ans}`).not.toThrow();
          }
        } else {
          expect(q.correct).toBeGreaterThanOrEqual(0);
          expect(q.correct).toBeLessThan(q.options.length);
        }
      }
    }
  });

  it('los puzzles tienen soluciones legales', () => {
    for (const p of course.puzzles) {
      const fen = resolvePosition(p);
      expect(() => playMoves(p.solution, fen), p.id).not.toThrow();
      expect(playMoves(p.solution, fen).length % 2, `${p.id}: la solución debe terminar con una jugada del alumno`).toBe(1);
    }
  });
});

describe('global', () => {
  it('los ids de líneas y puzzles no se repiten entre cursos', () => {
    const lines = courses.flatMap((c) => c.lines.map((l) => l.id));
    const puzzles = courses.flatMap((c) => c.puzzles.map((p) => p.id));
    expect(new Set(lines).size).toBe(lines.length);
    expect(new Set(puzzles).size).toBe(puzzles.length);
  });
});
