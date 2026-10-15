import { describe, expect, it } from 'vitest';
import {
  START_FEN,
  buildRepertoire,
  noteKey,
  parseArrow,
  playLine,
  playMoves,
  positionKey,
  resolvePosition,
  splitMoves,
  type Color,
  type Course,
  type LineDef,
} from '../src';

const L = { es: 'x', en: 'x' };
const fenAfter = (moves: string) => playMoves(moves).at(-1)!.fenAfter;

function makeCourse(side: Color, lines: Array<Omit<LineDef, 'name'>>): Course {
  return {
    id: 'test',
    name: L,
    side,
    eco: '',
    vs: L,
    tagline: L,
    history: L,
    references: [],
    puzzles: [],
    camps: [],
    lines: lines.map((l) => ({ name: L, ...l })),
  };
}

describe('splitMoves', () => {
  it('quita los números de jugada', () => {
    expect(splitMoves('1.d4 Nf6 2.c4 g6')).toEqual(['d4', 'Nf6', 'c4', 'g6']);
  });

  it('entiende los números de las negras y los números separados por un espacio', () => {
    expect(splitMoves('5...O-O 6.Be2 e5')).toEqual(['O-O', 'Be2', 'e5']);
    expect(splitMoves('12...Kh8')).toEqual(['Kh8']);
    expect(splitMoves('1. d4 Nf6 2. c4')).toEqual(['d4', 'Nf6', 'c4']);
  });

  it('ignora comentarios, resultados y espacios de más', () => {
    expect(splitMoves('  1.e4 {la mejor según Fischer} e5\n 2.Nf3   Nc6 1-0 ')).toEqual(['e4', 'e5', 'Nf3', 'Nc6']);
    for (const result of ['0-1', '1/2-1/2', '*']) expect(splitMoves(`1.e4 e5 ${result}`)).toEqual(['e4', 'e5']);
  });

  it('una cadena vacía no tiene jugadas', () => {
    expect(splitMoves('')).toEqual([]);
    expect(splitMoves('   ')).toEqual([]);
  });
});

describe('playMoves', () => {
  it('devuelve cada media jugada con su clave, sus casillas y las posiciones encadenadas', () => {
    const plies = playMoves('1.d4 Nf6 2.c4 g6');
    expect(plies.map((p) => p.key)).toEqual(['1.d4', '1...Nf6', '2.c4', '2...g6']);
    expect(plies[0]).toMatchObject({ index: 0, san: 'd4', from: 'd2', to: 'd4', color: 'w', moveNumber: 1, fenBefore: START_FEN });
    expect(plies[1]).toMatchObject({ index: 1, san: 'Nf6', from: 'g8', to: 'f6', color: 'b', moveNumber: 1 });
    expect(plies[3]).toMatchObject({ index: 3, color: 'b', moveNumber: 2 });
    for (let i = 1; i < plies.length; i++) expect(plies[i].fenBefore).toBe(plies[i - 1].fenAfter);
  });

  it('acepta una lista de SAN y guarda la notación normalizada de chess.js', () => {
    const plies = playMoves(['e4', 'e5', 'Ngf3', 'Nc6', 'Bc4', 'Bc5', 'O-O']);
    expect(plies[2].san).toBe('Nf3');
    expect(plies[2].key).toBe('2.Nf3');
    expect(plies[6]).toMatchObject({ san: 'O-O', from: 'e1', to: 'g1', key: '4.O-O' });
  });

  it('guarda la pieza de promoción', () => {
    const [ply] = playMoves('e8=Q', '8/4P3/8/8/8/8/k7/4K3 w - - 0 50');
    expect(ply).toMatchObject({ san: 'e8=Q', promotion: 'q', key: '50.e8=Q' });
  });

  it('lanza un error claro con la jugada ilegal y su posición', () => {
    expect(() => playMoves('1.e4 e5 2.Ke3')).toThrow(/Jugada ilegal "Ke3" \(media jugada 3\)/);
    expect(() => playMoves('1.e4 e4')).toThrow(/Jugada ilegal "e4" \(media jugada 2\)/);
    expect(() => playMoves(['e4', 'xyz'])).toThrow(/xyz/);
    expect(() => playMoves('1.e4 e5 2.O-O')).toThrow(/O-O/);
  });

  it('desde un FEN, con los números de jugada de esa posición', () => {
    const fen = fenAfter('1.e4 e5 2.Nf3 Nc6');
    expect(playMoves('3.Bb5 a6 4.Ba4', fen).map((p) => p.key)).toEqual(['3.Bb5', '3...a6', '4.Ba4']);
    const black = fenAfter('1.e4 e5 2.Nf3');
    expect(playMoves('Nc6 3.Bb5', black).map((p) => p.key)).toEqual(['2...Nc6', '3.Bb5']);
  });

  it('asocia cada comentario a su jugada por la clave', () => {
    const notes = { '1...Nf6': { text: { es: 'Desarrollo', en: 'Development' } }, '2.c4': { arrows: ['c4d5'] } };
    const plies = playMoves('1.d4 Nf6 2.c4', START_FEN, notes);
    expect(plies.map((p) => p.note)).toEqual([undefined, notes['1...Nf6'], notes['2.c4']]);
  });

  it('playLine usa las jugadas y los comentarios de la línea', () => {
    const line: LineDef = { id: 'l', name: L, moves: '1.d4 Nf6 2.c4 g6', notes: { '2...g6': { marks: ['g7'] } } };
    const plies = playLine(line);
    expect(plies).toHaveLength(4);
    expect(plies[3].note).toEqual({ marks: ['g7'] });
  });

  it('noteKey: número, puntos y SAN', () => {
    expect(noteKey(6, 'b', 'e5')).toBe('6...e5');
    expect(noteKey(9, 'w', 'Ne1')).toBe('9.Ne1');
  });
});

describe('positionKey y resolvePosition', () => {
  it('positionKey quita los contadores de jugadas', () => {
    expect(positionKey(START_FEN)).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -');
  });

  it('dos órdenes de jugadas que llevan a la misma posición tienen la misma clave', () => {
    const a = fenAfter('1.d4 Nf6 2.c4 g6 3.Nc3');
    const b = fenAfter('1.c4 g6 2.Nc3 Nf6 3.d4');
    expect(a).not.toBe(b); // el contador de medias jugadas es distinto
    expect(positionKey(a)).toBe(positionKey(b));
    // 1.d4 Nf6 2.c4 y 1.c4 Nf6 2.d4: chess.js solo apunta la casilla de al paso si se puede capturar.
    expect(positionKey(fenAfter('1.d4 Nf6 2.c4'))).toBe(positionKey(fenAfter('1.c4 Nf6 2.d4')));
    expect(positionKey(fenAfter('1.Nf3 Nf6 2.Ng1 Ng8'))).toBe(positionKey(START_FEN));
  });

  it('distingue el turno, los enroques y la captura al paso', () => {
    expect(positionKey(fenAfter('1.Nf3 Nf6 2.Rg1 Rg8 3.Rh1 Rh8'))).not.toBe(positionKey(fenAfter('1.Nf3 Nf6')));
    expect(positionKey(fenAfter('1.Nf3 Nf6 2.Ng1'))).not.toBe(positionKey(fenAfter('1.Nf3 Nf6 2.Ng1 Ng8')));
    expect(positionKey(fenAfter('1.e4 a6 2.e5 d5'))).toContain(' d6');
  });

  it('resolvePosition: FEN, jugadas o la posición inicial', () => {
    const fen = fenAfter('1.e4 c5');
    expect(resolvePosition({})).toBe(START_FEN);
    expect(resolvePosition({ moves: '' })).toBe(START_FEN);
    expect(resolvePosition({ moves: '1.e4 c5' })).toBe(fen);
    expect(resolvePosition({ fen })).toBe(fen);
    expect(() => resolvePosition({ moves: '1.e4 e4' })).toThrow();
  });
});

describe('parseArrow', () => {
  it('flechas rectas: sin codo', () => {
    expect(parseArrow('e2e4')).toEqual({ from: 'e2', to: 'e4', via: [] });
    expect(parseArrow('a1h8')).toEqual({ from: 'a1', to: 'h8', via: [] });
    expect(parseArrow('f7f5')).toEqual({ from: 'f7', to: 'f5', via: [] });
    expect(parseArrow('g7d4')).toEqual({ from: 'g7', to: 'd4', via: [] });
  });

  it('saltos de caballo: codo automático, primero el tramo largo', () => {
    expect(parseArrow('g1f3')).toEqual({ from: 'g1', to: 'f3', via: ['g3'] });
    expect(parseArrow('e1d3')).toEqual({ from: 'e1', to: 'd3', via: ['e3'] });
    expect(parseArrow('g1e2')).toEqual({ from: 'g1', to: 'e2', via: ['e1'] });
    expect(parseArrow('b8d7')).toEqual({ from: 'b8', to: 'd7', via: ['d8'] });
    expect(parseArrow('e7g6')).toEqual({ from: 'e7', to: 'g6', via: ['g7'] });
    expect(parseArrow('h5f4')).toEqual({ from: 'h5', to: 'f4', via: ['f5'] });
    expect(parseArrow('a6c5')).toEqual({ from: 'a6', to: 'c5', via: ['c6'] });
    expect(parseArrow('d5c7')).toEqual({ from: 'd5', to: 'c7', via: ['d7'] });
  });

  it('codo explícito con el recorrido completo', () => {
    expect(parseArrow('g1f3:g1g3f3')).toEqual({ from: 'g1', to: 'f3', via: ['g3'] });
    expect(parseArrow('g1f3:g1f1f3')).toEqual({ from: 'g1', to: 'f3', via: ['f1'] });
    expect(parseArrow('a1c3:a1a3c3')).toEqual({ from: 'a1', to: 'c3', via: ['a3'] });
  });

  it('rechaza flechas mal escritas', () => {
    for (const bad of ['', 'e2', 'e2e9', 'i1e2', 'E2E4', 'e2-e4', 'e2e4e5', ':g1g3f3']) {
      expect(() => parseArrow(bad), bad).toThrow(/Flecha inválida/);
    }
  });
});

describe('buildRepertoire', () => {
  const kid = [
    { id: 'a', moves: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7' },
    { id: 'b', moves: '1.c4 Nf6 2.d4 g6 3.Nf3 Bg7' },
    { id: 'c', moves: '1.d4 Nf6 2.Nf3 g6' },
    { id: 'warn', moves: '1.d4 Nf6 2.c4 e5', practice: false },
  ];
  const afterC4 = positionKey(fenAfter('1.d4 Nf6 2.c4'));

  it('una posición a la que se llega por dos órdenes de jugadas es un solo nodo', () => {
    const rep = buildRepertoire(makeCourse('b', kid));
    expect(rep.side).toBe('b');
    expect(rep.conflicts).toEqual([]);
    expect(rep.nodes.get(afterC4)).toEqual({ user: 'g6', opponent: [], lines: ['a', 'b'] });
    expect(rep.nodes.get(positionKey(fenAfter('1.d4 Nf6 2.c4 g6')))).toEqual({ opponent: ['Nc3', 'Nf3'], lines: ['a', 'b'] });
    const start = rep.nodes.get(positionKey(START_FEN))!;
    expect(start.user).toBeUndefined();
    expect(start.opponent).toEqual(['d4', 'c4']);
    expect(start.lines).toEqual(['a', 'b', 'c']);
    expect(rep.nodes.get(positionKey(fenAfter('1.d4')))!.user).toBe('Nf6');
  });

  it('las líneas de "error a evitar" (practice: false) no cuentan', () => {
    const rep = buildRepertoire(makeCourse('b', kid));
    for (const node of rep.nodes.values()) expect(node.lines).not.toContain('warn');
    expect(rep.nodes.has(positionKey(fenAfter('1.d4 Nf6 2.c4 e5')))).toBe(false);
  });

  it('detecta los conflictos, también a través de una transposición', () => {
    const rep = buildRepertoire(makeCourse('b', [...kid, { id: 'd', moves: '1.c4 Nf6 2.d4 e6' }]));
    expect(rep.conflicts).toHaveLength(1);
    expect(rep.conflicts[0]).toMatch(/^d: /);
    expect(rep.conflicts[0]).toContain('el curso dice g6 y esta línea e6');
    expect(rep.nodes.get(afterC4)!.user).toBe('g6');
    expect(rep.nodes.get(afterC4)!.lines).toEqual(['a', 'b', 'd']);
  });

  it('con blancas, las jugadas del alumno son las blancas', () => {
    const rep = buildRepertoire(
      makeCourse('w', [
        { id: 'e1', moves: '1.c4 e5 2.Nc3 Nf6 3.g3' },
        { id: 'e2', moves: '1.c4 c5 2.Nc3 Nc6 3.g3' },
        { id: 'e3', moves: '1.c4 e5 2.g3' },
      ]),
    );
    expect(rep.nodes.get(positionKey(START_FEN))).toEqual({ user: 'c4', opponent: [], lines: ['e1', 'e2', 'e3'] });
    expect(rep.nodes.get(positionKey(fenAfter('1.c4')))!.opponent).toEqual(['e5', 'c5']);
    expect(rep.conflicts).toEqual([expect.stringContaining('e3: ')]);
    expect(rep.conflicts[0]).toContain('el curso dice Nc3 y esta línea g3');
  });
});
