// Datos derivados del contenido para las lecciones: jugadas de cada línea, posiciones ya
// vistas, flechas de los comentarios, alternativas del rival y textos de jugadas.
import {
  START_FEN,
  buildRepertoire,
  flattenStages,
  localizeSan,
  parseArrow,
  playLine,
  positionKey,
  stageStatuses,
  type Camp,
  type Course,
  type L10n,
  type LineDef,
  type MoveNote,
  type NotationStyle,
  type Ply,
  type ProgressState,
  type Repertoire,
  type Stage,
  type StageStatus,
} from '@chessblizzard/shared';
import type { BoardArrow, BoardArrowKind } from '../board';

const plyCache = new WeakMap<LineDef, Ply[]>();

/** Medias jugadas de una línea (con sus comentarios), calculadas una sola vez. */
export function linePlies(line: LineDef): Ply[] {
  let plies = plyCache.get(line);
  if (!plies) {
    plies = playLine(line);
    plyCache.set(line, plies);
  }
  return plies;
}

export function courseLine(course: Course, id: string): LineDef | undefined {
  return course.lines.find((l) => l.id === id);
}

/** Líneas de una etapa que las tenga (las que no existen se ignoran). */
export function stageLines(course: Course, stage: Stage): LineDef[] {
  if (!('lines' in stage)) return [];
  return stage.lines.map((id) => courseLine(course, id)).filter((l): l is LineDef => !!l);
}

export function campOf(course: Course, stageId: string): Camp | undefined {
  return course.camps.find((c) => c.stages.some((s) => s.id === stageId));
}

const repCache = new WeakMap<Course, Repertoire>();

export function repertoireOf(course: Course): Repertoire {
  let rep = repCache.get(course);
  if (!rep) {
    rep = buildRepertoire(course);
    repCache.set(course, rep);
  }
  return rep;
}

/** Posiciones (tras cada jugada) de las líneas de las etapas anteriores a `stageId`. */
export function knownPositions(course: Course, stageId: string): Set<string> {
  const known = new Set<string>();
  for (const { stage } of flattenStages(course)) {
    if (stage.id === stageId) break;
    for (const line of stageLines(course, stage)) addLine(known, line);
  }
  return known;
}

export function addLine(known: Set<string>, line: LineDef) {
  for (const p of linePlies(line)) known.add(positionKey(p.fenAfter));
}

/** Índice de la primera jugada que lleva a una posición nueva (0 si no se conoce ninguna). */
export function firstNewPly(plies: Ply[], known: Set<string>): number {
  if (known.size === 0) return 0;
  const i = plies.findIndex((p) => !known.has(positionKey(p.fenAfter)));
  return i < 0 ? 0 : i;
}

/** Longitud del tramo inicial común (en medias jugadas) con alguna de las líneas dadas. */
export function sharedPrefix(line: LineDef, others: LineDef[]): number {
  const mine = linePlies(line);
  let best = 0;
  for (const other of others) {
    if (other.id === line.id) continue;
    const theirs = linePlies(other);
    let i = 0;
    while (i < mine.length && i < theirs.length && mine[i].san === theirs[i].san) i++;
    best = Math.max(best, i);
  }
  return best;
}

export function arrowFrom(spec: string, kind: BoardArrowKind): BoardArrow | null {
  try {
    const a = parseArrow(spec);
    return { from: a.from, to: a.to, via: a.via, kind };
  } catch {
    return null;
  }
}

export function moveArrow(from: string, to: string, kind: BoardArrowKind): BoardArrow {
  return arrowFrom(from + to, kind) ?? { from, to, kind };
}

/** Flechas de un comentario: las del plan del alumno y las del rival. */
export function noteArrows(note: MoveNote | undefined, which: { plan?: boolean; rival?: boolean } = {}): BoardArrow[] {
  if (!note) return [];
  const out: BoardArrow[] = [];
  if (which.plan !== false) for (const s of note.arrows ?? []) {
    const a = arrowFrom(s, 'plan');
    if (a) out.push(a);
  }
  if (which.rival !== false) for (const s of note.rival ?? []) {
    const a = arrowFrom(s, 'rival');
    if (a) out.push(a);
  }
  return out;
}

/** "10...Cf5" en la notación elegida. */
export function moveLabel(ply: { moveNumber: number; color: 'w' | 'b'; san: string }, notation: NotationStyle): string {
  return `${ply.moveNumber}${ply.color === 'w' ? '.' : '...'}${localizeSan(ply.san, notation)}`;
}

export function fenAt(plies: Ply[], cursor: number): string {
  return cursor > 0 ? plies[cursor - 1].fenAfter : (plies[0]?.fenBefore ?? START_FEN);
}

export function lastMoveAt(plies: Ply[], cursor: number): [string, string] | null {
  const p = plies[cursor - 1];
  return p ? [p.from, p.to] : null;
}

/** Texto de una flecha para las fichas de ideas clave: "Cg1–f3" o "f7–f5". */
export function arrowText(arrow: BoardArrow, fen: string, notation: NotationStyle): string {
  const placement = fen.split(' ')[0].split('/');
  const file = arrow.from.charCodeAt(0) - 97;
  const rank = Number(arrow.from[1]);
  let piece = '';
  const row = placement[8 - rank];
  if (row) {
    let f = 0;
    for (const ch of row) {
      if (/\d/.test(ch)) f += Number(ch);
      else {
        if (f === file) piece = ch.toUpperCase() === 'P' ? '' : ch.toUpperCase();
        f++;
      }
    }
  }
  return `${piece ? localizeSan(piece, notation) : ''}${arrow.from}–${arrow.to}`;
}

export interface Alternative {
  san: string;
  /** Jugada en notación de pantalla ("9.Cd2"). */
  label: string;
  lineName: L10n;
  campName: L10n;
  status: StageStatus | 'here';
}

/**
 * Otras respuestas del rival que el curso cubre en la posición anterior a una jugada
 * suya, y la etapa donde se estudia cada una.
 */
export function alternativesAt(course: Course, ply: Ply, lineId: string, state: ProgressState, notation: NotationStyle): Alternative[] {
  const rep = repertoireOf(course);
  const node = rep.nodes.get(positionKey(ply.fenBefore));
  if (!node || node.opponent.length < 2) return [];
  const flat = flattenStages(course);
  const statuses = stageStatuses(course, state);
  const key = positionKey(ply.fenBefore);
  const out: Alternative[] = [];
  for (const san of node.opponent) {
    const label = moveLabel({ moveNumber: ply.moveNumber, color: ply.color, san }, notation);
    if (san === ply.san) {
      const line = courseLine(course, lineId);
      out.unshift({ san, label, lineName: line?.name ?? { es: '', en: '' }, campName: { es: '', en: '' }, status: 'here' });
      continue;
    }
    // La primera línea (en el orden del curso) que sigue esa respuesta.
    let found: { line: LineDef; index: number } | null = null;
    for (const [index, f] of flat.entries()) {
      if (f.stage.type === 'practice' || f.stage.type === 'sparring' || f.stage.type === 'exam') continue;
      for (const line of stageLines(course, f.stage)) {
        if (line.practice === false) continue;
        if (linePlies(line).some((p) => p.san === san && positionKey(p.fenBefore) === key)) {
          found = { line, index };
          break;
        }
      }
      if (found) break;
    }
    if (!found) continue;
    const camp = course.camps[flat[found.index].campIndex];
    out.push({ san, label, lineName: found.line.name, campName: camp.name, status: statuses[found.index] });
  }
  return out;
}

/** Libro de referencia del curso para "Para profundizar". */
export function firstBook(course: Course) {
  return course.references.find((r) => r.kind === 'book');
}
