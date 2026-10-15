// Piezas en SVG, el mismo dibujo para todos los temas: el color lo ponen las variables
// CSS del tema (--piece-w-fill, --piece-b-stroke, --piece-w-ink...).
//
// <PieceSprite /> se monta una vez en la app (define los <symbol>) y luego cada pieza
// es un <use href="#cb-piece-n" />.

export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PieceColor = 'w' | 'b';

const BASE = 'M24 89 V84 Q24 78 30 78 H70 Q76 78 76 84 V89 Z';

/** Formas de cada pieza en una caja de 100×100. Las `ink` son los detalles de color contrario. */
export const PIECE_SHAPES: Record<PieceType, { body: string[]; circles?: Array<[number, number, number]>; ink?: string[]; inkDots?: Array<[number, number, number]> }> = {
  p: {
    body: ['M40 52 Q39 67 33 78 H67 Q61 67 60 52 Z', 'M38.5 45 H61.5 A3.5 3.5 0 0 1 61.5 52 H38.5 A3.5 3.5 0 0 1 38.5 45 Z', BASE],
    circles: [[50, 31, 12.5]],
  },
  r: {
    body: ['M36 41 H64 L66 72 H34 Z', 'M28 16 H38 V24 H45 V16 H55 V24 H62 V16 H72 V35 L65 41 H35 L28 35 Z', 'M33 72 H67 A2 2 0 0 1 69 74 V76 A2 2 0 0 1 67 78 H33 A2 2 0 0 1 31 76 V74 A2 2 0 0 1 33 72 Z', BASE],
  },
  n: {
    body: ['M31 78 L36 59 L29 55 Q24 54 21 50 Q17 45 21 40 L36 27 L39 12 L47 22 Q63 20 71 35 Q80 53 72 78 Z', BASE],
    ink: ['M49 31 Q60 44 58 64'],
    inkDots: [[38, 33, 3]],
  },
  b: {
    body: ['M41 65 L36 78 H64 L59 65 Z', 'M38 58 H62 A3 3 0 0 1 62 65 H38 A3 3 0 0 1 38 58 Z', 'M50 15 Q67 30 64 46 Q62 57 50 58 Q38 57 36 46 Q33 30 50 15 Z', BASE],
    circles: [[50, 11, 5]],
    ink: ['M57 29 L47 41'],
  },
  q: {
    body: ['M33 70 L25 33 L37 52 L40 27 L46 49 L50 23 L54 49 L60 27 L63 52 L75 33 L67 70 Z', 'M33.5 70 H66.5 A2.5 2.5 0 0 1 69 72.5 V75.5 A2.5 2.5 0 0 1 66.5 78 H33.5 A2.5 2.5 0 0 1 31 75.5 V72.5 A2.5 2.5 0 0 1 33.5 70 Z', BASE],
    circles: [
      [25, 30, 4.5],
      [40, 24, 4.5],
      [50, 19, 4.5],
      [60, 24, 4.5],
      [75, 30, 4.5],
    ],
  },
  k: {
    body: [
      'M37 60 L33 78 H67 L63 60 Z',
      'M34 53 H66 A3 3 0 0 1 66 60 H34 A3 3 0 0 1 34 53 Z',
      'M31 53 Q25 36 40 33 Q46 32 50 38 Q54 32 60 33 Q75 36 69 53 Z',
      'M46 6 H54 V13 H61 V21 H54 V31 H46 V21 H39 V13 H46 Z',
      BASE,
    ],
  },
};

function PieceShape({ type }: { type: PieceType }) {
  const s = PIECE_SHAPES[type];
  return (
    <>
      {s.body.map((d, i) => (
        <path key={i} d={d} />
      ))}
      {s.circles?.map(([cx, cy, r], i) => (
        <circle key={`c${i}`} cx={cx} cy={cy} r={r} />
      ))}
      {s.ink?.map((d, i) => (
        <path key={`i${i}`} d={d} fill="none" style={{ stroke: 'var(--ink)' }} />
      ))}
      {s.inkDots?.map(([cx, cy, r], i) => (
        <circle key={`d${i}`} cx={cx} cy={cy} r={r} style={{ fill: 'var(--ink)', stroke: 'none' }} />
      ))}
    </>
  );
}

/** Define los símbolos de las piezas. Móntalo una vez cerca de la raíz de la app. */
export function PieceSprite() {
  return (
    <svg width={0} height={0} style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        {(Object.keys(PIECE_SHAPES) as PieceType[]).map((t) => (
          <symbol key={t} id={`cb-piece-${t}`} viewBox="0 0 100 100">
            <PieceShape type={t} />
          </symbol>
        ))}
      </defs>
    </svg>
  );
}

const STYLE: Record<PieceColor, React.CSSProperties> = {
  w: {
    fill: 'var(--piece-w-fill)',
    stroke: 'var(--piece-w-stroke)',
    ['--ink' as string]: 'var(--piece-w-ink)',
    filter: 'var(--piece-w-filter)',
  },
  b: {
    fill: 'var(--piece-b-fill)',
    stroke: 'var(--piece-b-stroke)',
    ['--ink' as string]: 'var(--piece-b-ink)',
    filter: 'var(--piece-b-filter)',
  },
};

/** Una pieza suelta (necesita <PieceSprite /> montado). */
export function Piece({ type, color, size = 48, className }: { type: PieceType; color: PieceColor; size?: number | string; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      style={{ ...STYLE[color], strokeWidth: 3.2, strokeLinejoin: 'round', strokeLinecap: 'round', overflow: 'visible' }}
    >
      <use href={`#cb-piece-${type}`} />
    </svg>
  );
}
