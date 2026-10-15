// Fondo decorativo de cada tema, fijo detrás del contenido.
//
// Black Blizzard: haces de luz, rayas diagonales de ventisca, copos y una sierra de montañas.
// Neón: paredes de ladrillo, rótulos que parpadean y lluvia.
//
// Cada capa animada es un elemento propio que solo se desplaza con `transform` (la GPU lo
// compone sin volver a pintar). Los dibujos son mosaicos (`<pattern>`) y se desplazan
// exactamente un número entero de mosaicos por ciclo, así que el bucle no tiene costuras.
// Con `prefers-reduced-motion` todo queda quieto (ver styles/app.css).
import { useMemo, type ReactNode } from 'react';
import { useSettings } from '../state/settings';

/** Generador pseudoaleatorio determinista (el mismo de las maquetas). */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const f1 = (n: number) => n.toFixed(1);

/** Grupos de 3 a 5 rayas paralelas en diagonal, repartidos por un mosaico. */
function hatchTile(w: number, h: number, groups: number, seed: number): string {
  const rnd = rng(seed);
  let d = '';
  for (let g = 0; g < groups; g++) {
    const gx = rnd() * w;
    const gy = rnd() * h;
    const ang = ((rnd() < 0.5 ? -1 : 1) * (28 + rnd() * 30) * Math.PI) / 180;
    const len = 40 + rnd() * 60;
    const count = 3 + Math.floor(rnd() * 3);
    for (let m = 0; m < count; m++) {
      const x = gx - Math.sin(ang) * 7 * m;
      const y = gy + Math.cos(ang) * 7 * m;
      // Se dibuja también desplazado un mosaico para que las rayas que cruzan el borde sigan.
      for (const ox of [-w, 0, w]) {
        for (const oy of [-h, 0, h]) {
          d += `M${f1(x + ox)} ${f1(y + oy)}l${f1(Math.cos(ang) * len)} ${f1(Math.sin(ang) * len)}`;
        }
      }
    }
  }
  return d;
}

function flakeTile(w: number, h: number, count: number, seed: number): string {
  const rnd = rng(seed);
  let d = '';
  for (let i = 0; i < count; i++) {
    const x = Math.round(rnd() * (w - 4));
    const y = Math.round(rnd() * (h - 4));
    const s = 2 + Math.floor(rnd() * 2);
    d += `M${x} ${y}h${s}v${s}h-${s}z`;
  }
  return d;
}

function rainTile(w: number, h: number, count: number, seed: number): string {
  const rnd = rng(seed);
  let d = '';
  for (let i = 0; i < count; i++) {
    const x = rnd() * w;
    const y = rnd() * h;
    const l = 20 + rnd() * 40;
    for (const [ox, oy] of [
      [0, 0],
      [w, 0],
      [0, -h],
      [w, -h],
    ]) {
      d += `M${f1(x + ox)} ${f1(y + oy)}l${f1(-l * 0.25)} ${f1(l)}`;
    }
  }
  return d;
}

/** Sierra de montañas para el pie de la pantalla (viewBox 1440×240). */
function ridgePoints(seed: number): string {
  const rnd = rng(seed);
  const pts: string[] = ['0,240'];
  let x = 0;
  let up = true;
  while (x < 1440) {
    const y = up ? 70 + rnd() * 90 : 120 + rnd() * 80;
    pts.push(`${f1(x)},${f1(y)}`);
    x += 40 + rnd() * 90;
    up = !up;
  }
  pts.push('1440,150', '1440,240');
  return pts.join(' ');
}

function Pattern({ id, w, h, children }: { id: string; w: number; h: number; children: ReactNode }) {
  return (
    <svg className="app-bd-fill" aria-hidden="true" focusable="false">
      <defs>
        <pattern id={id} width={w} height={h} patternUnits="userSpaceOnUse">
          {children}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

function BlizzardBackdrop() {
  const art = useMemo(
    () => ({
      hatch: hatchTile(720, 540, 9, 3),
      flakes: flakeTile(400, 400, 16, 7),
      flakesBig: flakeTile(560, 560, 7, 11),
      ridge: ridgePoints(5),
    }),
    [],
  );
  return (
    <div className="app-backdrop app-backdrop--blizzard" aria-hidden="true">
      <svg className="app-bd-beams" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMin slice" focusable="false">
        <polygon points="1120,0 1230,0 760,900 560,900" />
        <polygon points="1300,0 1350,0 1060,900 960,900" />
      </svg>
      <div className="app-bd-layer app-bd-hatch">
        <Pattern id="app-bd-hatch" w={720} h={540}>
          <path d={art.hatch} className="app-bd-hatch-path" />
        </Pattern>
      </div>
      <div className="app-bd-layer app-bd-snow">
        <Pattern id="app-bd-snow" w={400} h={400}>
          <path d={art.flakes} className="app-bd-flake" />
        </Pattern>
      </div>
      <div className="app-bd-layer app-bd-snow-near">
        <Pattern id="app-bd-snow-near" w={560} h={560}>
          <path d={art.flakesBig} className="app-bd-flake app-bd-flake--near" />
        </Pattern>
      </div>
      <svg className="app-bd-ridge" viewBox="0 0 1440 240" preserveAspectRatio="xMidYMax slice" focusable="false">
        <polygon points={art.ridge} />
      </svg>
    </div>
  );
}

function NeonBackdrop() {
  const rain = useMemo(() => rainTile(300, 300, 9, 5), []);
  return (
    <div className="app-backdrop app-backdrop--neon" aria-hidden="true">
      <div className="app-bd-wall app-bd-wall--left">
        <span className="app-bd-bricks" />
      </div>
      <div className="app-bd-wall app-bd-wall--right">
        <span className="app-bd-bricks" />
      </div>
      <svg className="app-bd-sign app-bd-sign--box" viewBox="0 0 126 50" focusable="false">
        <rect x="3" y="3" width="120" height="44" rx="10" />
      </svg>
      <svg className="app-bd-sign app-bd-sign--bars" viewBox="0 0 106 32" focusable="false">
        <path d="M3 3h100M3 29h64" />
      </svg>
      <svg className="app-bd-sign app-bd-sign--arrow" viewBox="0 0 60 40" focusable="false">
        <path d="M4 20h44M36 6l14 14-14 14" />
      </svg>
      <div className="app-bd-layer app-bd-rain">
        <Pattern id="app-bd-rain" w={300} h={300}>
          <path d={rain} className="app-bd-rain-path" />
        </Pattern>
      </div>
    </div>
  );
}

export function Backdrop() {
  const { settings } = useSettings();
  return settings.theme === 'neon' ? <NeonBackdrop /> : <BlizzardBackdrop />;
}
