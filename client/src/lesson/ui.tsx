// Piezas de interfaz de las lecciones: iconos, botones, texto con jugadas, lista de jugadas,
// etiquetas de jugador y leyenda de flechas.
import { Fragment, useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { localizeSan, parseRichText, type NotationStyle } from '@chessblizzard/shared';
import type { BoardArrowKind } from '../board';
import type { MoveClass } from '../engine';
import { useNotation, useT } from '../i18n';

// --- Iconos (trazo de 24×24, como en las maquetas) ---------------------------

const ICONS = {
  close: 'M6 6l12 12M18 6 6 18',
  first: 'M6 5v14M18 6l-8 6 8 6z',
  prev: 'M15 6l-6 6 6 6',
  next: 'M9 6l6 6-6 6',
  last: 'M18 5v14M6 6l8 6-8 6z',
  flip: 'M7 4v16M7 20l-3-3M7 20l3-3M17 20V4M17 4l-3 3M17 4l3 3',
  bulb: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z',
  check: 'M5 12.5l4.5 4.5L19 7',
  cross: 'M7 7l10 10M17 7 7 17',
  lock: 'M5 11h14v10H5zM8 11V8a4 4 0 0 1 8 0v3',
  retry: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5',
  flag: 'M5 21V4M5 4h11l-2 4 2 4H5',
  book: 'M3 5h6a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H3zM21 5h-6a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h7z',
  play: 'M8 5l11 7-11 7z',
  trophy: 'M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3',
  puzzle: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 12h.01',
  cpu: 'M8 8h8v8H8zM4 10h2M4 14h2M18 10h2M18 14h2M10 4v2M14 4v2M10 18v2M14 18v2',
  upload: 'M12 16V4M7 9l5-5 5 5M4 20h16',
  copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
  swords: 'M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  chart: 'M4 20V10M10 20V4M16 20v-7M2 20h20',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z',
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({ name, size = 20, stroke = 2.2, className }: { name: IconName; size?: number; stroke?: number; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={ICONS[name]} />
    </svg>
  );
}

/** Rayo de XP (relleno). */
export function BoltIcon({ size = 18 }: { size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" className="cb-bolt">
      <path d="M13 2 4 14h7l-1 8 9-12h-7z" fill="currentColor" />
    </svg>
  );
}

/** Llama de la racha (relleno). */
export function FlameIcon({ size = 18 }: { size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" className="cb-flame">
      <path d="M12 2c2.2 4.2 7 6.4 7 12a7 7 0 0 1-14 0c0-3.4 2-5.8 3.4-7.6.9 2.2 2 3.3 3.3 3.3 0-3.2-.9-5.6.3-7.7z" fill="currentColor" />
    </svg>
  );
}

// --- Botones ----------------------------------------------------------------

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: IconName;
  block?: boolean;
};

export function Button({ variant = 'secondary', icon, block, className, children, type = 'button', ...rest }: BtnProps) {
  const cls = ['cb-btn', `cb-btn-${variant}`];
  if (block) cls.push('cb-btn-block');
  if (className) cls.push(className);
  return (
    <button type={type} className={cls.join(' ')} {...rest}>
      {icon && <Icon name={icon} size={18} />}
      {children}
    </button>
  );
}

export function IconButton({ icon, label, className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { icon: IconName; label: string }) {
  return (
    <button type="button" className={`cb-iconbtn${className ? ` ${className}` : ''}`} aria-label={label} title={label} {...rest}>
      <Icon name={icon} size={18} />
    </button>
  );
}

// --- Texto ------------------------------------------------------------------

/** Jugadas de pieza escritas sin corchetes ("...Rf7", "Bg5", "O-O"): se traducen igualmente. */
const LOOSE_MOVE = /(?<![\w\-])((?:\d+\.(?:\.\.)?|\.\.\.)?)([KQRBN][a-h]?[1-8]?x?[a-h][1-8](?:=[QRBN])?[+#]?|O-O(?:-O)?[+#]?)(?!\w)/g;

function localizeLoose(text: string, notation: NotationStyle): string {
  if (notation === 'en') return text;
  return text.replace(LOOSE_MOVE, (_m, num: string, san: string) => num + localizeSan(san, notation));
}

/**
 * Texto del contenido: las jugadas entre corchetes salen como fichas en la notación elegida,
 * y las que se escribieron sin corchetes se traducen igualmente (sin ficha).
 */
export function RichText({ text }: { text: string }) {
  const notation = useNotation();
  const segs = parseRichText(text, notation);
  return (
    <>
      {segs.map((s, i) =>
        s.kind === 'move' ? (
          <span key={i} className="cb-mv">
            {s.value}
          </span>
        ) : (
          <Fragment key={i}>{localizeLoose(s.value, notation)}</Fragment>
        ),
      )}
    </>
  );
}

/**
 * Texto de interfaz con una jugada dentro: la jugada no se pasa a mayúsculas aunque el
 * botón lo haga ("JUEGA TÚ 10...f5", no "10...F5").
 */
export function WithMove({ text, move }: { text: string; move: string }) {
  const i = text.indexOf(MOVE_SLOT);
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span className="cb-nocaps">{move}</span>
      {text.slice(i + MOVE_SLOT.length)}
    </>
  );
}

/** Marcador para pasar a t() en lugar de la jugada y luego sustituirlo con <WithMove>. */
export const MOVE_SLOT = '\u2063';

/** Una jugada suelta como ficha ("10...Cf5"). */
export function MoveChip({ text, tone }: { text: string; tone?: 'ok' | 'err' | 'best' }) {
  return <span className={`cb-mv${tone ? ` cb-mv-${tone}` : ''}`}>{text}</span>;
}

// --- Lista de jugadas ---------------------------------------------------------

export interface ListMove {
  san: string;
  color: 'w' | 'b';
  moveNumber: number;
}

const CLASS_GLYPH: Record<MoveClass, string> = { best: '★', good: '✓', inaccuracy: '?!', mistake: '?', blunder: '??' };

/**
 * Jugadas al estilo de Lichess: número, blancas y negras por fila. `current` es el índice
 * de la jugada resaltada (-1: ninguna). Las del alumno van en negrita.
 */
export function MoveList({
  moves,
  current,
  userColor,
  onSelect,
  marks,
  scroll = false,
  label,
}: {
  moves: ListMove[];
  current: number;
  userColor?: 'w' | 'b';
  onSelect?: (index: number) => void;
  marks?: Partial<Record<number, MoveClass>>;
  /** Lista larga con su propio desplazamiento (análisis). */
  scroll?: boolean;
  label?: string;
}) {
  const notation = useNotation();
  const t = useT();
  const boxRef = useRef<HTMLOListElement>(null);

  // Mantiene visible la jugada actual en las listas con desplazamiento propio.
  useEffect(() => {
    if (!scroll) return;
    const box = boxRef.current;
    const el = box?.querySelector<HTMLElement>('.cb-move-cur');
    if (!box || !el) return;
    const top = el.offsetTop - box.offsetTop;
    if (top < box.scrollTop) box.scrollTop = top - 8;
    else if (top + el.offsetHeight > box.scrollTop + box.clientHeight) box.scrollTop = top + el.offsetHeight - box.clientHeight + 8;
  }, [current, scroll, moves.length]);

  const rows: Array<{ n: number; w?: number; b?: number }> = [];
  moves.forEach((m, i) => {
    const last = rows[rows.length - 1];
    if (m.color === 'w' || !last || last.n !== m.moveNumber || last.b !== undefined) rows.push({ n: m.moveNumber, [m.color]: i });
    else last.b = i;
  });

  const cell = (i: number | undefined) => {
    if (i === undefined) return <span className="cb-move cb-move-empty">…</span>;
    const m = moves[i];
    const cls = ['cb-move'];
    if (i === current) cls.push('cb-move-cur');
    if (userColor && m.color === userColor) cls.push('cb-move-user');
    const mark = marks?.[i];
    if (mark) cls.push(`cb-move-${mark}`);
    const text = localizeSan(m.san, notation);
    const content = (
      <>
        {text}
        {mark && mark !== 'best' && mark !== 'good' && <span className="cb-move-glyph">{CLASS_GLYPH[mark]}</span>}
      </>
    );
    if (!onSelect) return <span className={cls.join(' ')}>{content}</span>;
    return (
      <button
        type="button"
        className={cls.join(' ')}
        onClick={() => onSelect(i)}
        aria-current={i === current ? 'step' : undefined}
        aria-label={`${m.moveNumber}${m.color === 'w' ? '.' : '...'}${text}${mark ? `, ${t(`lesson.class.${mark}`)}` : ''}`}
      >
        {content}
      </button>
    );
  };

  return (
    <ol ref={boxRef} className={`cb-moves${scroll ? ' cb-moves-scroll' : ''}`} aria-label={label ?? t('lesson.moves')}>
      {rows.map((r, i) => (
        <li key={i} className="cb-moves-row">
          <span className="cb-moves-n">{r.n}.</span>
          {cell(r.w)}
          {r.b !== undefined ? cell(r.b) : r.w !== undefined ? <span className="cb-move cb-move-empty" /> : cell(undefined)}
        </li>
      ))}
    </ol>
  );
}

// --- Jugadores y leyenda ------------------------------------------------------

export function Swatch({ color }: { color: 'w' | 'b' }) {
  return <span className={`cb-swatch cb-swatch-${color}`} aria-hidden="true" />;
}

export function PlayerTag({ color, name, note, children }: { color: 'w' | 'b'; name: string; note?: ReactNode; children?: ReactNode }) {
  return (
    <div className="cb-player">
      <Swatch color={color} />
      <span className="cb-player-name">{name}</span>
      {note && <span className="cb-player-note">{note}</span>}
      {children}
    </div>
  );
}

export function ArrowLegend({ kinds }: { kinds: BoardArrowKind[] }) {
  const t = useT();
  const unique = [...new Set(kinds)];
  if (!unique.length) return null;
  return (
    <span className="cb-legend">
      {unique.map((k) => (
        <span key={k} className="cb-legend-item">
          <span className={`cb-legend-swatch cb-legend-${k}`} />
          {t(`lesson.legend.${k}`)}
        </span>
      ))}
    </span>
  );
}

/** Ficha de una idea clave (por ejemplo, una flecha del plan). */
export function IdeaChip({ kind, children }: { kind?: BoardArrowKind; children: ReactNode }) {
  return (
    <span className="cb-chip">
      {kind && <span className={`cb-chip-dot cb-legend-${kind}`} aria-hidden="true" />}
      {children}
    </span>
  );
}

export function Stat({ value, label, tone }: { value: ReactNode; label: string; tone?: 'ok' | 'warn' | 'err' }) {
  return (
    <div className="cb-stat">
      <span className={`cb-stat-value${tone ? ` cb-stat-${tone}` : ''}`}>{value}</span>
      <span className="cb-stat-label">{label}</span>
    </div>
  );
}
