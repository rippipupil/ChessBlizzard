// Revisa con Stockfish que las líneas del curso sean sanas.
//
//   npm run audit -w shared                     # todos los cursos
//   npm run audit -w shared -- --course english # un curso
//   npm run audit -w shared -- --line kid-main  # una línea
//   npm run audit -w shared -- --depth 18
//
// Para cada jugada del alumno compara su evaluación con la mejor jugada del motor.
// También revisa la evaluación al final de cada línea.

import { Chess } from 'chess.js';
import { courses, playLine, type Course, type LineDef } from '../src';
import { Engine, fmt, uci } from './engine';

const args = process.argv.slice(2);
const opt = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const DEPTH = Number(opt('depth') ?? 16);
const ONLY_COURSE = opt('course');
const ONLY_LINE = opt('line');
/** Pérdida máxima tolerada (centipeones) en una jugada del alumno. */
const MAX_LOSS = Number(opt('max-loss') ?? 60);
/** Evaluación mínima (para el alumno) al final de una línea de repertorio. */
const MIN_FINAL = Number(opt('min-final') ?? -80);

interface Issue {
  line: string;
  where: string;
  message: string;
}

async function evalMove(engine: Engine, fen: string, move: string) {
  const [best] = await engine.analyse(fen, { depth: DEPTH, multipv: 1 });
  const [played] = await engine.analyse(fen, { depth: DEPTH, moves: [move] });
  return { best, played };
}

async function auditLine(engine: Engine, course: Course, line: LineDef, issues: Issue[]) {
  const plies = playLine(line);
  const isWarning = line.practice === false;
  const report: string[] = [];

  for (const ply of plies) {
    if (ply.color !== course.side || isWarning) continue;
    const { best, played } = await evalMove(engine, ply.fenBefore, uci(ply));
    const loss = best.cp - played.cp;
    const bestSan = new Chess(ply.fenBefore).move({ from: best.pv[0].slice(0, 2), to: best.pv[0].slice(2, 4), promotion: best.pv[0][4] }).san;
    const flag = loss > MAX_LOSS ? '  <-- revisar' : '';
    report.push(`  ${ply.key.padEnd(12)} ${fmt(played.cp).padStart(7)}  mejor ${bestSan.padEnd(7)} ${fmt(best.cp).padStart(7)}  pérdida ${String(loss).padStart(4)}${flag}`);
    if (loss > MAX_LOSS) {
      issues.push({ line: line.id, where: ply.key, message: `pierde ${loss} cp (Stockfish prefiere ${bestSan} ${fmt(best.cp)})` });
    }
  }

  const last = plies[plies.length - 1];
  const end = new Chess(last.fenAfter);
  const sideToMove = end.turn();
  // En una posición de mate o ahogado el motor no devuelve variante: se evalúa a mano.
  let finalCp: number;
  if (end.isCheckmate()) finalCp = -100000;
  else if (end.isDraw() || end.isStalemate()) finalCp = 0;
  else finalCp = (await engine.analyse(last.fenAfter, { depth: DEPTH }))[0]?.cp ?? 0;
  const forStudent = sideToMove === course.side ? finalCp : -finalCp;
  report.push(`  final: ${fmt(forStudent)} para el alumno`);
  if (isWarning) {
    if (forStudent > -80) issues.push({ line: line.id, where: 'final', message: `el error no se castiga lo suficiente (${fmt(forStudent)})` });
  } else if (forStudent < MIN_FINAL) {
    issues.push({ line: line.id, where: 'final', message: `la línea termina mal para el alumno (${fmt(forStudent)})` });
  }
  console.log(`\n${line.id}${isWarning ? ' (error a evitar)' : ''}\n${report.join('\n')}`);
}

async function main() {
  const engine = new Engine('single');
  await engine.init({ Threads: 1, Hash: 64 });
  const issues: Issue[] = [];

  for (const course of courses) {
    if (ONLY_COURSE && course.id !== ONLY_COURSE) continue;
    console.log(`\n=== ${course.name.es} (${course.side === 'w' ? 'blancas' : 'negras'}) · profundidad ${DEPTH} ===`);
    for (const line of course.lines) {
      if (ONLY_LINE && line.id !== ONLY_LINE) continue;
      await auditLine(engine, course, line, issues);
    }
  }

  console.log(`\n=== Resumen: ${issues.length} aviso(s) ===`);
  for (const i of issues) console.log(`- ${i.line} ${i.where}: ${i.message}`);
  engine.quit();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
