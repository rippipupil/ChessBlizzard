// La mascota: un fantasma que cambia con el tema. Bruma (Black Blizzard) está hecha de
// niebla y tiene el borde en sierra; Neón es un contorno luminoso con el borde ondulado.
import { useSettings } from '../state/settings';

export type GhostMood = 'neutral' | 'happy' | 'sad' | 'thinking';

const BLIZZARD_BODY =
  'M20 70 Q20 18 60 18 Q100 18 100 70 L100 118 L92 108 L84 122 L76 106 L68 124 L60 106 L52 124 L44 106 L36 122 L28 108 L20 118 Z';
const NEON_BODY = 'M20 70 Q20 18 60 18 Q100 18 100 70 L100 116 Q90 106 80 116 Q70 126 60 116 Q50 106 40 116 Q30 126 20 116 Z';

const MOUTHS: Record<GhostMood, string> = {
  neutral: 'M54 88 Q60 91 66 88',
  happy: 'M50 85 Q60 96 70 85',
  sad: 'M51 92 Q60 84 69 92',
  thinking: 'M54 90 L66 87',
};

export function ghostName(theme: 'blizzard' | 'neon'): string {
  return theme === 'neon' ? 'Neón' : 'Bruma';
}

export function Ghost({
  mood = 'neutral',
  size = 64,
  title,
  theme,
}: {
  mood?: GhostMood;
  size?: number;
  title?: string;
  /** Fuerza el fantasma de un tema (miniaturas de los ajustes); por defecto, el tema actual. */
  theme?: 'blizzard' | 'neon';
}) {
  const { settings } = useSettings();
  const shown = theme ?? settings.theme;
  const neon = shown === 'neon';
  const label = title ?? ghostName(shown);
  return (
    <svg
      role="img"
      aria-label={label}
      width={size}
      height={size * (140 / 120)}
      viewBox="0 0 120 140"
      style={{ flexShrink: 0, overflow: 'visible', filter: neon ? 'drop-shadow(0 0 8px var(--accent-glow))' : undefined }}
    >
      {neon ? (
        <path d={NEON_BODY} fill="var(--ghost-body)" stroke="var(--accent)" strokeWidth={5} />
      ) : (
        <path d={BLIZZARD_BODY} fill="var(--ghost-body)" opacity={0.95} />
      )}
      {neon ? (
        mood === 'sad' ? (
          <>
            <path d="M38 62 Q46 70 54 62" fill="none" stroke="var(--ghost-eye)" strokeWidth={5} strokeLinecap="round" />
            <path d="M66 62 Q74 70 82 62" fill="none" stroke="var(--ghost-eye)" strokeWidth={5} strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M38 66 Q46 56 54 66" fill="none" stroke="var(--ghost-eye)" strokeWidth={5} strokeLinecap="round" />
            <path d="M66 66 Q74 56 82 66" fill="none" stroke="var(--ghost-eye)" strokeWidth={5} strokeLinecap="round" />
          </>
        )
      ) : (
        <>
          <ellipse cx={46} cy={66} rx={8} ry={mood === 'happy' ? 9 : 11} fill="var(--ghost-eye)" />
          <ellipse cx={74} cy={66} rx={8} ry={mood === 'happy' ? 9 : 11} fill="var(--ghost-eye)" />
          <circle cx={49} cy={62} r={2.5} fill="var(--ghost-glint)" />
          <circle cx={77} cy={62} r={2.5} fill="var(--ghost-glint)" />
        </>
      )}
      <path d={MOUTHS[mood]} fill="none" stroke={neon ? 'var(--ghost-glint)' : 'var(--ghost-eye)'} strokeWidth={3.5} strokeLinecap="round" />
      {mood === 'thinking' && <circle cx={98} cy={30} r={4} fill="var(--ghost-glint)" />}
    </svg>
  );
}
