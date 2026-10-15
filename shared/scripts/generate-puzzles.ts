// Genera candidatos a puzzle a partir de las líneas de un curso, al estilo de Lichess:
// se buscan errores verosímiles del RIVAL del alumno y la refutación que debe encontrar
// el alumno. Los candidatos se guardan en JSON para curarlos a mano después.
//
//   npx tsx scripts/generate-puzzles.ts --course kings-indian
//   npx tsx scripts/generate-puzzles.ts --course english --line english-main --out /tmp/eng.json
//   npx tsx scripts/generate-puzzles.ts --course dragon --depth 16 --confirm-depth 20
//   npx tsx scripts/generate-puzzles.ts --course kings-indian --verify --depth 20
//   npx tsx scripts/generate-puzzles.ts --course english --traps
//
// Cómo funciona:
//  1. Recorre las posiciones de las líneas (playLine) en las que mueve el rival. Las líneas
//     `practice: false` (errores del propio alumno) se saltan salvo con --include-warnings.
//  2. En cada posición prueba las jugadas legales razonables del rival. Se descartan los
//     disparates (pierden 2 peones o más en el balance estático: dejan una pieza colgada,
//     no recapturan, dan una pieza por un peón) y las jugadas poco naturales (paseos del
//     rey, maniobras raras que ni a profundidad 4 parecen buenas). Un filtro rápido
//     (--quick-depth) elige las sospechosas y la profundidad de cribado (--depth) confirma
//     el error: pierde al menos --min-loss cp frente a la mejor jugada, y antes del error
//     el alumno no estaba ya ganando (--max-before).
//  3. Tras el error le toca al alumno. La posición es candidata si su mejor jugada es clara
//     (al menos --min-gap cp mejor que la segunda, o mate) y deja una ventaja decisiva
//     (al menos --min-adv cp, o mate).
//  4. La solución sigue la variante principal: hasta --max-moves jugadas del alumno, cada
//     una única por el mismo margen, con las respuestas del rival de la PV. Se corta en
//     cuanto la ganancia de material es estable o hay mate, y termina siempre con una
//     jugada del alumno (longitud impar).
//  5. Guarda los candidatos en JSON (--out) con la evaluación, la PV y la línea de origen.
//     Con --confirm-depth N se vuelve a comprobar la primera jugada de cada candidato a
//     profundidad N (lento: úsalo solo con pocos candidatos).
//
// Con --traps se buscan trampas para la etapa «Trampas»: los mismos criterios con umbrales
// más bajos (--min-loss 150, --min-adv 150) y los candidatos ordenados de más a menos
// tentadores (el error parece bueno a poca profundidad). Cada candidato trae `fullLine`,
// las jugadas desde el inicio hasta la refutación, listas para un `LineDef`.
//
// Con --verify no se genera nada: se comprueban los puzzles ya curados del curso (los de
// src/content/puzzles). Cada jugada del alumno debe ser la mejor y única a --depth, con
// ventaja decisiva, y la solución debe terminar con una jugada del alumno.
//
// Opciones (por defecto): --course <id> (todos), --line <id>, --depth 16, --quick-depth 10,
// --confirm-depth 0, --min-loss 200, --min-gap 150, --min-adv 200, --max-before 150,
// --max-moves 3, --hash 64, --out <archivo> (un curso) o --out-dir <carpeta>
// (por defecto <tmp>/chessblizzard-puzzles/<curso>.json, o <curso>-traps.json con
// --traps), --include-warnings, --traps, --verify.
//
// Stockfish usa un solo hilo: lanza un único proceso a la vez.

import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { Chess, type Move, type Square } from 'chess.js';
import { courses, playLine, playMoves, positionKey, resolvePosition, type Color, type Course } from '../src';
import { Engine, fmt, uci, type PvLine } from './engine';

const args = process.argv.slice(2);
const opt = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const flag = (name: string) => args.includes(`--${name}`);
const num = (name: string, fallback: number) => {
  const v = opt(name);
  if (v === undefined) return fallback;
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error(`--${name} debe ser un número`);
  return n;
};

const ONLY_COURSE = opt('course');
const ONLY_LINE = opt('line');
const DEPTH = num('depth', 16);
const QUICK_DEPTH = num('quick-depth', 10);
const SHALLOW_DEPTH = 4;
const CONFIRM_DEPTH = num('confirm-depth', 0);
const TRAPS = flag('traps');
const MIN_LOSS = num('min-loss', TRAPS ? 150 : 200);
const MIN_GAP = num('min-gap', 150);
const MIN_ADV = num('min-adv', TRAPS ? 150 : 200);
const MAX_BEFORE = num('max-before', 150);
const MAX_MOVES = num('max-moves', 3);
const HASH = num('hash', 64);
const VERIFY = flag('verify');
const INCLUDE_WARNINGS = flag('include-warnings');
const OUT_FILE = opt('out');
const OUT_DIR = opt('out-dir') ?? join(tmpdir(), 'chessblizzard-puzzles');

/** Valor de las piezas para el intercambio estático y el recuento de material. */
const VALUE: Record<string, number> = { p: 100, n: 300, b: 300, r: 500, q: 900, k: 10000 };

// --- Utilidades de ajedrez -------------------------------------------------------------

function playUci(chess: Chess, move: string): Move {
  return chess.move({ from: move.slice(0, 2), to: move.slice(2, 4), promotion: move.length > 4 ? move[4] : undefined });
}

function pvToSan(fen: string, pv: string[]): string[] {
  const chess = new Chess(fen);
  const out: string[] = [];
  for (const move of pv) {
    try {
      out.push(playUci(chess, move).san);
    } catch {
      break;
    }
  }
  return out;
}

/** ["d4", "Nf6", "c4"] -> "1.d4 Nf6 2.c4". */
function numbered(sans: string[]): string {
  const chess = new Chess();
  const parts: string[] = [];
  for (const san of sans) {
    const n = chess.moveNumber();
    if (chess.turn() === 'w') parts.push(`${n}.${san}`);
    else parts.push(parts.length ? san : `${n}...${san}`);
    chess.move(san);
  }
  return parts.join(' ');
}

/**
 * Intercambio estático (SEE): lo que gana el bando que mueve si empieza a capturar en
 * `square` con la pieza menos valiosa y sigue mientras le convenga (0 si no le conviene).
 * Usa jugadas legales, así que respeta las clavadas absolutas.
 */
function see(chess: Chess, square: Square): number {
  const target = chess.get(square);
  if (!target) return 0;
  const captures = chess.moves({ verbose: true }).filter((m) => m.to === square);
  if (!captures.length) return 0;
  captures.sort((a, b) => VALUE[a.piece] - VALUE[b.piece]);
  const m = captures[0];
  chess.move({ from: m.from, to: m.to, promotion: m.promotion });
  const gain = VALUE[target.type] - see(chess, square);
  chess.undo();
  return Math.max(0, gain);
}

/** Material desde el punto de vista de `color` (sin contar reyes). */
function material(chess: Chess, color: Color): number {
  let sum = 0;
  for (const row of chess.board()) {
    for (const sq of row) if (sq && sq.type !== 'k') sum += (sq.color === color ? 1 : -1) * VALUE[sq.type];
  }
  return sum;
}

/** Valor estático para el bando que mueve: material más la mejor captura simple (SEE). */
function staticValue(chess: Chess): number {
  let best = 0;
  const targets = new Set(chess.moves({ verbose: true }).filter((m) => m.captured).map((m) => m.to));
  for (const sq of targets) best = Math.max(best, see(chess, sq as Square));
  return material(chess, chess.turn() as Color) + best;
}

/**
 * Disparate: la jugada pierde al menos 2 peones en el balance estático, sin táctica de por
 * medio: deja colgada la pieza movida u otra ya atacada, no recaptura o da una pieza por un
 * peón. `before` es staticValue() de la posición antes de la jugada.
 */
function isNonsense(chess: Chess, m: Move, before: number): boolean {
  chess.move({ from: m.from, to: m.to, promotion: m.promotion });
  const after = staticValue(chess); // para el bando contrario
  chess.undo();
  return after + before >= 200;
}

/**
 * Jugada natural: la que un jugador de club consideraría. Capturas, enroques, salidas de
 * jaque, desarrollos de las piezas menores, jugadas de peón y cualquier jugada que parezca
 * buena a poca profundidad (entre las 8 primeras). Quedan fuera paseos del rey, retiradas
 * sin sentido y maniobras raras de torre o dama que ni a simple vista parecen buenas.
 */
function isNatural(m: Move, shallowRank: number, inCheck: boolean): boolean {
  if (shallowRank <= 8 || inCheck) return true;
  if (m.captured || m.flags.includes('k') || m.flags.includes('q')) return true;
  const home = m.color === 'w' ? '1' : '8';
  if ((m.piece === 'n' || m.piece === 'b') && m.from[1] === home && m.to[1] !== home) return true;
  return m.piece === 'p';
}

/** Piezas rivales atacadas por la pieza de `square` que valen más que ella o están indefensas. */
function forkTargets(chess: Chess, square: Square): string[] {
  const piece = chess.get(square);
  if (!piece) return [];
  const enemy: Color = piece.color === 'w' ? 'b' : 'w';
  const targets: string[] = [];
  for (const row of chess.board()) {
    for (const sq of row) {
      if (!sq || sq.color !== enemy) continue;
      if (!chess.attackers(sq.square, piece.color).includes(square)) continue;
      const undefended = chess.attackers(sq.square, enemy).length === 0;
      if (sq.type === 'k' || VALUE[sq.type] > VALUE[piece.type] || undefended) targets.push(sq.type + sq.square);
    }
  }
  return targets;
}

const isMate = (cp: number) => Math.abs(cp) > 90000;
const gapOf = (lines: PvLine[]) => (lines.length > 1 ? lines[0].cp - lines[1].cp : Infinity);

// --- Generación -------------------------------------------------------------------------

interface Spot {
  key: string;
  fen: string;
  /** Primera línea que pasa por la posición y todas las que pasan. */
  line: string;
  lines: string[];
  /** Jugadas desde el inicio hasta la posición. */
  sans: string[];
}

interface Step {
  fen: string;
  move: string;
  cp: number;
  second?: string;
  secondCp?: number;
  gap: number;
}

interface Candidate {
  id: string;
  line: string;
  lines: string[];
  /** Jugadas desde el inicio incluido el error del rival (formato de Puzzle.moves). */
  moves: string;
  error: string;
  /** Mejor jugada del rival en lugar del error, y su evaluación (cp para el rival). */
  best: string;
  evalBefore: number;
  /** Centipeones que pierde el error a la profundidad de cribado. */
  loss: number;
  /** Pérdida vista a profundidad 4: si es pequeña, el error es tentador. */
  shallowLoss: number;
  /** Puesto del error entre las jugadas razonables del rival a profundidad 4 y en el filtro rápido (1 = la que mejor parece). */
  shallowRank: number;
  quickRank: number;
  /** Jugadas razonables del rival en esa posición. */
  options: number;
  /** Posición del puzzle (mueve el alumno). */
  fen: string;
  /** Evaluación para el alumno tras el error. */
  eval: number;
  second?: { san: string; cp: number };
  gap: number;
  /** Solución en SAN separada por espacios (formato de Puzzle.solution). */
  solution: string;
  /** Jugadas numeradas desde el inicio hasta el final de la solución (para una trampa). */
  fullLine: string;
  steps: Step[];
  /** Variante principal completa (SAN) desde la posición del puzzle. */
  pv: string[];
  tags: string[];
  ratingGuess: number;
  confirmed?: { depth: number; ok: boolean; best: string; cp: number; gap: number };
}

function collectSpots(course: Course): Spot[] {
  const rival: Color = course.side === 'w' ? 'b' : 'w';
  const byKey = new Map<string, Spot>();
  for (const line of course.lines) {
    if (ONLY_LINE && line.id !== ONLY_LINE) continue;
    if (line.practice === false && !INCLUDE_WARNINGS) continue;
    const plies = playLine(line);
    if (!plies.length) continue;
    const fens = [...plies.map((p) => p.fenBefore), plies[plies.length - 1].fenAfter];
    fens.forEach((fen, i) => {
      if (fen.split(' ')[1] !== rival) return;
      const key = positionKey(fen);
      const known = byKey.get(key);
      if (known) {
        if (!known.lines.includes(line.id)) known.lines.push(line.id);
        return;
      }
      byKey.set(key, { key, fen, line: line.id, lines: [line.id], sans: plies.slice(0, i).map((p) => p.san) });
    });
  }
  return [...byKey.values()];
}

/** Sigue la PV mientras cada jugada del alumno sea única y la ventaja decisiva. */
async function buildSolution(engine: Engine, fen: string, first: PvLine[], student: Color) {
  const chess = new Chess(fen);
  const start = material(chess, student);
  const moves: string[] = [];
  const steps: Step[] = [];
  let lines = first;
  for (let k = 0; k < MAX_MOVES; k++) {
    if (k > 0) lines = await engine.analyse(chess.fen(), { depth: DEPTH, multipv: 2 });
    const [l1, l2] = lines;
    if (!l1 || l1.cp < MIN_ADV || gapOf(lines) < MIN_GAP) {
      if (k > 0) moves.pop(); // quita la respuesta del rival: la solución acaba en el alumno
      break;
    }
    const before = chess.fen();
    const mv = playUci(chess, l1.pv[0]);
    moves.push(mv.san);
    steps.push({
      fen: before,
      move: mv.san,
      cp: l1.cp,
      second: l2 ? pvToSan(before, l2.pv.slice(0, 1))[0] : undefined,
      secondCp: l2?.cp,
      gap: gapOf(lines),
    });
    if (chess.isGameOver() || k === MAX_MOVES - 1) break;
    const reply = l1.pv[1];
    if (!reply) break;
    const rm = playUci(chess, reply);
    // Material ya ganado y estable tras la mejor respuesta: el puzzle termina aquí.
    if (material(chess, student) - start >= 200) break;
    moves.push(rm.san);
  }
  return { moves, steps };
}

function tagsFor(fen: string, solution: string[], firstLines: PvLine[]): { tags: string[]; rating: number } {
  const chess = new Chess(fen);
  const tags: string[] = [];
  const first = chess.move(solution[0]);
  const capturedValue = first.captured ? VALUE[first.captured] : 0;
  const exposed = see(chess, first.to as Square);
  if (first.san.includes('+')) tags.push('check');
  if (first.captured) tags.push('capture');
  if (first.promotion) tags.push('promotion');
  if (!first.captured && !first.san.includes('+')) tags.push('quiet');
  if (exposed - capturedValue >= 200) tags.push('sacrifice');
  if (forkTargets(chess, first.to as Square).length >= 2) tags.push('fork');
  for (const san of solution.slice(1)) chess.move(san);
  if (chess.isCheckmate() || isMate(firstLines[0].cp)) tags.push('mate');
  const simple = first.captured && capturedValue - exposed >= 200 && solution.length === 1;
  if (simple) tags.push('simple');
  const studentMoves = (solution.length + 1) / 2;
  let rating = 1000 + 150 * (studentMoves - 1);
  if (tags.includes('quiet')) rating += 250;
  if (tags.includes('sacrifice')) rating += 250;
  if (simple) rating -= 200;
  return { tags, rating };
}

async function generate(engine: Engine, course: Course) {
  const student = course.side;
  const spots = collectSpots(course);
  const out = OUT_FILE ?? join(OUT_DIR, `${course.id}${TRAPS ? '-traps' : ''}.json`);
  mkdirSync(dirname(out), { recursive: true });
  const candidates: Candidate[] = [];
  const seen = new Set<string>();
  const t0 = Date.now();
  console.log(`\n=== ${course.name.es}: ${spots.length} posiciones con el rival al turno · profundidad ${DEPTH} ===`);

  const save = (done: number) =>
    writeFileSync(
      out,
      JSON.stringify(
        {
          course: course.id,
          generatedAt: new Date().toISOString(),
          options: { depth: DEPTH, quickDepth: QUICK_DEPTH, confirmDepth: CONFIRM_DEPTH, minLoss: MIN_LOSS, minGap: MIN_GAP, minAdv: MIN_ADV, maxBefore: MAX_BEFORE, maxMoves: MAX_MOVES, line: ONLY_LINE ?? null },
          positions: spots.length,
          scanned: done,
          // Con --traps, primero los errores más tentadores (parecen buenos a poca profundidad).
          candidates: TRAPS ? [...candidates].sort((a, b) => a.shallowLoss - b.shallowLoss || a.shallowRank - b.shallowRank) : candidates,
        },
        null,
        2,
      ),
    );

  for (const [si, spot] of spots.entries()) {
    const chess = new Chess(spot.fen);
    const where = `${spot.line} ${numbered(spot.sans).split(' ').slice(-2).join(' ') || '(inicio)'}`;
    const [best] = await engine.analyse(spot.fen, { depth: DEPTH, multipv: 1 });
    if (!best) continue;
    const bestSan = pvToSan(spot.fen, best.pv.slice(0, 1))[0];
    // El alumno ya estaba ganando: un error aquí no crea el puzzle.
    if (best.cp < -MAX_BEFORE) {
      console.log(`[${si + 1}/${spots.length}] ${where}: el rival ya está perdido (${fmt(best.cp)}), se salta`);
      continue;
    }

    // 1) Fuera los disparates. 2) Vistazo a profundidad 4 para ordenar las jugadas como las
    // vería un humano. 3) Solo las naturales pasan al filtro rápido (--quick-depth).
    const before = staticValue(chess);
    const inCheck = chess.inCheck();
    const quick: Array<{ move: Move; fen: string; cp: number; shallow: number }> = [];
    for (const m of chess.moves({ verbose: true })) {
      if (isNonsense(chess, m, before)) continue;
      chess.move({ from: m.from, to: m.to, promotion: m.promotion });
      const fen = chess.fen();
      const over = chess.isGameOver();
      chess.undo();
      if (over) continue;
      const [sh] = await engine.analyse(fen, { depth: SHALLOW_DEPTH, multipv: 1 });
      if (sh) quick.push({ move: m, fen, cp: NaN, shallow: sh.cp });
    }
    // Puesto de cada jugada para el rival (cp del alumno más bajo = mejor para el rival).
    const rankedShallow = [...quick].sort((a, b) => a.shallow - b.shallow);
    const natural = quick.filter((q) => isNatural(q.move, rankedShallow.indexOf(q) + 1, inCheck));
    for (const q of natural) {
      const [r] = await engine.analyse(q.fen, { depth: QUICK_DEPTH, multipv: 1 });
      q.cp = r ? r.cp : NaN;
    }
    const ranked = natural.filter((q) => !Number.isNaN(q.cp)).sort((a, b) => a.cp - b.cp);
    const suspects = ranked.filter((q) => best.cp + q.cp >= MIN_LOSS * 0.6 && q.cp >= MIN_ADV * 0.6);
    let found = 0;

    for (const s of suspects) {
      const key = positionKey(s.fen);
      if (seen.has(key)) continue;
      seen.add(key);
      const lines = await engine.analyse(s.fen, { depth: DEPTH, multipv: 2 });
      if (!lines.length) continue;
      const loss = best.cp + lines[0].cp;
      if (loss < MIN_LOSS || lines[0].cp < MIN_ADV || gapOf(lines) < MIN_GAP) continue;

      const { moves, steps } = await buildSolution(engine, s.fen, lines, student);
      if (!moves.length || moves.length % 2 === 0) continue;
      const { tags, rating } = tagsFor(s.fen, moves, lines);
      const cand: Candidate = {
        id: `${course.id}-c${candidates.length + 1}`,
        line: spot.line,
        lines: spot.lines,
        moves: numbered([...spot.sans, s.move.san]),
        error: s.move.san,
        best: bestSan,
        evalBefore: best.cp,
        loss,
        shallowLoss: best.cp + s.shallow,
        shallowRank: rankedShallow.indexOf(s) + 1,
        quickRank: ranked.indexOf(s) + 1,
        options: quick.length,
        fen: s.fen,
        eval: lines[0].cp,
        second: lines[1] ? { san: pvToSan(s.fen, lines[1].pv.slice(0, 1))[0], cp: lines[1].cp } : undefined,
        gap: gapOf(lines),
        solution: moves.join(' '),
        fullLine: numbered([...spot.sans, s.move.san, ...moves]),
        steps,
        pv: pvToSan(s.fen, lines[0].pv),
        tags,
        ratingGuess: rating,
      };
      // Error tentador: a profundidad 4 todavía parece una jugada normal.
      if (cand.shallowLoss < 100) cand.tags.push('tempting');
      if (CONFIRM_DEPTH > 0) {
        const deep = await engine.analyse(s.fen, { depth: CONFIRM_DEPTH, multipv: 2 });
        const deepBest = pvToSan(s.fen, deep[0].pv.slice(0, 1))[0];
        cand.confirmed = {
          depth: CONFIRM_DEPTH,
          ok: deepBest === steps[0].move && gapOf(deep) >= MIN_GAP && deep[0].cp >= MIN_ADV,
          best: deepBest,
          cp: deep[0].cp,
          gap: gapOf(deep),
        };
      }
      candidates.push(cand);
      found++;
      console.log(
        `   + ${cand.id}: ${cand.moves.split(' ').slice(-2).join(' ')}? (pierde ${loss}, mejor ${bestSan}) -> ${cand.solution}  ${fmt(cand.eval)}  hueco ${Number.isFinite(cand.gap) ? cand.gap : '∞'}  [${tags.join(', ')}]${cand.confirmed ? ` d${CONFIRM_DEPTH}: ${cand.confirmed.ok ? 'ok' : 'NO'}` : ''}`,
      );
    }
    const mins = ((Date.now() - t0) / 60000).toFixed(1);
    console.log(`[${si + 1}/${spots.length}] ${where}: ${quick.length} razonables, ${natural.length} naturales, ${suspects.length} sospechosas, ${found} candidato(s) · ${mins} min`);
    save(si + 1);
  }
  save(spots.length);
  console.log(`\n${candidates.length} candidato(s) guardados en ${out}`);
}

// --- Verificación de los puzzles curados -------------------------------------------------

async function verify(engine: Engine, course: Course): Promise<number> {
  console.log(`\n=== Verificación de ${course.puzzles.length} puzzle(s) de ${course.name.es} · profundidad ${DEPTH} ===`);
  let failed = 0;
  for (const p of course.puzzles) {
    const problems: string[] = [];
    const report: string[] = [];
    const fen = resolvePosition(p);
    if (fen.split(' ')[1] !== course.side) problems.push('en la posición no le toca al alumno');
    let plies: ReturnType<typeof playMoves> = [];
    try {
      plies = playMoves(p.solution, fen);
    } catch (err) {
      problems.push((err as Error).message);
    }
    if (plies.length % 2 === 0) problems.push('la solución debe terminar con una jugada del alumno');
    for (const ply of plies) {
      const studentTurn = ply.index % 2 === 0;
      const lines = await engine.analyse(ply.fenBefore, { depth: DEPTH, multipv: studentTurn ? 2 : 1 });
      if (!lines.length) {
        problems.push(`${ply.san}: posición sin jugadas`);
        continue;
      }
      const bestSan = pvToSan(ply.fenBefore, lines[0].pv.slice(0, 1))[0];
      if (studentTurn) {
        const gap = gapOf(lines);
        const secondSan = lines[1] ? pvToSan(ply.fenBefore, lines[1].pv.slice(0, 1))[0] : '-';
        report.push(`  ${ply.san.padEnd(8)} mejor ${bestSan.padEnd(8)} ${fmt(lines[0].cp).padStart(7)}  2.ª ${secondSan.padEnd(8)} ${lines[1] ? fmt(lines[1].cp).padStart(7) : '      -'}  hueco ${Number.isFinite(gap) ? gap : '∞'}`);
        if (lines[0].pv[0] !== uci(ply)) problems.push(`${ply.san}: Stockfish prefiere ${bestSan} (${fmt(lines[0].cp)})`);
        else if (gap < MIN_GAP) problems.push(`${ply.san}: no es única (${secondSan} a ${gap} cp)`);
        if (lines[0].cp < MIN_ADV) problems.push(`${ply.san}: la ventaja no es decisiva (${fmt(lines[0].cp)})`);
      } else {
        const note = lines[0].pv[0] === uci(ply) ? '' : `  (Stockfish prefiere ${bestSan})`;
        report.push(`  ${ply.san.padEnd(8)} respuesta del rival${note}`);
      }
    }
    const ok = problems.length === 0;
    if (!ok) failed++;
    console.log(`\n${p.id} (${p.rating}) ${ok ? 'OK' : 'FALLA'}: ${p.solution}\n${report.join('\n')}`);
    for (const pr of problems) console.log(`  ! ${pr}`);
  }
  console.log(`\n${course.id}: ${course.puzzles.length - failed}/${course.puzzles.length} puzzles correctos`);
  return failed;
}

async function main() {
  const list = courses.filter((c) => !ONLY_COURSE || c.id === ONLY_COURSE);
  if (!list.length) throw new Error(`Curso desconocido: ${ONLY_COURSE}`);
  if (OUT_FILE && list.length > 1) throw new Error('--out solo vale con --course; usa --out-dir para varios cursos');
  const engine = new Engine('single');
  await engine.init({ Threads: 1, Hash: HASH });
  let failed = 0;
  for (const course of list) {
    if (VERIFY) failed += await verify(engine, course);
    else await generate(engine, course);
  }
  engine.quit();
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
