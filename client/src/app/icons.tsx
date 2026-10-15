// Iconos de trazo (24×24) de las maquetas. Siempre decorativos: el texto o el aria-label
// del control que los contiene es el que da el nombre accesible.
import type { StageType } from '@chessblizzard/shared';

const PATHS = {
  learn: 'M3 20l6-10 4 6 3-4 5 8z',
  review: 'M3 12a9 9 0 0 1 15.5-6.2L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.2L3 16M3 21v-5h5',
  puzzle: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 12h.01',
  analysis: 'M4 20V10M10 20V4M16 20v-7M2 20h20',
  profile: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1',
  ideas: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z',
  line: 'M3 5h6a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H3zM21 5h-6a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h7z',
  practice: 'M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3',
  branch: 'M6 3v12M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 9c0 5-12 4-12 9',
  trap: 'M12 3l10 18H2zM12 10v5M12 18h.01',
  spar: 'M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2',
  exam: 'M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3',
  flag: 'M6 21V4M6 4h11l-2.5 4L17 12H6',
  check: 'M5 12.5l4.5 4.5L19 7',
  lock: 'M7 11h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2zM8 11V8a4 4 0 0 1 8 0v3',
  close: 'M6 6l12 12M18 6 6 18',
  chevronDown: 'M6 9l6 6 6-6',
  chevronLeft: 'M15 18l-6-6 6-6',
  chevronRight: 'M9 18l6-6-6-6',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  cloud: 'M7 18a5 5 0 1 1 .9-9.9A6 6 0 0 1 19 9.5a4.3 4.3 0 0 1-1 8.5z',
  cloudOff: 'M3 3l18 18M7 18a5 5 0 0 1-1.6-9.7M10 6.4A6 6 0 0 1 19 9.5a4.3 4.3 0 0 1 1.4 7.6',
  mountain: 'M3 20l6-10 4 6 3-4 5 8z',
  crown: 'M3 18h18M4 18l-1-11 5 4 4-7 4 7 5-4-1 11',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z',
  moon: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z',
  sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  eyeOff: 'M3 3l18 18M10.6 6.1A10 10 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3 3.7M6.6 6.6A17 17 0 0 0 2 12s3.5 6 10 6a9.7 9.7 0 0 0 4.4-1M9.9 9.9a3 3 0 0 0 4.2 4.2',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8h.01',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  play: 'M7 4v16l13-8z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  book: 'M4 4h10a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4zM4 16a4 4 0 0 1 4-4h10',
} as const;

/** Iconos rellenos (llama de la racha y rayo de la XP). */
const FILLED = {
  flame: 'M12 2c2.2 4.2 7 6.4 7 12a7 7 0 0 1-14 0c0-3.4 2-5.8 3.4-7.6.9 2.2 2 3.3 3.3 3.3 0-3.2-.9-5.6.3-7.7z',
  bolt: 'M13 2 4 14h7l-1 8 9-12h-7z',
} as const;

export type IconName = keyof typeof PATHS | keyof typeof FILLED;

export const STAGE_ICONS: Record<StageType, IconName> = {
  ideas: 'ideas',
  line: 'line',
  practice: 'practice',
  branch: 'branch',
  trap: 'trap',
  puzzles: 'puzzle',
  sparring: 'spar',
  exam: 'exam',
};

export function Icon({ name, size = 22, strokeWidth = 2, className }: { name: IconName; size?: number; strokeWidth?: number; className?: string }) {
  if (name in FILLED) {
    return (
      <svg aria-hidden="true" focusable="false" className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d={FILLED[name as keyof typeof FILLED]} />
      </svg>
    );
  }
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={PATHS[name as keyof typeof PATHS]} />
    </svg>
  );
}
