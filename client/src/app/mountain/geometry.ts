// Geometría de la montaña de un curso, a partir del script de las maquetas (Main.dc.html y
// Movil.dc.html) pero para cualquier número de etapas y campamentos: la montaña crece con
// las etapas, las etapas zigzaguean y se estrechan hacia la cumbre, y la última etapa (el
// examen) está siempre en la cumbre, bajo la bandera.
//
// Todo es determinista (mismo generador pseudoaleatorio que las maquetas): la montaña de un
// curso es siempre la misma.

export interface MountainSpec {
  /** Ancho del lienzo. */
  width: number;
  /** Desplazamiento de la montaña (deja sitio a la columna de campamentos). */
  ox: number;
  /** Cumbre: x (relativa a ox) e y. La base mide 2·ax. */
  ax: number;
  ay: number;
  r: number;
  rSummit: number;
  /** Del pico al centro del nodo de la cumbre. */
  summitDy: number;
  /** Separación vertical entre la cumbre y la etapa anterior, y entre las demás. */
  gapTop: number;
  gap: number;
  padBottom: number;
  minHeight: number;
  /** Amplitud del zigzag: a + b·r, con r = 0 en la cumbre y 1 en la base. */
  amp: [number, number];
  /** Sierra de los bordes: paso vertical, profundidad del diente y altura del diente. */
  step: number;
  tooth: number;
  toothRnd: number;
  toothDy: number;
  jag: number;
  /** Nieve: altura bajo la cumbre, paso, número de dientes y forma del borde inferior. */
  snow: { h: number; step: number; teeth: number; factor: number; tipDy: number; tipRnd: number; baseDy: number };
  /** Sombra de la ladera derecha: [desplazamiento x, fracción de altura] de abajo arriba. */
  shade: Array<[number, number]>;
  /** Cresta iluminada de la ladera izquierda hasta esta fracción de altura (null: sin cresta). */
  ridge: number | null;
  /** Montañas del fondo: cumbre en (x, base - dy) y base de l a r. */
  peaks: Array<{ x: number; dy: number; l: number; r: number }>;
  peakN: number;
  peakTooth: [number, number];
  flag: { pole: number; w: number; h: number };
  /** Aviso "EMPEZAR" sobre la etapa actual: ancho, alto y separación del nodo. */
  bubble: { w: number; h: number; gap: number };
  /** Hay etiquetas a los lados de los nodos (si no, el aviso puede ir al costado). */
  labels: boolean;
  /** Línea de cota de los campamentos: x inicial. */
  contourX: number;
  /** Etiqueta del campamento base: distancia bajo la primera etapa. */
  baseDy: number;
  jitter: number;
  seed: number;
}

export const FULL_SPEC: MountainSpec = {
  width: 740,
  ox: 170,
  ax: 285,
  ay: 120,
  r: 36,
  rSummit: 42,
  summitDy: 40,
  gapTop: 135,
  gap: 84,
  padBottom: 90,
  minHeight: 760,
  amp: [30, 45],
  step: 40,
  tooth: 12,
  toothRnd: 8,
  toothDy: 10,
  jag: 6,
  snow: { h: 200, step: 30, teeth: 8, factor: 0.92, tipDy: -20, tipRnd: 10, baseDy: 14 },
  shade: [
    [40, 1],
    [30, 0.83],
    [16, 0.617],
    [10, 0.426],
    [4, 0.213],
  ],
  ridge: 0.574,
  peaks: [
    { x: 95, dy: 500, l: 0, r: 300 },
    { x: 470, dy: 590, l: 250, r: 640 },
  ],
  peakN: 8,
  peakTooth: [8, 12],
  flag: { pole: 54, w: 33, h: 22 },
  bubble: { w: 112, h: 32, gap: 17 },
  labels: true,
  contourX: 40,
  baseDy: 40,
  jitter: 4,
  seed: 3,
};

export const COMPACT_SPEC: MountainSpec = {
  width: 390,
  ox: 0,
  ax: 195,
  ay: 60,
  r: 22,
  rSummit: 26,
  summitDy: 24,
  gapTop: 44,
  gap: 42,
  padBottom: 40,
  minHeight: 400,
  amp: [18, 32],
  step: 20,
  tooth: 7,
  toothRnd: 5,
  toothDy: 6,
  jag: 3,
  snow: { h: 90, step: 15, teeth: 6, factor: 0.9, tipDy: -10, tipRnd: 0, baseDy: 8 },
  shade: [
    [26, 1],
    [18, 0.773],
    [10, 0.5],
    [4, 0.227],
  ],
  ridge: null,
  peaks: [
    { x: 70, dy: 240, l: 0, r: 200 },
    { x: 320, dy: 280, l: 190, r: 420 },
  ],
  peakN: 6,
  peakTooth: [5, 8],
  flag: { pole: 38, w: 25, h: 15 },
  bubble: { w: 96, h: 29, gap: 9 },
  labels: false,
  contourX: 8,
  baseDy: 30,
  jitter: 2,
  seed: 9,
};

export interface MountainNode {
  /** Centro en coordenadas del lienzo. */
  x: number;
  y: number;
  r: number;
  /** La etiqueta va a la izquierda del nodo. */
  left: boolean;
  summit: boolean;
  /** Aviso "EMPEZAR": encima (desplazado dx para no tapar el nodo siguiente ni la bandera) o al costado. */
  bubble: { side: 'top' | 'left' | 'right'; dx: number };
}

export interface MountainCamp {
  campIndex: number;
  /** Altura de su etiqueta: el límite inferior del campamento. */
  y: number;
  first: number;
  last: number;
}

export interface MountainGeometry {
  width: number;
  height: number;
  ox: number;
  back: string[];
  front: string;
  shade: string;
  ridge: string | null;
  snow: string;
  flagPole: string;
  flag: string;
  trailDone: string;
  trailTodo: string;
  nodes: MountainNode[];
  camps: MountainCamp[];
  /** Líneas de cota entre campamentos (path). */
  contours: string;
}

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const pt = (x: number, y: number) => `${x.toFixed(1)},${y.toFixed(1)}`;

/** Curva suave (Catmull-Rom) que pasa por los puntos a..b. */
function trail(points: Array<[number, number]>, a: number, b: number): string {
  if (points.length === 0 || a >= points.length) return '';
  let d = `M${points[a][0].toFixed(1)} ${points[a][1].toFixed(1)}`;
  for (let q = a; q < b; q++) {
    const p0 = points[Math.max(q - 1, 0)];
    const p1 = points[q];
    const p2 = points[q + 1];
    const p3 = points[Math.min(q + 2, points.length - 1)];
    d +=
      `C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ` +
      `${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ` +
      `${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

/** Dónde va el aviso "EMPEZAR" de la etapa i para que no choque con nada. */
function placeBubble(spec: MountainSpec, points: Array<[number, number]>, i: number, r: number): MountainNode['bubble'] {
  const { w, h, gap } = spec.bubble;
  const [cx, cy] = points[i];
  const margin = 8;
  const maxShift = w / 2 - 12;
  let dx = 0;
  if (i === points.length - 1) {
    // En la cumbre el mástil y la bandera quedan justo encima: el aviso va a su izquierda.
    dx = -(w / 2 + margin);
  } else {
    const [nx, ny] = points[i + 1];
    const nr = i + 1 === points.length - 1 ? spec.rSummit : spec.r;
    const bottom = cy - r - 3 - gap;
    const top = bottom - h;
    if (top < ny + nr + 6 && bottom > ny - nr - 3) {
      dx = nx >= cx ? Math.min(0, nx - nr - margin - (cx + w / 2)) : Math.max(0, nx + nr + margin - (cx - w / 2));
      if (Math.abs(dx) > maxShift) {
        // No cabe encima: sin etiquetas, al costado contrario al nodo siguiente.
        if (!spec.labels) return { side: nx >= cx ? 'left' : 'right', dx: 0 };
        dx = Math.sign(dx) * maxShift;
      }
    }
  }
  // Sin salirse del lienzo.
  const x = spec.ox + cx + dx;
  if (x - w / 2 < 4) dx += 4 - (x - w / 2);
  if (x + w / 2 > spec.width - 4) dx -= x + w / 2 - (spec.width - 4);
  return { side: 'top', dx: Math.round(dx) };
}

/**
 * @param campSizes número de etapas de cada campamento, en orden.
 * @param current índice (en la lista plana) de la etapa actual; -1 si están todas hechas.
 */
export function buildMountain(spec: MountainSpec, campSizes: number[], current: number): MountainGeometry {
  const n = campSizes.reduce((a, b) => a + b, 0);
  const { ax: AX, ay: AY, ox } = spec;
  const summitY = AY + spec.summitDy;

  // Alturas de las etapas, de abajo (0) arriba (n-1).
  const ys: number[] = new Array(n);
  let MH = spec.minHeight;
  if (n === 1) {
    ys[0] = summitY;
  } else if (n > 1) {
    const span = spec.gapTop + (n - 2) * spec.gap;
    const natural = summitY + span + spec.padBottom;
    const k = natural < spec.minHeight ? (spec.minHeight - spec.padBottom - summitY) / span : 1;
    ys[n - 1] = summitY;
    ys[n - 2] = summitY + spec.gapTop * k;
    for (let i = n - 3; i >= 0; i--) ys[i] = ys[i + 1] + spec.gap * k;
    MH = Math.max(spec.minHeight, ys[0] + spec.padBottom);
  }
  const height = MH;
  const H = MH - AY;
  const hw = (y: number) => AX * Math.pow(Math.max(0, (y - AY) / H), 0.8);
  const rnd = rng(spec.seed);

  // Silueta con los bordes en sierra.
  const left: Array<[number, number]> = [];
  const right: Array<[number, number]> = [];
  const teeth = Math.ceil(H / spec.step) - 1;
  for (let i = 0; i <= teeth; i++) {
    const y = MH - i * spec.step;
    const tooth = i % 2 === 1;
    left.push([AX - hw(y) + (tooth ? spec.tooth + rnd() * spec.toothRnd : -rnd() * spec.jag), y + (tooth ? spec.toothDy : 0)]);
    right.push([AX + hw(y) - (tooth ? spec.tooth + rnd() * spec.toothRnd : -rnd() * spec.jag), y + (tooth ? spec.toothDy : 0)]);
  }
  const rightDown = right.slice().reverse();
  const front = [...left.map(([x, y]) => pt(x, y)), pt(AX, AY), ...rightDown.map(([x, y]) => pt(x, y))].join(' ');
  const shade = [pt(AX, AY), ...rightDown.map(([x, y]) => pt(x, y)), ...spec.shade.map(([dx, f]) => pt(AX + dx, AY + f * H))].join(' ');
  const ridge =
    spec.ridge === null
      ? null
      : [
          pt(AX, AY),
          ...left
            .slice()
            .reverse()
            .filter(([, y]) => y <= AY + (spec.ridge as number) * H)
            .map(([x, y]) => pt(x, y)),
        ].join(' ');

  // Nieve en la cumbre (más corta si la montaña es baja).
  const sn = spec.snow;
  const sh = Math.min(sn.h, H * 0.3);
  const snowPts = [pt(AX, AY)];
  for (let y = AY + sn.step; y <= AY + sh; y += sn.step) snowPts.push(pt(AX - hw(y) * sn.factor, y));
  const capW = hw(AY + sh + 10) * sn.factor;
  for (let k = 0; k <= sn.teeth; k++) {
    snowPts.push(pt(AX - capW + (2 * capW * k) / sn.teeth, k % 2 ? AY + sh + sn.tipDy + rnd() * sn.tipRnd : AY + sh + sn.baseDy));
  }
  for (let y = AY + sh; y > AY; y -= sn.step) snowPts.push(pt(AX + hw(y) * sn.factor, y));

  // Montañas del fondo, siempre más bajas que la principal.
  const back = spec.peaks.map(({ x: px, dy, l, r }) => {
    const py = Math.max(MH - dy, AY + H * 0.32);
    const [tx, ty] = spec.peakTooth;
    const pts = [pt(l, MH)];
    for (let j = 1; j < spec.peakN; j++) {
      const f = j / spec.peakN;
      pts.push(pt(l + (px - l) * f + (j % 2 ? tx : 0), MH + (py - MH) * f + (j % 2 ? ty : 0)));
    }
    pts.push(pt(px, py));
    for (let j = 1; j < spec.peakN; j++) {
      const f = j / spec.peakN;
      pts.push(pt(px + (r - px) * f - (j % 2 ? tx : 0), py + (MH - py) * f + (j % 2 ? ty : 0)));
    }
    pts.push(pt(r, MH));
    return pts.join(' ');
  });

  // Etapas en zigzag, cada vez más cerca del eje al subir.
  const jit = rng(spec.seed + 17);
  const points: Array<[number, number]> = ys.map((y, i) => {
    if (i === n - 1) return [AX, y];
    const ratio = (y - AY) / H;
    const amp = spec.amp[0] + spec.amp[1] * ratio;
    const side = i % 2 === 0 ? -1 : 1;
    return [AX + side * amp + (jit() - 0.5) * 2 * spec.jitter, y];
  });
  const nodes: MountainNode[] = points.map(([x, y], i) => {
    const summit = i === n - 1;
    const r = summit ? spec.rSummit : spec.r;
    return { x: ox + x, y, r, left: !summit && x < AX, summit, bubble: placeBubble(spec, points, i, r) };
  });

  const cur = current < 0 ? n - 1 : current;
  const trailDone = trail(points, 0, cur);
  const trailTodo = current < 0 ? '' : trail(points, cur, n - 1);

  // Campamentos: su etiqueta va en el límite inferior (entre su primera etapa y la anterior).
  const camps: MountainCamp[] = [];
  let index = 0;
  campSizes.forEach((size, campIndex) => {
    if (size === 0) return;
    const first = index;
    const last = index + size - 1;
    const y = first === 0 ? ys[0] + spec.baseDy : (ys[first - 1] + ys[first]) / 2;
    camps.push({ campIndex, y, first, last });
    index += size;
  });
  const contours = camps
    .filter((c) => c.first > 0)
    .map((c) => `M${spec.contourX} ${c.y.toFixed(1)}H${(ox + AX + hw(c.y) - 4).toFixed(1)}`)
    .join('');

  const { pole, w, h } = spec.flag;
  return {
    width: spec.width,
    height,
    ox,
    back,
    front,
    shade,
    ridge,
    snow: snowPts.join(' '),
    flagPole: `M${AX} ${AY - 2}V${AY - 2 - pole}`,
    flag: [pt(AX, AY - 2 - pole), pt(AX + w, AY - 2 - pole + h * 0.45), pt(AX, AY - 2 - pole + h)].join(' '),
    trailDone,
    trailTodo,
    nodes,
    camps,
    contours,
  };
}
