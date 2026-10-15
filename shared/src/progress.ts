// Progreso del alumno: un reductor puro que usan igual el navegador (modo invitado)
// y el servidor (cuentas), para que las reglas de XP y desbloqueo sean las mismas.

import { addDays, daysBetween, isDue, review, type Grade, type SrsCard } from './srs';
import type { Course, Stage } from './types';

export interface StageRecord {
  completedAt: string;
  score?: number;
}

export interface PuzzleRecord {
  solved: boolean;
  attempts: number;
  firstSolvedAt?: string;
}

export interface SparringRecord {
  games: number;
  wins: number;
  draws: number;
  losses: number;
}

export interface ProgressState {
  v: 1;
  xp: number;
  streak: { count: number; best: number; lastDay: string | null };
  daily: { day: string | null; xp: number };
  /** Clave: "curso/etapa". */
  stages: Record<string, StageRecord>;
  /** Clave: id de línea. */
  lines: Record<string, SrsCard>;
  puzzles: Record<string, PuzzleRecord>;
  exams: Record<string, { best: number; passedAt?: string }>;
  sparring: Record<string, SparringRecord>;
}

export type ProgressEvent =
  | { type: 'stage_complete'; course: string; stage: string; day: string; score?: number }
  | { type: 'line_review'; line: string; grade: Grade; day: string }
  | { type: 'puzzle_attempt'; puzzle: string; solved: boolean; day: string }
  | { type: 'exam_result'; course: string; score: number; passScore: number; day: string }
  | { type: 'sparring_result'; course: string; result: 'win' | 'draw' | 'loss'; day: string };

export const DAILY_GOAL = 50;

export const XP = {
  stage: 20,
  lineGood: 5,
  lineHard: 3,
  lineAgain: 1,
  puzzleFirst: 10,
  puzzleRepeat: 2,
  examPass: 100,
  sparringWin: 30,
  sparringDraw: 15,
  sparringLoss: 5,
} as const;

export function emptyProgress(): ProgressState {
  return {
    v: 1,
    xp: 0,
    streak: { count: 0, best: 0, lastDay: null },
    daily: { day: null, xp: 0 },
    stages: {},
    lines: {},
    puzzles: {},
    exams: {},
    sparring: {},
  };
}

export const stageKey = (course: string, stage: string) => `${course}/${stage}`;

/** Aplica un evento y devuelve el estado nuevo y la XP ganada. No modifica el original. */
export function applyEvent(state: ProgressState, event: ProgressEvent): { state: ProgressState; xp: number } {
  const s: ProgressState = structuredClone(state);
  let xp = 0;

  switch (event.type) {
    case 'stage_complete': {
      const key = stageKey(event.course, event.stage);
      const prev = s.stages[key];
      if (!prev) {
        xp += XP.stage;
        s.stages[key] = { completedAt: event.day, score: event.score };
      } else if (event.score !== undefined && (prev.score === undefined || event.score > prev.score)) {
        prev.score = event.score;
      }
      break;
    }
    case 'line_review': {
      s.lines[event.line] = review(s.lines[event.line], event.grade, event.day);
      xp += event.grade === 'again' ? XP.lineAgain : event.grade === 'hard' ? XP.lineHard : XP.lineGood;
      break;
    }
    case 'puzzle_attempt': {
      const prev = s.puzzles[event.puzzle] ?? { solved: false, attempts: 0 };
      const rec: PuzzleRecord = { ...prev, attempts: prev.attempts + 1 };
      if (event.solved) {
        xp += prev.solved ? XP.puzzleRepeat : XP.puzzleFirst;
        rec.solved = true;
        rec.firstSolvedAt ??= event.day;
      }
      s.puzzles[event.puzzle] = rec;
      break;
    }
    case 'exam_result': {
      const prev = s.exams[event.course] ?? { best: 0 };
      const passed = event.score >= event.passScore;
      const rec = { ...prev, best: Math.max(prev.best, event.score) };
      if (passed && !prev.passedAt) {
        xp += XP.examPass;
        rec.passedAt = event.day;
      }
      s.exams[event.course] = rec;
      break;
    }
    case 'sparring_result': {
      const prev = s.sparring[event.course] ?? { games: 0, wins: 0, draws: 0, losses: 0 };
      const rec = { ...prev, games: prev.games + 1 };
      if (event.result === 'win') {
        rec.wins += 1;
        xp += XP.sparringWin;
      } else if (event.result === 'draw') {
        rec.draws += 1;
        xp += XP.sparringDraw;
      } else {
        rec.losses += 1;
        xp += XP.sparringLoss;
      }
      s.sparring[event.course] = rec;
      break;
    }
  }

  if (xp > 0) {
    s.xp += xp;
    // El objetivo diario es el del día más reciente: un evento atrasado (sincronización
    // tardía) suma XP, pero no reinicia el contador de hoy.
    if (!s.daily.day || event.day > s.daily.day) s.daily = { day: event.day, xp: 0 };
    if (s.daily.day === event.day) s.daily.xp += xp;
    touchStreak(s, event.day);
  }
  return { state: s, xp };
}

export function applyEvents(state: ProgressState, events: ProgressEvent[]): { state: ProgressState; xp: number } {
  let current = state;
  let total = 0;
  for (const e of events) {
    const r = applyEvent(current, e);
    current = r.state;
    total += r.xp;
  }
  return { state: current, xp: total };
}

function touchStreak(s: ProgressState, day: string) {
  const { lastDay } = s.streak;
  if (lastDay === day) return;
  if (lastDay && day < lastDay) return; // evento con fecha antigua (sincronización tardía)
  s.streak.count = lastDay && addDays(lastDay, 1) === day ? s.streak.count + 1 : 1;
  s.streak.lastDay = day;
  s.streak.best = Math.max(s.streak.best, s.streak.count);
}

/** Racha vigente: se pierde si ayer no hubo actividad. */
export function currentStreak(s: ProgressState, today: string): number {
  const { lastDay, count } = s.streak;
  if (!lastDay) return 0;
  // lastDay > today: actividad apuntada con la fecha de otra zona horaria; la racha sigue viva.
  return lastDay >= today || addDays(lastDay, 1) === today ? count : 0;
}

export function dailyXp(s: ProgressState, today: string): number {
  return s.daily.day === today ? s.daily.xp : 0;
}

/**
 * Une dos rachas. Cada racha es una serie de días seguidos que acaba en `lastDay`: si las
 * dos series se tocan o se solapan (p. ej. la cuenta hasta ayer y el invitado hoy), la
 * racha unida va desde el primer día de las dos hasta el último.
 */
function mergeStreaks(a: ProgressState['streak'], b: ProgressState['streak']): ProgressState['streak'] {
  const [newer, older] = (a.lastDay ?? '') >= (b.lastDay ?? '') ? [a, b] : [b, a];
  let count = newer.count;
  if (newer.lastDay && older.lastDay && newer.count > 0 && older.count > 0) {
    const newerStart = addDays(newer.lastDay, 1 - newer.count);
    if (older.lastDay >= addDays(newerStart, -1)) {
      const olderStart = addDays(older.lastDay, 1 - older.count);
      count = daysBetween(olderStart < newerStart ? olderStart : newerStart, newer.lastDay) + 1;
    }
  }
  return { count, lastDay: newer.lastDay, best: Math.max(a.best, b.best, count) };
}

/**
 * Une dos progresos (por ejemplo, el de invitado con el de la cuenta). Es idempotente:
 * importar dos veces lo mismo no cambia nada. En un empate exacto (misma línea repasada el
 * mismo día con las mismas repeticiones, o el mismo número de partidas de sparring) se
 * queda el dato de `a`.
 */
export function mergeProgress(a: ProgressState, b: ProgressState): ProgressState {
  const out = emptyProgress();
  out.xp = Math.max(a.xp, b.xp);
  out.streak = mergeStreaks(a.streak, b.streak);
  const da = a.daily.day ?? '';
  const db = b.daily.day ?? '';
  out.daily = da > db ? { ...a.daily } : db > da ? { ...b.daily } : { day: a.daily.day, xp: Math.max(a.daily.xp, b.daily.xp) };

  for (const src of [a, b]) {
    for (const [k, v] of Object.entries(src.stages)) {
      const cur = out.stages[k];
      if (!cur) out.stages[k] = { ...v };
      else {
        if (v.completedAt < cur.completedAt) cur.completedAt = v.completedAt;
        if (v.score !== undefined && (cur.score === undefined || v.score > cur.score)) cur.score = v.score;
      }
    }
    for (const [k, v] of Object.entries(src.lines)) {
      const cur = out.lines[k];
      if (!cur || v.last > cur.last || (v.last === cur.last && v.reps > cur.reps)) out.lines[k] = { ...v };
    }
    for (const [k, v] of Object.entries(src.puzzles)) {
      const cur = out.puzzles[k];
      if (!cur) out.puzzles[k] = { ...v };
      else {
        cur.attempts = Math.max(cur.attempts, v.attempts);
        cur.solved ||= v.solved;
        if (v.firstSolvedAt && (!cur.firstSolvedAt || v.firstSolvedAt < cur.firstSolvedAt)) cur.firstSolvedAt = v.firstSolvedAt;
      }
    }
    for (const [k, v] of Object.entries(src.exams)) {
      const cur = out.exams[k];
      if (!cur) out.exams[k] = { ...v };
      else {
        cur.best = Math.max(cur.best, v.best);
        if (v.passedAt && (!cur.passedAt || v.passedAt < cur.passedAt)) cur.passedAt = v.passedAt;
      }
    }
    for (const [k, v] of Object.entries(src.sparring)) {
      const cur = out.sparring[k];
      if (!cur || v.games > cur.games) out.sparring[k] = { ...v };
    }
  }
  return out;
}

// --- Niveles ---------------------------------------------------------------

/** XP total necesaria para alcanzar un nivel: 0, 100, 300, 600, 1000... */
export function xpForLevel(level: number): number {
  return 50 * level * (level - 1);
}

export function levelInfo(xp: number) {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return { level, base, next, progress: (xp - base) / (next - base) };
}

// --- Cursos ----------------------------------------------------------------

export interface FlatStage {
  stage: Stage;
  campIndex: number;
  index: number;
}

export function flattenStages(course: Course): FlatStage[] {
  const out: FlatStage[] = [];
  course.camps.forEach((camp, campIndex) => {
    for (const stage of camp.stages) out.push({ stage, campIndex, index: out.length });
  });
  return out;
}

export type StageStatus = 'done' | 'current' | 'locked';

/** Estado de cada etapa: se desbloquean en orden, como un camino de montaña. */
export function stageStatuses(course: Course, state: ProgressState): StageStatus[] {
  let foundCurrent = false;
  return flattenStages(course).map(({ stage }) => {
    if (state.stages[stageKey(course.id, stage.id)]) return 'done';
    if (!foundCurrent) {
      foundCurrent = true;
      return 'current';
    }
    return 'locked';
  });
}

export function isStageUnlocked(course: Course, stageId: string, state: ProgressState): boolean {
  const flat = flattenStages(course);
  const i = flat.findIndex((f) => f.stage.id === stageId);
  if (i < 0) return false;
  return stageStatuses(course, state)[i] !== 'locked';
}

export function courseCompletion(course: Course, state: ProgressState) {
  const statuses = stageStatuses(course, state);
  const done = statuses.filter((s) => s === 'done').length;
  return { done, total: statuses.length, ratio: done / statuses.length };
}

export interface DueLine {
  course: Course;
  lineId: string;
  card: SrsCard;
}

/** Líneas aprendidas cuyo repaso toca hoy, las más atrasadas primero. */
export function dueLines(courses: Course[], state: ProgressState, today: string): DueLine[] {
  const out: DueLine[] = [];
  for (const course of courses) {
    for (const line of course.lines) {
      const card = state.lines[line.id];
      if (card && line.practice !== false && isDue(card, today)) out.push({ course, lineId: line.id, card });
    }
  }
  return out.sort((a, b) => (a.card.due < b.card.due ? -1 : a.card.due > b.card.due ? 1 : a.card.ease - b.card.ease));
}

// --- Medallas ---------------------------------------------------------------

export interface Badge {
  id: string;
  earned: boolean;
}

export function badges(state: ProgressState, courses: Course[]): Badge[] {
  const solved = Object.values(state.puzzles).filter((p) => p.solved).length;
  const summits = Object.values(state.exams).filter((e) => e.passedAt).length;
  const wins = Object.values(state.sparring).reduce((n, r) => n + r.wins, 0);
  return [
    { id: 'first-stage', earned: Object.keys(state.stages).length > 0 },
    { id: 'streak-7', earned: state.streak.best >= 7 },
    { id: 'puzzles-10', earned: solved >= 10 },
    { id: 'first-win', earned: wins > 0 },
    { id: 'first-summit', earned: summits > 0 },
    { id: 'all-summits', earned: courses.length > 0 && summits >= courses.length },
  ];
}
