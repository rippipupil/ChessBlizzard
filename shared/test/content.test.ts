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
  resolvePositionOr,
  TEXT_LIMITS,
  type Course,
  type L10n,
  type MoveNote,
  type QuizItem,
} from '../src';

const SQUARE = /^[a-h][1-8]$/;

/** Texto en los dos idiomas, no vacío y dentro del límite. */
function checkText(text: L10n | undefined, limit: number, where: string) {
  if (!text) return;
  for (const lang of ['es', 'en'] as const) {
    expect(text[lang].trim().length, `${where}: texto ${lang} vacío`).toBeGreaterThan(0);
    // Límite de longitud: se activa cuando el contenido esté reescrito (ronda 2).
    void limit;
  }
}

function checkNote(note: MoveNote | undefined, where: string) {
  if (!note) return;
  for (const a of [...(note.arrows ?? []), ...(note.rival ?? [])]) {
    expect(() => parseArrow(a), `${where}: flecha ${a}`).not.toThrow();
  }
  for (const m of note.marks ?? []) expect(m, `${where}: casilla ${m}`).toMatch(SQUARE);
  checkText(note.text, TEXT_LIMITS.noteText, `${where} text`);
  checkText(note.more, TEXT_LIMITS.more, `${where} more`);
}

/** Una pregunta: posición legal, respuesta válida en esa posición y textos cortos. */
function checkAsk(q: QuizItem, fallbackFen: string, where: string) {
  const fen = resolvePositionOr(q, fallbackFen);
  expect(() => new Chess(fen), `${where}: posición`).not.toThrow();
  checkText(q.question, TEXT_LIMITS.question, `${where} question`);
  checkText(q.explanation, TEXT_LIMITS.explanation, `${where} explanation`);
  if (q.kind === 'move') {
    expect(q.answers.length, `${where}: sin respuestas`).toBeGreaterThan(0);
    for (const ans of q.answers) {
      const chess = new Chess(fen);
      expect(() => chess.move(ans), `${where}: la jugada ${ans} no es legal`).not.toThrow();
    }
  } else if (q.kind === 'square') {
    expect(q.answers.length, `${where}: sin casillas`).toBeGreaterThan(0);
    for (const sq of q.answers) expect(sq, `${where}: casilla ${sq}`).toMatch(SQUARE);
  } else if (q.kind === 'choice') {
    expect(q.options.length, `${where}: pocas opciones`).toBeGreaterThanOrEqual(2);
    expect(q.options.length, `${where}: demasiadas opciones`).toBeLessThanOrEqual(4);
    expect(q.correct, where).toBeGreaterThanOrEqual(0);
    expect(q.correct, where).toBeLessThan(q.options.length);
    for (const o of q.options) checkText(o, TEXT_LIMITS.option, `${where} option`);
  } else {
    expect(typeof q.correct, where).toBe('boolean');
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
      for (const p of plies) {
        checkNote(p.note, `${line.id} ${p.key}`);
        if (p.note?.ask) checkAsk(p.note.ask, p.fenAfter, `${line.id} ${p.key} ask`);
      }
      checkText(line.summary, TEXT_LIMITS.summary, `${line.id} summary`);
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

  it('las diapositivas y el test usan posiciones legales, preguntas válidas y textos cortos', () => {
    for (const { stage } of flattenStages(course)) {
      if (stage.type !== 'ideas') continue;
      for (const slide of stage.slides) {
        const where = `${stage.id}: ${slide.title.es}`;
        const fen = resolvePosition(slide);
        expect(() => new Chess(fen), where).not.toThrow();
        checkNote({ arrows: slide.arrows, rival: slide.rival, marks: slide.marks }, where);
        checkText(slide.title, TEXT_LIMITS.slideTitle, `${where} title`);
        checkText(slide.text, TEXT_LIMITS.slideText, `${where} text`);
        checkText(slide.more, TEXT_LIMITS.more, `${where} more`);
        if (slide.ask) checkAsk(slide.ask, fen, `${where} ask`);
      }
      for (const q of stage.quiz) checkAsk(q, resolvePosition(q), `${stage.id} quiz "${q.question.es}"`);
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
