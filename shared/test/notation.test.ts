import { describe, expect, it } from 'vitest';
import { localizeMoveText, localizeSan, parseRichText, plainText } from '../src';

describe('localizeSan', () => {
  it.each([
    ['Nbd7', 'Cbd7'],
    ['O-O', '0-0'],
    ['O-O-O', '0-0-0'],
    ['O-O+', '0-0+'],
    ['O-O-O#', '0-0-0#'],
    ['e8=Q', 'e8=D'],
    ['exd8=N+', 'exd8=C+'],
    ['b1=R', 'b1=T'],
    ['Bxe5+', 'Axe5+'],
    ['Qxd8#', 'Dxd8#'],
    ['Kxe2', 'Rxe2'],
    ['Rxe2', 'Txe2'],
    ['R1e2', 'T1e2'],
    ['Nge2', 'Cge2'],
    ['Bb5', 'Ab5'],
    ['e4', 'e4'],
    ['exd5', 'exd5'],
    ['Nxe5?', 'Cxe5?'],
    ['Nxe4!', 'Cxe4!'],
  ])('%s -> %s', (en, es) => {
    expect(localizeSan(en, 'es')).toBe(es);
  });

  it('en inglés no cambia nada', () => {
    for (const san of ['Nbd7', 'O-O', 'e8=Q', 'Bxe5+', 'Kxe2']) expect(localizeSan(san, 'en')).toBe(san);
  });

  it('no confunde la columna b con el alfil', () => {
    expect(localizeSan('bxc6', 'es')).toBe('bxc6');
    expect(localizeSan('Bxb7', 'es')).toBe('Axb7');
  });
});

describe('localizeMoveText', () => {
  it('traduce una secuencia con números de jugada', () => {
    expect(localizeMoveText('1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 g6', 'es')).toBe('1.e4 c5 2.Cf3 d6 3.d4 cxd4 4.Cxd4 Cf6 5.Cc3 g6');
  });

  it('respeta los números de las jugadas negras', () => {
    expect(localizeMoveText('9...Nd7', 'es')).toBe('9...Cd7');
    expect(localizeMoveText('5...O-O 6.Be2 e5', 'es')).toBe('5...0-0 6.Ae2 e5');
    expect(localizeMoveText('10.O-O-O f5', 'es')).toBe('10.0-0-0 f5');
  });

  it('jugadas sueltas sin número, con jaques y anotaciones', () => {
    expect(localizeMoveText('dxe5 dxe5 Qxd8+', 'es')).toBe('dxe5 dxe5 Dxd8+');
    expect(localizeMoveText('9.Nxe5?', 'es')).toBe('9.Cxe5?');
    expect(localizeMoveText('Bxe5+', 'es')).toBe('Axe5+');
  });

  it('conserva los espacios tal cual', () => {
    expect(localizeMoveText('1.Nf3  Nf6\n2.c4', 'es')).toBe('1.Cf3  Cf6\n2.c4');
    expect(localizeMoveText(' Nf3 ', 'es')).toBe(' Cf3 ');
  });

  it('deja intactos los números sueltos y lo que no es una jugada', () => {
    expect(localizeMoveText('1. e4', 'es')).toBe('1. e4');
    expect(localizeMoveText('1-0', 'es')).toBe('1-0');
    expect(localizeMoveText('...', 'es')).toBe('...');
  });

  it('en inglés devuelve el texto sin tocar', () => {
    expect(localizeMoveText('5...O-O 6.Be2 Nbd7', 'en')).toBe('5...O-O 6.Be2 Nbd7');
  });
});

describe('parseRichText', () => {
  it('separa el texto de las jugadas entre corchetes y las traduce', () => {
    expect(parseRichText('Por eso [9...Nd7] deja libre el peón de f.', 'es')).toEqual([
      { kind: 'text', value: 'Por eso ' },
      { kind: 'move', value: '9...Cd7' },
      { kind: 'text', value: ' deja libre el peón de f.' },
    ]);
  });

  it('varias jugadas, al principio y al final', () => {
    expect(parseRichText('[dxe5 dxe5 Qxd8+] y luego [Kxd8]', 'es')).toEqual([
      { kind: 'move', value: 'dxe5 dxe5 Dxd8+' },
      { kind: 'text', value: ' y luego ' },
      { kind: 'move', value: 'Rxd8' },
    ]);
    expect(parseRichText('[e4][e5]', 'es')).toEqual([
      { kind: 'move', value: 'e4' },
      { kind: 'move', value: 'e5' },
    ]);
  });

  it('en inglés las jugadas se quedan en SAN', () => {
    expect(parseRichText('If [9.Nxe5?], [9...Nxe4!] wins it back.', 'en')).toEqual([
      { kind: 'text', value: 'If ' },
      { kind: 'move', value: '9.Nxe5?' },
      { kind: 'text', value: ', ' },
      { kind: 'move', value: '9...Nxe4!' },
      { kind: 'text', value: ' wins it back.' },
    ]);
  });

  it('un texto sin corchetes es un único trozo, y el vacío no tiene ninguno', () => {
    expect(parseRichText('Sin jugadas.', 'es')).toEqual([{ kind: 'text', value: 'Sin jugadas.' }]);
    expect(parseRichText('', 'es')).toEqual([]);
  });

  it('un corchete sin cerrar o vacío se queda como texto', () => {
    expect(parseRichText('Ojo con [Nf3', 'es')).toEqual([{ kind: 'text', value: 'Ojo con [Nf3' }]);
    expect(parseRichText('Nada [] aquí', 'es')).toEqual([{ kind: 'text', value: 'Nada [] aquí' }]);
  });

  it('se puede llamar varias veces seguidas (la expresión regular no guarda estado)', () => {
    const a = parseRichText('[Nf3] y [Nc3]', 'es');
    const b = parseRichText('[Nf3] y [Nc3]', 'es');
    expect(a).toEqual(b);
    expect(a).toHaveLength(3);
  });
});

describe('plainText', () => {
  it('quita los corchetes y traduce las jugadas', () => {
    expect(plainText('Si [9.Nxe5?], [9...Nxe4!] recupera el peón.', 'es')).toBe('Si 9.Cxe5?, 9...Cxe4! recupera el peón.');
    expect(plainText('Castle with [O-O].', 'en')).toBe('Castle with O-O.');
  });
});
