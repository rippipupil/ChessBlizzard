// Tablero de ajedrez propio: casillas en una cuadrícula, piezas SVG (<use href="#cb-piece-x">)
// en una capa que se anima, flechas y marcas en un SVG encima, y movimiento con clic o
// arrastre (Pointer Events: ratón y táctil) o con el teclado.
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type MutableRefObject, type PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { parseArrow } from '@chessblizzard/shared';
import { useT } from '../i18n';
import { useSettings } from '../state/settings';
import {
  arrowPaths,
  fromXY,
  isLightSquare,
  parsePlacement,
  squareCenter,
  squareDistance,
  toXY,
  type BoardPiece,
  type Orientation,
} from './geometry';
import { PieceSprite, type PieceColor, type PieceType } from './pieces';
import './board.css';

export type { Orientation } from './geometry';

export type BoardArrowKind = 'plan' | 'rival' | 'hint' | 'best';

export interface BoardArrow {
  from: string;
  to: string;
  /** Casillas intermedias (codo de la flecha de caballo). Si falta, se calcula. */
  via?: string[];
  kind: BoardArrowKind;
}

export interface BoardMovable {
  color: 'w' | 'b';
  dests: Map<string, string[]>;
}

/** Resaltado de feedback de una casilla: acierto, error o pista. */
export type SquareTone = 'ok' | 'err' | 'hint';

export interface BoardProps {
  fen: string;
  orientation?: Orientation;
  /** Bando que puede mover y sus destinos legales; null = tablero de solo lectura. */
  movable?: BoardMovable | null;
  onMove?: (from: string, to: string, promotion?: string) => void;
  lastMove?: readonly [string, string] | null;
  /** Casilla del rey en jaque. */
  check?: string | null;
  arrows?: BoardArrow[];
  /** Casillas destacadas (se dibujan como un anillo). */
  marks?: string[];
  tones?: Partial<Record<string, SquareTone>>;
  /** Etiqueta accesible del tablero. */
  ariaLabel?: string;
  /** Anima los movimientos (por defecto, sí; siempre se respeta prefers-reduced-motion). */
  animate?: boolean;
  /** Fuerza mostrar u ocultar las coordenadas (por defecto, el ajuste del usuario). */
  coordinates?: boolean;
  /** Fuerza resaltar o no la última jugada (por defecto, el ajuste del usuario). */
  highlightLastMove?: boolean;
  className?: string;
}

interface PieceItem extends BoardPiece {
  id: number;
  square: string;
}

interface Layout {
  fen: string;
  orientation: Orientation;
  items: PieceItem[];
  /** Piezas capturadas que se desvanecen. */
  fading: PieceItem[];
  moved: Set<number>;
  /** Sin animación (salto grande, giro del tablero o primera vez). */
  instant: boolean;
  /** Pieza soltada con arrastre: llega a su casilla sin animación. */
  noAnim: number | null;
}

const PROMOTION: PieceType[] = ['q', 'n', 'r', 'b'];

/** Empareja las piezas de la posición anterior con las de la nueva para animar los movimientos. */
function matchPieces(prev: PieceItem[], next: Map<string, BoardPiece>, newId: () => number) {
  const items: PieceItem[] = [];
  const moved = new Set<number>();
  const bySquare = new Map(prev.map((p) => [p.square, p]));
  const used = new Set<number>();
  const pending: Array<[string, BoardPiece]> = [];
  for (const [square, pc] of next) {
    const p = bySquare.get(square);
    if (p && p.color === pc.color && p.type === pc.type) {
      items.push(p);
      used.add(p.id);
    } else pending.push([square, pc]);
  }
  const leftovers = prev.filter((p) => !used.has(p.id));
  for (const [square, pc] of pending) {
    let best = -1;
    let bestD = Infinity;
    leftovers.forEach((p, i) => {
      if (p.color !== pc.color || p.type !== pc.type) return;
      const d = squareDistance(p.square, square);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    if (best >= 0) {
      const [p] = leftovers.splice(best, 1);
      items.push({ ...p, square });
      moved.add(p.id);
    } else {
      items.push({ id: newId(), square, ...pc });
    }
  }
  return { items, moved, removed: leftovers };
}

function computeLayout(
  ref: MutableRefObject<Layout | null>,
  fen: string,
  orientation: Orientation,
  pieces: Map<string, BoardPiece>,
  idRef: MutableRefObject<number>,
  droppedRef: MutableRefObject<string | null>,
  animate: boolean,
): Layout {
  const prev = ref.current;
  if (prev && prev.fen === fen && prev.orientation === orientation) return prev;
  const newId = () => ++idRef.current;
  if (!prev) {
    ref.current = {
      fen,
      orientation,
      items: [...pieces].map(([square, p]) => ({ id: newId(), square, ...p })),
      fading: [],
      moved: new Set(),
      instant: true,
      noAnim: null,
    };
  } else if (prev.fen === fen) {
    // Solo ha girado el tablero: sin animación.
    ref.current = { ...prev, orientation, fading: [], moved: new Set(), instant: true, noAnim: null };
  } else {
    const { items, moved, removed } = matchPieces(prev.items, pieces, newId);
    const instant = !animate || moved.size > 4 || prev.orientation !== orientation;
    const dropped = droppedRef.current;
    droppedRef.current = null;
    const noAnim = dropped ? (items.find((i) => i.square === dropped)?.id ?? null) : null;
    ref.current = { fen, orientation, items, fading: instant ? [] : removed, moved, instant, noAnim };
  }
  return ref.current;
}

const PIECE_VIEWBOX = '-8 -8 116 116';

export function Board({
  fen,
  orientation = 'white',
  movable = null,
  onMove,
  lastMove = null,
  check = null,
  arrows,
  marks,
  tones,
  ariaLabel,
  animate = true,
  coordinates,
  highlightLastMove,
  className,
}: BoardProps) {
  const { settings } = useSettings();
  const t = useT();
  const uid = useId();
  const showCoords = coordinates ?? settings.coordinates;
  const showLast = highlightLastMove ?? settings.highlightLastMove;

  const pieces = useMemo(() => parsePlacement(fen), [fen]);

  const idRef = useRef(0);
  const droppedRef = useRef<string | null>(null);
  const layoutRef = useRef<Layout | null>(null);
  const layout = computeLayout(layoutRef, fen, orientation, pieces, idRef, droppedRef, animate);

  const rootRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [promo, setPromo] = useState<{ from: string; to: string; color: PieceColor } | null>(null);
  const [drag, setDrag] = useState<{ from: string; size: number; x: number; y: number; piece: BoardPiece; touch: boolean } | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const dragRef = useRef<{ from: string; pointerId: number; startX: number; startY: number; active: boolean; wasSelected: boolean; touch: boolean } | null>(null);
  const pointerFocus = useRef(-Infinity);
  const canMove = !!movable;

  // Una posición nueva o perder el turno cancela la selección y el arrastre.
  useEffect(() => {
    setSelected(null);
    setPromo(null);
  }, [fen, canMove]);
  useEffect(() => {
    if (canMove) return;
    dragRef.current = null;
    setDrag(null);
    setHover(null);
  }, [canMove]);

  const ownPiece = (sq: string) => {
    const pc = pieces.get(sq);
    return !!movable && !!pc && pc.color === movable.color;
  };
  const sel = selected && ownPiece(selected) ? selected : null;
  const destsOf = (sq: string | null) => (sq && movable ? (movable.dests.get(sq) ?? []) : []);
  const selDests = destsOf(sel);

  function squareFromPoint(clientX: number, clientY: number): string | null {
    const el = rootRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const x = Math.floor(((clientX - rect.left) / rect.width) * 8);
    const y = Math.floor(((clientY - rect.top) / rect.height) * 8);
    if (x < 0 || x > 7 || y < 0 || y > 7) return null;
    return fromXY(x, y, orientation);
  }

  function commitMove(from: string, to: string) {
    const pc = pieces.get(from);
    if (pc?.type === 'p' && (to[1] === '8' || to[1] === '1')) {
      setPromo({ from, to, color: pc.color });
      return;
    }
    setSelected(null);
    onMove?.(from, to);
  }

  /** Un "clic" (ratón, toque o Intro) sobre una casilla. Devuelve true si empieza una selección. */
  function activate(sq: string): 'moved' | 'selected' | 'none' {
    if (sel && sel !== sq && selDests.includes(sq)) {
      commitMove(sel, sq);
      return 'moved';
    }
    if (ownPiece(sq)) {
      setSelected(sq);
      return 'selected';
    }
    setSelected(null);
    return 'none';
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    pointerFocus.current = performance.now();
    setCursor(null);
    if (!movable || promo) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const sq = squareFromPoint(e.clientX, e.clientY);
    if (!sq) return;
    const wasSelected = sel === sq;
    const result = activate(sq);
    if (result === 'selected') {
      e.preventDefault();
      dragRef.current = {
        from: sq,
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        active: false,
        wasSelected,
        touch: e.pointerType !== 'mouse',
      };
      try {
        rootRef.current?.setPointerCapture(e.pointerId);
      } catch {
        // Algunos navegadores no permiten capturar un puntero ya liberado.
      }
    } else if (result === 'moved') {
      e.preventDefault();
    }
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const d = dragRef.current;
    if (!d || d.pointerId !== e.pointerId) return;
    if (!d.active) {
      const dist = Math.hypot(e.clientX - d.startX, e.clientY - d.startY);
      if (dist < (d.touch ? 6 : 3)) return;
      const pc = pieces.get(d.from);
      const rect = rootRef.current?.getBoundingClientRect();
      if (!pc || !rect) return;
      d.active = true;
      setDrag({ from: d.from, size: rect.width / 8, x: e.clientX, y: e.clientY, piece: pc, touch: d.touch });
    }
    const ghost = ghostRef.current;
    if (ghost) {
      const size = ghost.offsetWidth;
      ghost.style.transform = `translate(${e.clientX - size / 2}px, ${e.clientY - size / 2}px)`;
    }
    const sq = squareFromPoint(e.clientX, e.clientY);
    setHover((h) => (h === sq ? h : sq));
  }

  function endDrag(e: ReactPointerEvent<HTMLDivElement>, cancelled: boolean) {
    const d = dragRef.current;
    if (!d || d.pointerId !== e.pointerId) return;
    dragRef.current = null;
    if (d.active) {
      setDrag(null);
      setHover(null);
      if (cancelled) return;
      const sq = squareFromPoint(e.clientX, e.clientY);
      if (sq && sq !== d.from && destsOf(d.from).includes(sq)) {
        droppedRef.current = sq;
        commitMove(d.from, sq);
      }
    } else if (!cancelled && d.wasSelected) {
      // Segundo clic sobre la pieza ya seleccionada: se deselecciona.
      setSelected(null);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (!movable) return;
    if (promo) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setPromo(null);
      }
      return;
    }
    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', ' ', 'Escape'];
    if (!keys.includes(e.key)) return;
    if (e.key === 'Escape') {
      if (sel) {
        e.preventDefault();
        setSelected(null);
      }
      return;
    }
    // Sin cursor de teclado (se llegó con el ratón), las teclas siguen siendo de la página
    // (por ejemplo, Intro para «Continuar» o las flechas para recorrer la línea).
    if (cursor === null) return;
    e.preventDefault();
    e.stopPropagation();
    const cur = cursor;
    if (e.key === 'Enter' || e.key === ' ') {
      activate(cur);
      return;
    }
    const { x, y } = toXY(cur, orientation);
    const nx = Math.max(0, Math.min(7, x + (e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0)));
    const ny = Math.max(0, Math.min(7, y + (e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0)));
    setCursor(fromXY(nx, ny, orientation));
  }

  function onFocus() {
    // El foco que llega con el teclado (Tab) activa el cursor; el del ratón, no.
    const fromPointer = performance.now() - pointerFocus.current < 600;
    if (!fromPointer && movable) setCursor((c) => c ?? (orientation === 'white' ? 'e2' : 'e7'));
  }

  function choosePromotion(type: PieceType) {
    if (!promo) return;
    const { from, to } = promo;
    setPromo(null);
    setSelected(null);
    onMove?.(from, to, type);
  }

  // Enfoca la dama al abrir la promoción.
  const promoRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (promo) promoRef.current?.focus({ preventScroll: true });
  }, [promo]);

  // --- Etiquetas accesibles ---
  const pieceName = (pc: BoardPiece) => t(`lesson.board.piece.${pc.color}${pc.type}`);
  const lastSet = showLast && lastMove ? new Set(lastMove) : null;

  const rows = [];
  for (let y = 0; y < 8; y++) {
    const cells = [];
    for (let x = 0; x < 8; x++) {
      const sq = fromXY(x, y, orientation);
      const pc = pieces.get(sq);
      const isDest = selDests.includes(sq);
      const cls = ['cb-sq', isLightSquare(sq) ? 'cb-sq-l' : 'cb-sq-d'];
      if (lastSet?.has(sq)) cls.push('cb-last');
      if (sel === sq) cls.push('cb-sel');
      if (check === sq) cls.push('cb-check');
      if (isDest) cls.push(pc ? 'cb-cap' : 'cb-dest');
      if (drag && hover === sq) cls.push('cb-hover');
      if (cursor === sq) cls.push('cb-cursor');
      if (ownPiece(sq)) cls.push('cb-own');
      const tone = tones?.[sq];
      if (tone) cls.push(`cb-tone-${tone}`);
      let label = pc ? `${sq}, ${pieceName(pc)}` : `${sq}, ${t('lesson.board.empty')}`;
      if (sel === sq) label += `, ${t('lesson.board.selected')}`;
      else if (isDest) label += `, ${t('lesson.board.dest')}`;
      if (check === sq) label += `, ${t('lesson.board.check')}`;
      cells.push(
        <div key={sq} id={`${uid}-${sq}`} role="gridcell" aria-label={label} className={cls.join(' ')}>
          {showCoords && x === 0 && (
            <span className="cb-coord cb-coord-rank" aria-hidden="true">
              {sq[1]}
            </span>
          )}
          {showCoords && y === 7 && (
            <span className="cb-coord cb-coord-file" aria-hidden="true">
              {sq[0]}
            </span>
          )}
        </div>,
      );
    }
    rows.push(
      <div key={y} role="row" className="cb-row">
        {cells}
      </div>,
    );
  }

  const arrowList = arrows ?? [];
  const markList = marks ?? [];
  const arrowLabel = arrowList.length
    ? `${t('lesson.board.arrows')}: ${arrowList.map((a) => `${t(`lesson.arrow.${a.kind}`)} ${a.from}–${a.to}`).join('; ')}`
    : undefined;

  const classes = ['cb-board'];
  if (layout.instant) classes.push('cb-instant');
  if (movable) classes.push('cb-movable');
  if (className) classes.push(className);

  return (
    <div
      ref={rootRef}
      className={classes.join(' ')}
      role="grid"
      aria-label={ariaLabel ?? t('lesson.board.label')}
      aria-readonly={!movable}
      aria-activedescendant={cursor ? `${uid}-${cursor}` : undefined}
      tabIndex={movable ? 0 : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => endDrag(e, false)}
      onPointerCancel={(e) => endDrag(e, true)}
      onLostPointerCapture={(e) => endDrag(e, true)}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onBlur={() => setCursor(null)}
      onContextMenu={(e) => e.preventDefault()}
    >
      <PieceSprite />
      <div className="cb-squares">{rows}</div>

      <div className="cb-pieces" aria-hidden="true">
        {layout.fading.map((p) => {
          const { x, y } = toXY(p.square, orientation);
          return (
            <svg key={`f${p.id}`} className={`cb-piece cb-pc-${p.color} cb-fade`} viewBox={PIECE_VIEWBOX} style={{ transform: `translate(${x * 100}%, ${y * 100}%)` }}>
              <use href={`#cb-piece-${p.type}`} />
            </svg>
          );
        })}
        {layout.items.map((p) => {
          const { x, y } = toXY(p.square, orientation);
          const cls = ['cb-piece', `cb-pc-${p.color}`];
          if (layout.moved.has(p.id)) cls.push('cb-moved');
          if (layout.noAnim === p.id) cls.push('cb-noanim');
          if (drag && drag.from === p.square) cls.push('cb-dragging');
          return (
            <svg key={p.id} className={cls.join(' ')} viewBox={PIECE_VIEWBOX} style={{ transform: `translate(${x * 100}%, ${y * 100}%)` }}>
              <use href={`#cb-piece-${p.type}`} />
            </svg>
          );
        })}
      </div>

      {(arrowList.length > 0 || markList.length > 0) && (
        <svg className="cb-overlay" viewBox="0 0 800 800" role="img" aria-label={arrowLabel}>
          {markList.map((m) => {
            const c = squareCenter(m, orientation);
            return <circle key={`m${m}`} className="cb-mark" cx={c.x} cy={c.y} r={43} />;
          })}
          {arrowList.map((a, i) => {
            let via = a.via;
            if (!via) {
              try {
                via = parseArrow(a.from + a.to).via;
              } catch {
                via = [];
              }
            }
            const p = arrowPaths([a.from, ...via, a.to], orientation);
            if (!p) return null;
            return (
              <g key={`${a.kind}${a.from}${a.to}${i}`} className={`cb-arrow cb-arrow-${a.kind}`}>
                <polyline points={p.shaft} />
                <polygon points={p.head} />
              </g>
            );
          })}
        </svg>
      )}

      {promo && (
        <div
          className="cb-promo"
          onPointerDown={(e) => {
            e.stopPropagation();
            if (e.target === e.currentTarget) setPromo(null);
          }}
        >
          {PROMOTION.map((type, i) => {
            const { x, y } = toXY(promo.to, orientation);
            const dir = y === 0 ? 1 : -1;
            const yy = y + dir * i;
            return (
              <button
                key={type}
                ref={i === 0 ? promoRef : undefined}
                type="button"
                className="cb-promo-btn"
                style={{ left: `${x * 12.5}%`, top: `${yy * 12.5}%` }}
                aria-label={`${t('lesson.board.promote')}: ${pieceName({ color: promo.color, type })}`}
                onClick={() => choosePromotion(type)}
              >
                <svg className={`cb-piece-svg cb-pc-${promo.color}`} viewBox={PIECE_VIEWBOX} aria-hidden="true">
                  <use href={`#cb-piece-${type}`} />
                </svg>
              </button>
            );
          })}
        </div>
      )}

      {drag &&
        createPortal(
          <div
            ref={ghostRef}
            className={`cb-drag${drag.touch ? ' cb-drag-touch' : ''}`}
            style={{ width: drag.size, height: drag.size, transform: `translate(${drag.x - drag.size / 2}px, ${drag.y - drag.size / 2}px)` }}
            aria-hidden="true"
          >
            <svg className={`cb-piece-svg cb-pc-${drag.piece.color}`} viewBox={PIECE_VIEWBOX}>
              <use href={`#cb-piece-${drag.piece.type}`} />
            </svg>
          </div>,
          document.body,
        )}
    </div>
  );
}
