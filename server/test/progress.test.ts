import {
  addDays,
  applyEvents,
  courses,
  emptyProgress,
  flattenStages,
  mergeProgress,
  XP,
  type ProgressEvent,
  type ProgressState,
} from '@chessblizzard/shared';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { closePool, createTestApp, errorCode, registerUser, resetDatabase, testPool } from './helpers';

// Reloj fijo para comprobar el margen de ±2 días.
const NOW = new Date('2026-10-15T12:00:00Z');
const TODAY = '2026-10-15';

// Ids sacados del contenido real, para que los tests sigan valiendo aunque cambie.
const hasExam = (c: (typeof courses)[number]) => c.camps.some((camp) => camp.stages.some((s) => s.type === 'exam'));
const course = courses.find((c) => c.lines.length > 0 && flattenStages(c).length > 0)!;
const stage = flattenStages(course)[0].stage;
const line = course.lines[0];
const examCourse = courses.find(hasExam);
const examPassScore = examCourse ? Math.min(...examCourse.camps.flatMap((c) => c.stages).flatMap((s) => (s.type === 'exam' ? [s.passScore] : []))) : 1;
const noExamCourse = courses.find((c) => !hasExam(c));
const puzzle = courses.flatMap((c) => c.puzzles)[0];

let app: FastifyInstance;
let cookie: string;

beforeAll(async () => {
  app = await createTestApp({ now: () => NOW });
});
beforeEach(async () => {
  await resetDatabase();
  cookie = (await registerUser(app)).cookie;
});
afterAll(async () => {
  await app.close();
  await closePool();
});

const sendEvents = (events: unknown[], as = cookie) =>
  app.inject({ method: 'POST', url: '/api/progress/events', headers: { cookie: as }, payload: { events } });
const getProgress = async (as = cookie): Promise<ProgressState> =>
  (await app.inject({ method: 'GET', url: '/api/progress', headers: { cookie: as } })).json().progress;
const importProgress = (progress: unknown, as = cookie) =>
  app.inject({ method: 'POST', url: '/api/progress/import', headers: { cookie: as }, payload: { progress } as object });

const stageDone = (day = TODAY): ProgressEvent => ({ type: 'stage_complete', course: course.id, stage: stage.id, day });
const review = (grade: 'again' | 'hard' | 'good' | 'easy' = 'good', day = TODAY): ProgressEvent => ({ type: 'line_review', line: line.id, grade, day });

describe('GET /api/progress', () => {
  it('una cuenta nueva empieza con el progreso vacío', async () => {
    expect(await getProgress()).toEqual(emptyProgress());
  });

  it('exige sesión', async () => {
    for (const res of [
      await app.inject({ method: 'GET', url: '/api/progress' }),
      await app.inject({ method: 'POST', url: '/api/progress/events', payload: { events: [] } }),
      await app.inject({ method: 'POST', url: '/api/progress/import', payload: { progress: emptyProgress() } }),
    ]) {
      expect(res.statusCode).toBe(401);
      expect(errorCode(res)).toBe('unauthorized');
    }
  });
});

describe('POST /api/progress/events', () => {
  it('aplica los eventos con applyEvents, suma XP y lo guarda', async () => {
    const events: ProgressEvent[] = [stageDone(), review('good'), { type: 'sparring_result', course: course.id, result: 'win', day: TODAY }];
    const res = await sendEvents(events);
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.xp).toBe(XP.stage + XP.lineGood + XP.sparringWin);
    expect(body.progress).toEqual(applyEvents(emptyProgress(), events).state);
    expect(body.progress).toMatchObject({ xp: body.xp, daily: { day: TODAY, xp: body.xp }, streak: { count: 1, lastDay: TODAY } });
    expect(await getProgress()).toEqual(body.progress);

    // Repetir la etapa no da XP; repasar otra vez sí.
    const again = await sendEvents([stageDone(), review('hard')]);
    expect(again.json().xp).toBe(XP.lineHard);
    expect(again.json().progress.xp).toBe(body.xp + XP.lineHard);
    expect(again.json().progress.lines[line.id].reps).toBe(2);
  });

  it('cada cuenta tiene su propio progreso', async () => {
    await sendEvents([stageDone()]);
    const other = (await registerUser(app)).cookie;
    expect(await getProgress(other)).toEqual(emptyProgress());
  });

  it('una lista vacía devuelve el progreso actual con 0 XP', async () => {
    await sendEvents([review()]);
    const res = await sendEvents([]);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ progress: await getProgress(), xp: 0 });
  });

  it.each([
    ['línea', { type: 'line_review', line: 'no-existe', grade: 'good', day: TODAY }, 'events[1].line'],
    ['curso', { type: 'stage_complete', course: 'no-existe', stage: stage.id, day: TODAY }, 'events[1].course'],
    ['etapa', { type: 'stage_complete', course: course.id, stage: 'no-existe', day: TODAY }, 'events[1].stage'],
    ['puzzle', { type: 'puzzle_attempt', puzzle: 'no-existe', solved: true, day: TODAY }, 'events[1].puzzle'],
    ['curso del sparring', { type: 'sparring_result', course: 'no-existe', result: 'win', day: TODAY }, 'events[1].course'],
    ['curso del examen', { type: 'exam_result', course: 'no-existe', score: 1, passScore: 0.8, day: TODAY }, 'events[1].course'],
  ])('rechaza la petición entera si un id no existe: %s', async (_name, bad, path) => {
    const res = await sendEvents([review(), bad]);
    expect(res.statusCode).toBe(400);
    const { error } = res.json();
    expect(error.code).toBe('validation');
    expect(error.details).toEqual([{ path, message: expect.any(String) }]);
    // No se ha aplicado nada, tampoco el evento válido.
    expect(await getProgress()).toEqual(emptyProgress());
  });

  it('acepta fechas a ±2 días de la del servidor y rechaza las demás', async () => {
    for (const offset of [-2, -1, 0, 1, 2]) {
      expect((await sendEvents([review('good', addDays(TODAY, offset))])).statusCode).toBe(200);
    }
    for (const offset of [-3, 3, -400]) {
      const res = await sendEvents([review('good', addDays(TODAY, offset))]);
      expect(res.statusCode).toBe(400);
      expect(res.json().error.details[0].path).toBe('events[0].day');
    }
  });

  it.each(['2026-02-30', '2026-13-01', '15/10/2026', '2026-10-15T10:00:00Z', ''])('rechaza la fecha mal formada "%s"', async (day) => {
    const res = await sendEvents([review('good', day)]);
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toMatchObject({ code: 'validation', details: [{ path: 'events[0].day' }] });
  });

  it.each([
    ['tipo desconocido', { type: 'level_up', day: TODAY }],
    ['nota desconocida', { type: 'line_review', line: line.id, grade: 'perfect', day: TODAY }],
    ['falta la fecha', { type: 'line_review', line: line.id, grade: 'good' }],
    ['solved no booleano', { type: 'puzzle_attempt', puzzle: 'x', solved: 'yes', day: TODAY }],
    ['nota de examen fuera de 0-1', { type: 'exam_result', course: course.id, score: 80, passScore: 0.8, day: TODAY }],
    ['nota de etapa negativa', { ...stageDone(), score: -1 }],
  ])('valida la forma de cada evento: %s', async (_name, event) => {
    const res = await sendEvents([event]);
    expect(res.statusCode).toBe(400);
    expect(errorCode(res)).toBe('validation');
  });

  it('admite como máximo 200 eventos por petición', async () => {
    const ok = await sendEvents(Array.from({ length: 200 }, () => review('again')));
    expect(ok.statusCode).toBe(200);
    expect(ok.json().xp).toBe(200 * XP.lineAgain);
    const tooMany = await sendEvents(Array.from({ length: 201 }, () => review('again')));
    expect(tooMany.statusCode).toBe(400);
    expect(tooMany.json().error.details[0].path).toBe('events');
    expect((await getProgress()).xp).toBe(200 * XP.lineAgain);
  });

  it('rechaza un cuerpo sin la lista de eventos', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/progress/events', headers: { cookie }, payload: { event: review() } });
    expect(res.statusCode).toBe(400);
  });

  it('los eventos que llegan a la vez se aplican todos (fila bloqueada con FOR UPDATE)', async () => {
    const results = await Promise.all(Array.from({ length: 10 }, () => sendEvents([review('good')])));
    expect(results.map((r) => r.statusCode)).toEqual(Array(10).fill(200));
    const progress = await getProgress();
    expect(progress.xp).toBe(10 * XP.lineGood);
    expect(progress.lines[line.id].reps).toBe(10);
  });

  it.skipIf(!puzzle)('registra intentos de puzzle', async () => {
    const res = await sendEvents([
      { type: 'puzzle_attempt', puzzle: puzzle!.id, solved: false, day: TODAY },
      { type: 'puzzle_attempt', puzzle: puzzle!.id, solved: true, day: TODAY },
    ]);
    expect(res.json().xp).toBe(XP.puzzleFirst);
    expect(res.json().progress.puzzles[puzzle!.id]).toEqual({ solved: true, attempts: 2, firstSolvedAt: TODAY });
  });

  it.skipIf(!examCourse)('la nota de aprobado del examen la pone el contenido, no el cliente', async () => {
    const id = examCourse!.id;
    const below = examPassScore - 0.1;
    const cheat = await sendEvents([{ type: 'exam_result', course: id, score: below, passScore: 0, day: TODAY }]);
    expect(cheat.statusCode).toBe(200);
    expect(cheat.json().xp).toBe(0);
    expect(cheat.json().progress.exams[id]).toEqual({ best: below });

    const pass = await sendEvents([{ type: 'exam_result', course: id, score: 1, passScore: examPassScore, day: TODAY }]);
    expect(pass.json().xp).toBe(XP.examPass);
    expect(pass.json().progress.exams[id]).toEqual({ best: 1, passedAt: TODAY });
  });

  it.skipIf(!noExamCourse)('rechaza un examen de un curso que no tiene examen', async () => {
    const res = await sendEvents([{ type: 'exam_result', course: noExamCourse!.id, score: 1, passScore: 0.5, day: TODAY }]);
    expect(res.statusCode).toBe(400);
    expect(res.json().error.details[0].path).toBe('events[0].course');
  });
});

describe('POST /api/progress/import', () => {
  const yesterday = addDays(TODAY, -1);
  const guest = (): ProgressState =>
    applyEvents(emptyProgress(), [stageDone(yesterday), review('easy', yesterday), { type: 'sparring_result', course: course.id, result: 'draw', day: yesterday }])
      .state;

  it('en una cuenta vacía guarda el progreso de invitado', async () => {
    const res = await importProgress(guest());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ progress: mergeProgress(emptyProgress(), guest()) });
    expect(await getProgress()).toEqual(res.json().progress);
  });

  it('fusiona con mergeProgress el progreso de la cuenta y el importado', async () => {
    const server = (await sendEvents([review('again'), review('good'), { type: 'sparring_result', course: course.id, result: 'win', day: TODAY }])).json()
      .progress as ProgressState;
    const res = await importProgress(guest());
    expect(res.statusCode).toBe(200);
    const merged = res.json().progress;
    expect(merged).toEqual(mergeProgress(server, guest()));
    expect(merged.stages).toHaveProperty(`${course.id}/${stage.id}`);
    expect(merged.xp).toBe(Math.max(server.xp, guest().xp));
    expect(merged.streak.lastDay).toBe(TODAY);
    expect(await getProgress()).toEqual(merged);
  });

  it('admite un progreso mínimo (las colecciones que falten cuentan como vacías)', async () => {
    const res = await importProgress({ v: 1, xp: 250 });
    expect(res.statusCode).toBe(200);
    expect(res.json().progress).toEqual({ ...emptyProgress(), xp: 250 });
  });

  it('descarta las claves desconocidas', async () => {
    const res = await importProgress({ ...guest(), extra: { a: 1 } });
    expect(res.statusCode).toBe(200);
    expect(res.json().progress).not.toHaveProperty('extra');
  });

  const card = { ease: 2.5, interval: 1, due: TODAY, reps: 1, lapses: 0, last: yesterday };
  it.each([
    ['otra versión', { ...emptyProgress(), v: 2 }, 'progress.v'],
    ['XP negativa', { ...emptyProgress(), xp: -5 }, 'progress.xp'],
    ['XP no entera', { ...emptyProgress(), xp: 1.5 }, 'progress.xp'],
    ['fecha futura', { ...emptyProgress(), stages: { 'english/main-line': { completedAt: addDays(TODAY, 10) } } }, 'progress.stages.english/main-line.completedAt'],
    ['fecha inexistente', { ...emptyProgress(), streak: { count: 1, best: 1, lastDay: '2026-02-30' } }, 'progress.streak.lastDay'],
    ['repaso demasiado lejano', { ...emptyProgress(), lines: { 'kid-main': { ...card, due: addDays(TODAY, 500) } } }, 'progress.lines.kid-main.due'],
    ['clave de Object.prototype', { ...emptyProgress(), puzzles: { constructor: { solved: true, attempts: 1 } } }, 'progress.puzzles.constructor'],
    ['clave con caracteres raros', { ...emptyProgress(), exams: { 'a b': { best: 1 } } }, 'progress.exams.a b'],
    ['registro mal formado', { ...emptyProgress(), sparring: { english: { games: 'muchas' } } }, 'progress.sparring.english.games'],
    ['sin progreso', undefined, 'progress'],
  ])('valida la forma: %s', async (_name, progress, path) => {
    const res = await importProgress(progress);
    expect(res.statusCode).toBe(400);
    const { error } = res.json();
    expect(error.code).toBe('validation');
    expect(error.details.map((d: { path: string }) => d.path)).toContain(path);
    expect(await getProgress()).toEqual(emptyProgress());
  });

  it('acepta un repaso programado dentro de los próximos meses', async () => {
    const res = await importProgress({ ...emptyProgress(), lines: { [line.id]: { ...card, due: addDays(TODAY, 180) } } });
    expect(res.statusCode).toBe(200);
  });

  it('rechaza __proto__ en el JSON', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/progress/import',
      headers: { cookie, 'content-type': 'application/json' },
      payload: `{"progress":{"v":1,"xp":0,"stages":{"__proto__":{"completedAt":"${TODAY}"}}}}`,
    });
    expect(res.statusCode).toBe(400);
    expect(errorCode(res)).toBe('validation');
  });

  it('limita el número de entradas', async () => {
    const lines = Object.fromEntries(Array.from({ length: 5001 }, (_, i) => [`line-${i}`, card]));
    const res = await importProgress({ ...emptyProgress(), lines });
    expect(res.statusCode).toBe(400);
    expect(res.json().error.details[0]).toEqual({ path: 'progress.lines', message: 'At most 5000 entries' });
  });

  it('el progreso guardado es JSON en la tabla progress', async () => {
    await importProgress(guest());
    const { rows } = await testPool().query('SELECT data, updated_at FROM progress');
    expect(rows).toHaveLength(1);
    expect(rows[0].data).toEqual(mergeProgress(emptyProgress(), guest()));
  });
});
