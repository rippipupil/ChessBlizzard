// Esquemas de zod de los cuerpos que recibe la API.

import { addDays, isDay, type ProgressEvent, type ProgressState, type Settings } from '@chessblizzard/shared';
import { z } from 'zod';

// Comprobaciones de tipos en tiempo de compilación (si dejan de cumplirse, tsc falla).
type Equals<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Assert<T extends true> = T;

// --- Cuentas -----------------------------------------------------------------

export const emailSchema = z.string().trim().toLowerCase().pipe(z.email().max(254));
export const passwordSchema = z.string().min(8).max(200);

// Ni caracteres de control ni marcas de dirección del texto, que permitirían disfrazar un nombre.
const FORBIDDEN_NAME_CHARS = /[\p{Cc}‪-‮⁦-⁩]/u;
export const displayNameSchema = z
  .string()
  .trim()
  .min(2)
  .max(40)
  .refine((name) => !FORBIDDEN_NAME_CHARS.test(name), 'Invalid characters')
  .transform((name) => name.replace(/\s+/g, ' '));

export const registerBodySchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: displayNameSchema,
});

// Al iniciar sesión no se aplican las reglas del registro: cualquier fallo es `invalid_credentials`.
export const loginBodySchema = z.object({
  email: z.string().trim().toLowerCase().min(1).max(254),
  password: z.string().min(1).max(200),
});

// --- Ajustes -----------------------------------------------------------------

/** Debe coincidir exactamente con `Partial<Settings>` de @chessblizzard/shared. */
export const settingsPatchSchema = z.strictObject({
  locale: z.enum(['es', 'en']).optional(),
  theme: z.enum(['blizzard', 'neon']).optional(),
  colorMode: z.enum(['dark', 'light', 'system']).optional(),
  notation: z.enum(['es', 'en']).optional(),
  coordinates: z.boolean().optional(),
  highlightLastMove: z.boolean().optional(),
  planArrows: z.boolean().optional(),
  sounds: z.boolean().optional(),
});
export type SettingsSchemaMatches = Assert<Equals<z.output<typeof settingsPatchSchema>, Partial<Settings>>>;

// --- Progreso ----------------------------------------------------------------

/** Fecha AAAA-MM-DD que existe en el calendario (`isDay` acepta, por ejemplo, 2026-02-30). */
export function isCalendarDay(value: string): boolean {
  return isDay(value) && addDays(value, 0) === value;
}

export const daySchema = z.string().refine(isCalendarDay, 'Expected a date (YYYY-MM-DD)');
const idSchema = z.string().min(1).max(120);

export const progressEventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('stage_complete'),
    course: idSchema,
    stage: idSchema,
    day: daySchema,
    score: z.number().min(0).max(100).optional(),
  }),
  z.object({ type: z.literal('line_review'), line: idSchema, grade: z.enum(['again', 'hard', 'good', 'easy']), day: daySchema }),
  z.object({ type: z.literal('puzzle_attempt'), puzzle: idSchema, solved: z.boolean(), day: daySchema }),
  z.object({
    type: z.literal('exam_result'),
    course: idSchema,
    score: z.number().min(0).max(1),
    passScore: z.number().min(0).max(1),
    day: daySchema,
  }),
  z.object({ type: z.literal('sparring_result'), course: idSchema, result: z.enum(['win', 'draw', 'loss']), day: daySchema }),
]);
export type ProgressEventSchemaMatches = Assert<Equals<z.output<typeof progressEventSchema>, ProgressEvent>>;

export const MAX_EVENTS_PER_REQUEST = 200;

export const eventsBodySchema = z.object({
  events: z.array(progressEventSchema).max(MAX_EVENTS_PER_REQUEST),
});

// Límites de la importación. El contenido actual tiene unas decenas de líneas y puzzles por
// curso: los límites dejan mucho margen y cortan cuerpos absurdos.
export const IMPORT_LIMITS = { stages: 2000, lines: 5000, puzzles: 10_000, exams: 500, sparring: 500 } as const;

// Ids del contenido ("kid-main", "kings-indian/main-line"). Se rechazan además los nombres
// de Object.prototype ("constructor", "toString"...), que confundirían a mergeProgress.
const recordKeySchema = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[A-Za-z0-9][\w.:/-]*$/, 'Invalid key')
  .refine((key) => !(key in Object.prototype), 'Invalid key');

const countSchema = z.int().min(0).max(1_000_000_000);

function boundedRecord<T extends z.ZodType>(value: T, max: number) {
  return z
    .record(recordKeySchema, value)
    .refine((record) => Object.keys(record).length <= max, `At most ${max} entries`)
    .default({});
}

/**
 * Cuerpo de POST /api/progress/import. Las fechas no pueden ser futuras (con 2 días de
 * margen por las zonas horarias), salvo la del próximo repaso de cada línea.
 */
export function importBodySchema(today: string) {
  const latest = addDays(today, 2);
  const latestDue = addDays(today, 400);
  const pastDay = daySchema.refine((day) => day <= latest, 'Date in the future');
  const dueDay = daySchema.refine((day) => day <= latestDue, 'Date too far in the future');

  const progress = z.object({
    v: z.literal(1),
    xp: countSchema,
    streak: z.object({ count: countSchema, best: countSchema, lastDay: pastDay.nullable() }).default({ count: 0, best: 0, lastDay: null }),
    daily: z.object({ day: pastDay.nullable(), xp: countSchema }).default({ day: null, xp: 0 }),
    stages: boundedRecord(z.object({ completedAt: pastDay, score: z.number().min(0).max(100).optional() }), IMPORT_LIMITS.stages),
    lines: boundedRecord(
      z.object({
        ease: z.number().min(1).max(100),
        interval: z.int().min(0).max(36_500),
        due: dueDay,
        reps: countSchema,
        lapses: countSchema,
        last: pastDay,
      }),
      IMPORT_LIMITS.lines,
    ),
    puzzles: boundedRecord(z.object({ solved: z.boolean(), attempts: countSchema, firstSolvedAt: pastDay.optional() }), IMPORT_LIMITS.puzzles),
    exams: boundedRecord(z.object({ best: z.number().min(0).max(100), passedAt: pastDay.optional() }), IMPORT_LIMITS.exams),
    sparring: boundedRecord(
      z.object({ games: countSchema, wins: countSchema, draws: countSchema, losses: countSchema }),
      IMPORT_LIMITS.sparring,
    ),
  });
  return z.object({ progress });
}

type Assignable<A, B> = [A] extends [B] ? true : false;
export type ImportSchemaMatches = Assert<Assignable<z.output<ReturnType<typeof importBodySchema>>['progress'], ProgressState>>;
