// Símbolos SVG de las piezas, inyectados una sola vez en <body> para que todos los
// tableros (y la pieza que se arrastra) los usen con <use href="#cb-piece-x">.
// Es el mismo dibujo que <PieceSprite /> (pieces.tsx); si la app también monta este, los
// identificadores coinciden y no pasa nada.
import { PIECE_SHAPES, type PieceType } from './pieces';

const SPRITE_ID = 'cb-piece-sprite';

function symbolMarkup(type: PieceType): string {
  const s = PIECE_SHAPES[type];
  let out = `<symbol id="cb-piece-${type}" viewBox="0 0 100 100">`;
  for (const d of s.body) out += `<path d="${d}"/>`;
  for (const [cx, cy, r] of s.circles ?? []) out += `<circle cx="${cx}" cy="${cy}" r="${r}"/>`;
  for (const d of s.ink ?? []) out += `<path d="${d}" fill="none" style="stroke: var(--ink)"/>`;
  for (const [cx, cy, r] of s.inkDots ?? []) out += `<circle cx="${cx}" cy="${cy}" r="${r}" style="fill: var(--ink); stroke: none"/>`;
  return `${out}</symbol>`;
}

/** Crea el sprite de piezas si todavía no existe en el documento. */
export function ensurePieceSprite() {
  if (typeof document === 'undefined' || document.getElementById(SPRITE_ID)) return;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('id', SPRITE_ID);
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden');
  svg.innerHTML = `<defs>${(Object.keys(PIECE_SHAPES) as PieceType[]).map(symbolMarkup).join('')}</defs>`;
  document.body.prepend(svg);
}
