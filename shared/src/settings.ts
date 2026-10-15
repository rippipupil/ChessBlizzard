// Ajustes del usuario. Los usan el cliente (modo invitado) y el servidor (cuentas).

export interface Settings {
  locale: 'es' | 'en';
  theme: 'blizzard' | 'neon';
  colorMode: 'dark' | 'light' | 'system';
  notation: 'es' | 'en';
  coordinates: boolean;
  highlightLastMove: boolean;
  planArrows: boolean;
  sounds: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  locale: 'es',
  theme: 'blizzard',
  colorMode: 'dark',
  notation: 'es',
  coordinates: true,
  highlightLastMove: true,
  planArrows: true,
  sounds: false,
};

/** Se queda solo con las claves y valores válidos de un objeto de ajustes. */
export function sanitizeSettings(input: unknown): Partial<Settings> {
  if (!input || typeof input !== 'object') return {};
  const src = input as Record<string, unknown>;
  const out: Partial<Settings> = {};
  const pick = <K extends keyof Settings>(key: K, valid: readonly Settings[K][]) => {
    if (valid.includes(src[key] as Settings[K])) out[key] = src[key] as Settings[K];
  };
  pick('locale', ['es', 'en']);
  pick('theme', ['blizzard', 'neon']);
  pick('colorMode', ['dark', 'light', 'system']);
  pick('notation', ['es', 'en']);
  for (const key of ['coordinates', 'highlightLastMove', 'planArrows', 'sounds'] as const) {
    if (typeof src[key] === 'boolean') out[key] = src[key] as boolean;
  }
  return out;
}
