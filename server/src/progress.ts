// Progreso de las cuentas: comprobación de eventos contra el contenido y escritura en la
// base de datos con la fila bloqueada (SELECT ... FOR UPDATE), para que dos pestañas que
// envían eventos a la vez no se pisen.

import {
  applyEvents,
  daysBetween,
  emptyProgress,
  findLine,
  findPuzzle,
  findStage,
  getCourse,
  mergeProgress,
  type ExamStage,
  type ProgressEvent,
  type ProgressState,
} from '@chessblizzard/shared';
import { withTransaction, type Pool, type PoolClient } from './db';
import { validationError, type ErrorDetail } from './errors';

/** Margen de los eventos respecto a la fecha del servidor (zonas horarias, envíos tardíos). */
export const MAX_DAY_OFFSET = 2;

/** Fecha UTC (AAAA-MM-DD) del servidor. */
export function utcDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function normalizeProgress(data: unknown): ProgressState {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return emptyProgress();
  return { ...emptyProgress(), ...(data as Partial<ProgressState>) };
}

type Checked = { event: ProgressEvent } | { problem: { field: string; message: string } };

function problem(field: string, message: string): Checked {
  return { problem: { field, message } };
}

function checkEvent(event: ProgressEvent, today: string): Checked {
  if (Math.abs(daysBetween(today, event.day)) > MAX_DAY_OFFSET) {
    return problem('day', `Must be within ${MAX_DAY_OFFSET} days of the server date (${today})`);
  }
  switch (event.type) {
    case 'stage_complete':
      if (findStage(event.course, event.stage)) return { event };
      return getCourse(event.course) ? problem('stage', 'Unknown stage') : problem('course', 'Unknown course');
    case 'line_review':
      return findLine(event.line) ? { event } : problem('line', 'Unknown line');
    case 'puzzle_attempt':
      return findPuzzle(event.puzzle) ? { event } : problem('puzzle', 'Unknown puzzle');
    case 'sparring_result':
      return getCourse(event.course) ? { event } : problem('course', 'Unknown course');
    case 'exam_result': {
      const course = getCourse(event.course);
      if (!course) return problem('course', 'Unknown course');
      const exams = course.camps.flatMap((camp) => camp.stages).filter((s): s is ExamStage => s.type === 'exam');
      if (exams.length === 0) return problem('course', 'This course has no exam');
      // La nota de aprobado la marca el contenido, no el cliente: nunca por debajo de la del examen.
      const passScore = Math.max(event.passScore, Math.min(...exams.map((s) => s.passScore)));
      return { event: { ...event, passScore } };
    }
  }
}

/**
 * Comprueba que los ids de cada evento existen en el contenido y que su fecha está a
 * ±2 días de la del servidor. Si alguno falla, se rechaza la petición entera.
 */
export function checkEvents(events: ProgressEvent[], today: string): ProgressEvent[] {
  const out: ProgressEvent[] = [];
  const problems: ErrorDetail[] = [];
  events.forEach((event, i) => {
    const result = checkEvent(event, today);
    if ('event' in result) out.push(result.event);
    else problems.push({ path: `events[${i}].${result.problem.field}`, message: result.problem.message });
  });
  if (problems.length > 0) throw validationError(problems);
  return out;
}

/** Bloquea la fila de progreso del usuario (creándola si no existe) hasta el fin de la transacción. */
async function lockProgress(client: PoolClient, userId: string): Promise<ProgressState> {
  await client.query('INSERT INTO progress (user_id, data) VALUES ($1, $2::jsonb) ON CONFLICT (user_id) DO NOTHING', [
    userId,
    JSON.stringify(emptyProgress()),
  ]);
  const { rows } = await client.query<{ data: unknown }>('SELECT data FROM progress WHERE user_id = $1 FOR UPDATE', [userId]);
  return normalizeProgress(rows[0]?.data);
}

async function saveProgress(client: PoolClient, userId: string, state: ProgressState): Promise<void> {
  await client.query('UPDATE progress SET data = $2::jsonb, updated_at = now() WHERE user_id = $1', [userId, JSON.stringify(state)]);
}

export async function readProgress(pool: Pool, userId: string): Promise<ProgressState> {
  const { rows } = await pool.query<{ data: unknown }>('SELECT data FROM progress WHERE user_id = $1', [userId]);
  return normalizeProgress(rows[0]?.data);
}

/** Aplica los eventos (ya comprobados) con `applyEvents` y devuelve el estado y la XP ganada. */
export async function recordEvents(pool: Pool, userId: string, events: ProgressEvent[]): Promise<{ progress: ProgressState; xp: number }> {
  if (events.length === 0) return { progress: await readProgress(pool, userId), xp: 0 };
  return withTransaction(pool, async (client) => {
    const { state, xp } = applyEvents(await lockProgress(client, userId), events);
    await saveProgress(client, userId, state);
    return { progress: state, xp };
  });
}

/** Fusiona un progreso (p. ej. el de invitado) con el de la cuenta usando `mergeProgress`. */
export async function importProgress(pool: Pool, userId: string, incoming: ProgressState): Promise<ProgressState> {
  return withTransaction(pool, async (client) => {
    const merged = mergeProgress(await lockProgress(client, userId), incoming);
    await saveProgress(client, userId, merged);
    return merged;
  });
}
