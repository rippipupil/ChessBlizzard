// Repetición espaciada (variante simplificada de SM-2) para las líneas de apertura.

export type Grade = 'again' | 'hard' | 'good' | 'easy';

export interface SrsCard {
  ease: number;
  /** Días hasta el siguiente repaso. */
  interval: number;
  /** Fecha del siguiente repaso (AAAA-MM-DD). */
  due: string;
  reps: number;
  lapses: number;
  /** Último repaso (AAAA-MM-DD). */
  last: string;
}

const MIN_EASE = 1.3;
const MAX_INTERVAL = 180;

export function isDay(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

export function addDays(day: string, days: number): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
}

/** Fecha local del dispositivo en formato AAAA-MM-DD. */
export function localDay(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function review(card: SrsCard | undefined, grade: Grade, today: string): SrsCard {
  const prev: SrsCard = card ?? { ease: 2.5, interval: 0, due: today, reps: 0, lapses: 0, last: today };
  let { ease, interval, reps, lapses } = prev;

  switch (grade) {
    case 'again':
      reps = 0;
      lapses += 1;
      ease = Math.max(MIN_EASE, ease - 0.2);
      interval = 1;
      break;
    case 'hard':
      reps += 1;
      ease = Math.max(MIN_EASE, ease - 0.15);
      interval = Math.max(1, Math.round(interval * 1.2));
      break;
    case 'good':
    case 'easy':
      reps += 1;
      if (reps === 1) interval = 1;
      else if (reps === 2) interval = 3;
      else interval = Math.round(interval * ease);
      if (grade === 'easy') {
        ease += 0.15;
        interval = Math.round(interval * 1.3) || 1;
      }
      break;
  }

  interval = Math.min(MAX_INTERVAL, Math.max(1, interval));
  return { ease: Math.round(ease * 100) / 100, interval, due: addDays(today, interval), reps, lapses, last: today };
}

export function isDue(card: SrsCard, today: string): boolean {
  return card.due <= today;
}
