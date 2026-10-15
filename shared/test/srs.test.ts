import { describe, expect, it } from 'vitest';
import { addDays, daysBetween, isDay, isDue, localDay, review, type SrsCard } from '../src';

const TODAY = '2026-10-15';

/** Repasa varias veces seguidas, cada vez el día en que toca. */
function reviewChain(grades: Parameters<typeof review>[1][], start = TODAY): SrsCard {
  let card: SrsCard | undefined;
  let day = start;
  for (const g of grades) {
    card = review(card, g, day);
    day = card.due;
  }
  return card!;
}

describe('fechas', () => {
  it('addDays cruza meses, años y el 29 de febrero', () => {
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
    expect(addDays('2023-02-28', 1)).toBe('2023-03-01');
    expect(addDays('2025-12-31', 1)).toBe('2026-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(addDays(TODAY, 0)).toBe(TODAY);
    expect(addDays(TODAY, 180)).toBe('2027-04-13');
  });

  it('addDays no se ve afectado por los cambios de hora (trabaja en UTC)', () => {
    expect(addDays('2026-03-28', 1)).toBe('2026-03-29');
    expect(addDays('2026-03-29', 1)).toBe('2026-03-30');
    expect(addDays('2026-10-24', 2)).toBe('2026-10-26');
  });

  it('daysBetween cuenta días enteros en los dos sentidos', () => {
    expect(daysBetween(TODAY, TODAY)).toBe(0);
    expect(daysBetween(TODAY, '2026-10-18')).toBe(3);
    expect(daysBetween('2026-10-18', TODAY)).toBe(-3);
    expect(daysBetween('2024-02-28', '2024-03-01')).toBe(2);
    expect(daysBetween('2025-12-31', '2026-01-01')).toBe(1);
    expect(daysBetween('2026-03-28', '2026-03-30')).toBe(2);
  });

  it('isDay acepta fechas AAAA-MM-DD que existen', () => {
    expect(isDay(TODAY)).toBe(true);
    expect(isDay('2024-02-29')).toBe(true);
    expect(isDay('2000-02-29')).toBe(true);
    expect(isDay('2026-12-31')).toBe(true);
  });

  it('isDay rechaza días que no existen y otros formatos', () => {
    expect(isDay('2023-02-29')).toBe(false);
    expect(isDay('1900-02-29')).toBe(false);
    expect(isDay('2026-02-30')).toBe(false);
    expect(isDay('2026-04-31')).toBe(false);
    expect(isDay('2026-13-01')).toBe(false);
    expect(isDay('2026-00-10')).toBe(false);
    expect(isDay('2026-10-00')).toBe(false);
    expect(isDay('2026-1-5')).toBe(false);
    expect(isDay('15/10/2026')).toBe(false);
    expect(isDay('2026-10-15T00:00:00Z')).toBe(false);
    expect(isDay(' 2026-10-15')).toBe(false);
    expect(isDay('')).toBe(false);
  });

  it('localDay usa la fecha local del dispositivo', () => {
    expect(localDay(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
    expect(localDay(new Date(2026, 11, 31, 0, 0))).toBe('2026-12-31');
    expect(localDay(new Date(2026, 9, 15, 12))).toBe(TODAY);
  });
});

describe('review: intervalos', () => {
  it('una tarjeta nueva con "good" se repasa mañana', () => {
    expect(review(undefined, 'good', TODAY)).toEqual({ ease: 2.5, interval: 1, due: '2026-10-16', reps: 1, lapses: 0, last: TODAY });
  });

  it('con "good" seguido los intervalos son 1, 3 y después se multiplican por la facilidad', () => {
    const intervals: number[] = [];
    let card: SrsCard | undefined;
    let day = TODAY;
    for (let i = 0; i < 6; i++) {
      card = review(card, 'good', day);
      intervals.push(card.interval);
      day = card.due;
    }
    // 3 × 2,5 = 7,5 -> 8; 8 × 2,5 = 20; 20 × 2,5 = 50; 50 × 2,5 = 125.
    expect(intervals).toEqual([1, 3, 8, 20, 50, 125]);
    expect(card!.reps).toBe(6);
    expect(card!.ease).toBe(2.5);
  });

  it('el intervalo nunca pasa de 180 días', () => {
    const card = reviewChain(['good', 'good', 'good', 'good', 'good', 'good', 'good']);
    expect(card.interval).toBe(180);
    const old: SrsCard = { ease: 3, interval: 170, due: TODAY, reps: 9, lapses: 0, last: '2026-04-28' };
    expect(review(old, 'easy', TODAY).interval).toBe(180);
    expect(review(old, 'easy', TODAY).due).toBe(addDays(TODAY, 180));
  });

  it('"again" reinicia la tarjeta: mañana otra vez, un fallo más y menos facilidad', () => {
    const learned = reviewChain(['good', 'good', 'good', 'good']);
    const failed = review(learned, 'again', '2026-11-20');
    expect(failed).toEqual({ ease: 2.3, interval: 1, due: '2026-11-21', reps: 0, lapses: 1, last: '2026-11-20' });
    // Después de fallar se vuelve a aprender desde el principio (1 y 3 días), con la facilidad nueva.
    const relearn1 = review(failed, 'good', failed.due);
    const relearn2 = review(relearn1, 'good', relearn1.due);
    const relearn3 = review(relearn2, 'good', relearn2.due);
    expect([relearn1.interval, relearn2.interval, relearn3.interval]).toEqual([1, 3, 7]); // 3 × 2,3 = 6,9
    expect(relearn3.lapses).toBe(1);
  });

  it('"hard" baja la facilidad 0,15 y alarga el intervalo un 20 %', () => {
    const learned = reviewChain(['good', 'good', 'good', 'good']); // intervalo 20
    const hard = review(learned, 'hard', learned.due);
    expect(hard.ease).toBe(2.35);
    expect(hard.interval).toBe(24);
    expect(hard.reps).toBe(5);
    expect(hard.lapses).toBe(0);
    expect(review(undefined, 'hard', TODAY)).toMatchObject({ interval: 1, ease: 2.35, reps: 1 });
  });

  it('"easy" sube la facilidad 0,15 y siempre da más tiempo que "good"', () => {
    const first = review(undefined, 'easy', TODAY);
    expect(first.ease).toBe(2.65);
    expect(first.interval).toBeGreaterThan(review(undefined, 'good', TODAY).interval);
    expect(first.interval).toBe(2);
    const card = reviewChain(['good', 'good', 'good']); // 8 días, facilidad 2,5
    const easy = review(card, 'easy', card.due);
    const good = review(card, 'good', card.due);
    expect(good.interval).toBe(20);
    expect(easy.interval).toBe(26); // 8 × 2,5 = 20; × 1,3 = 26
    expect(easy.ease).toBe(2.65);
  });

  it('la facilidad no baja de 1,3 y se guarda con dos decimales', () => {
    const card = reviewChain(['again', 'again', 'again', 'again', 'again', 'again', 'again', 'again', 'again']);
    expect(card.ease).toBe(1.3);
    expect(card.lapses).toBe(9);
    const hard = reviewChain(['hard', 'hard', 'hard', 'hard', 'hard', 'hard', 'hard', 'hard', 'hard', 'hard']);
    expect(hard.ease).toBe(1.3);
    const mixed = reviewChain(['easy', 'hard', 'easy', 'again', 'hard']);
    expect(Math.round(mixed.ease * 100) / 100).toBe(mixed.ease);
    expect(mixed.ease).toBe(2.3); // 2,5 + 0,15 - 0,15 + 0,15 - 0,2 - 0,15
  });

  it('la fecha del próximo repaso es hoy + intervalo y `last` es hoy', () => {
    for (const grade of ['again', 'hard', 'good', 'easy'] as const) {
      const card = review({ ease: 2.5, interval: 10, due: '2026-10-10', reps: 3, lapses: 0, last: '2026-09-30' }, grade, TODAY);
      expect(card.due).toBe(addDays(TODAY, card.interval));
      expect(card.last).toBe(TODAY);
      expect(card.interval).toBeGreaterThanOrEqual(1);
    }
  });

  it('no modifica la tarjeta original', () => {
    const card: SrsCard = { ease: 2.5, interval: 10, due: TODAY, reps: 3, lapses: 1, last: '2026-10-05' };
    const copy = { ...card };
    review(card, 'again', TODAY);
    review(card, 'easy', TODAY);
    expect(card).toEqual(copy);
  });
});

describe('isDue', () => {
  it('toca el día del repaso y cualquier día después, no antes', () => {
    const card = review(undefined, 'good', TODAY); // vence el 16
    expect(isDue(card, TODAY)).toBe(false);
    expect(isDue(card, '2026-10-16')).toBe(true);
    expect(isDue(card, '2026-11-01')).toBe(true);
  });

  it('funciona al cambiar de mes y de año', () => {
    const card: SrsCard = { ease: 2.5, interval: 3, due: '2026-12-31', reps: 2, lapses: 0, last: '2026-12-28' };
    expect(isDue(card, '2026-12-30')).toBe(false);
    expect(isDue(card, '2027-01-01')).toBe(true);
    expect(isDue({ ...card, due: '2026-10-09' }, '2026-10-10')).toBe(true);
    expect(isDue({ ...card, due: '2026-10-10' }, '2026-10-09')).toBe(false);
  });
});
