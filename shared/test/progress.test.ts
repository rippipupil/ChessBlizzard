import { describe, expect, it } from 'vitest';
import {
  DAILY_GOAL,
  XP,
  applyEvent,
  applyEvents,
  badges,
  courseCompletion,
  currentStreak,
  dailyXp,
  dueLines,
  emptyProgress,
  flattenStages,
  isStageUnlocked,
  levelInfo,
  mergeProgress,
  review,
  stageKey,
  stageStatuses,
  xpForLevel,
  type Course,
  type ProgressEvent,
  type ProgressState,
  type SrsCard,
  type Stage,
} from '../src';

const L = { es: 'x', en: 'x' };
const D1 = '2026-10-13';
const D2 = '2026-10-14';
const D3 = '2026-10-15';

function lineStage(id: string, lines: string[]): Stage {
  return { id, type: 'line', title: L, subtitle: L, intro: L, lines };
}

/** Curso mínimo: 5 etapas en 3 campamentos y 3 líneas practicables más una de "error a evitar". */
function makeCourse(id: string): Course {
  return {
    id,
    name: { es: id, en: id },
    side: 'b',
    eco: '',
    vs: L,
    tagline: L,
    history: L,
    references: [],
    puzzles: [],
    lines: [
      { id: `${id}-a`, name: L, moves: '1.d4 Nf6' },
      { id: `${id}-b`, name: L, moves: '1.c4 e5' },
      { id: `${id}-c`, name: L, moves: '1.Nf3 d5' },
      { id: `${id}-warn`, name: L, moves: '1.e4 f6', practice: false },
    ],
    camps: [
      { id: 'base', name: L, title: L, stages: [lineStage('s1', [`${id}-a`]), lineStage('s2', [`${id}-b`])] },
      { id: 'camp1', name: L, title: L, stages: [lineStage('s3', [`${id}-c`])] },
      {
        id: 'summit',
        name: L,
        title: L,
        stages: [lineStage('s4', [`${id}-a`]), { id: 'exam', type: 'exam', title: L, subtitle: L, intro: L, lines: [`${id}-a`], puzzles: [], passScore: 0.8 }],
      },
    ],
  };
}

const stage = (s: string, day: string, score?: number, course = 'c'): ProgressEvent => ({ type: 'stage_complete', course, stage: s, day, score });
const run = (events: ProgressEvent[], from: ProgressState = emptyProgress()) => applyEvents(from, events).state;
const card = (due: string, ease = 2.5): SrsCard => ({ ease, interval: 3, due, reps: 2, lapses: 0, last: '2026-10-01' });

describe('XP de cada evento', () => {
  it('stage_complete: 20 XP la primera vez, 0 al repetir; guarda la primera fecha y la mejor nota', () => {
    const a = applyEvent(emptyProgress(), stage('s1', D1, 60));
    expect(a.xp).toBe(XP.stage);
    expect(XP.stage).toBe(20);
    expect(a.state.stages[stageKey('c', 's1')]).toEqual({ completedAt: D1, score: 60 });
    const b = applyEvent(a.state, stage('s1', D2, 90));
    expect(b.xp).toBe(0);
    expect(b.state.stages['c/s1']).toEqual({ completedAt: D1, score: 90 });
    const c = applyEvent(b.state, stage('s1', D3, 40));
    expect(c.state.stages['c/s1'].score).toBe(90);
    expect(c.state.xp).toBe(20);
  });

  it('line_review: 1, 3, 5 y 5 XP según la nota, y guarda la tarjeta de repaso', () => {
    const xp = (['again', 'hard', 'good', 'easy'] as const).map((grade) => {
      const r = applyEvent(emptyProgress(), { type: 'line_review', line: 'kid-main', grade, day: D1 });
      expect(r.state.lines['kid-main']).toEqual(review(undefined, grade, D1));
      return r.xp;
    });
    expect(xp).toEqual([XP.lineAgain, XP.lineHard, XP.lineGood, XP.lineGood]);
    expect(xp).toEqual([1, 3, 5, 5]);
  });

  it('line_review: cada repaso parte de la tarjeta anterior', () => {
    const s = run([
      { type: 'line_review', line: 'l', grade: 'good', day: D1 },
      { type: 'line_review', line: 'l', grade: 'good', day: D2 },
    ]);
    expect(s.lines.l).toEqual(review(review(undefined, 'good', D1), 'good', D2));
    expect(s.lines.l.interval).toBe(3);
  });

  it('puzzle_attempt: 10 XP el primer acierto, 2 los siguientes y 0 los fallos', () => {
    const steps: Array<[boolean, string]> = [
      [false, D1],
      [true, D2],
      [true, D3],
      [false, D3],
    ];
    let state = emptyProgress();
    const xp: number[] = [];
    for (const [solved, day] of steps) {
      const r = applyEvent(state, { type: 'puzzle_attempt', puzzle: 'kid-p1', solved, day });
      xp.push(r.xp);
      state = r.state;
    }
    expect(xp).toEqual([0, XP.puzzleFirst, XP.puzzleRepeat, 0]);
    expect(state.puzzles['kid-p1']).toEqual({ solved: true, attempts: 4, firstSolvedAt: D2 });
  });

  it('exam_result: 100 XP solo la primera vez que se aprueba; guarda la mejor nota', () => {
    const exam = (score: number, day: string): ProgressEvent => ({ type: 'exam_result', course: 'c', score, passScore: 0.8, day });
    const a = applyEvent(emptyProgress(), exam(0.6, D1));
    expect(a.xp).toBe(0);
    expect(a.state.exams.c).toEqual({ best: 0.6 });
    const b = applyEvent(a.state, exam(0.85, D2));
    expect(b.xp).toBe(XP.examPass);
    expect(b.state.exams.c).toEqual({ best: 0.85, passedAt: D2 });
    const c = applyEvent(b.state, exam(0.95, D3));
    expect(c.xp).toBe(0);
    expect(c.state.exams.c).toEqual({ best: 0.95, passedAt: D2 });
    expect(applyEvent(c.state, exam(0.7, D3)).state.exams.c.best).toBe(0.95);
    // Justo la nota de aprobado también aprueba.
    expect(applyEvent(emptyProgress(), exam(0.8, D1)).xp).toBe(100);
  });

  it('sparring_result: 30, 15 y 5 XP, y lleva la cuenta de partidas', () => {
    let state = emptyProgress();
    const xp: number[] = [];
    for (const result of ['win', 'draw', 'loss', 'win'] as const) {
      const r = applyEvent(state, { type: 'sparring_result', course: 'c', result, day: D1 });
      xp.push(r.xp);
      state = r.state;
    }
    expect(xp).toEqual([XP.sparringWin, XP.sparringDraw, XP.sparringLoss, XP.sparringWin]);
    expect(xp).toEqual([30, 15, 5, 30]);
    expect(state.sparring.c).toEqual({ games: 4, wins: 2, draws: 1, losses: 1 });
    expect(state.xp).toBe(80);
  });

  it('applyEvent y applyEvents no modifican el estado original y suman la XP', () => {
    const start = run([stage('s1', D1)]);
    const frozen = structuredClone(start);
    applyEvent(start, stage('s2', D2));
    const r = applyEvents(start, [stage('s2', D2), { type: 'puzzle_attempt', puzzle: 'p', solved: true, day: D2 }, stage('s2', D2)]);
    expect(start).toEqual(frozen);
    expect(r.xp).toBe(30);
    expect(r.state.xp).toBe(50);
    expect(applyEvents(start, [])).toEqual({ state: start, xp: 0 });
  });
});

describe('objetivo diario', () => {
  it('suma la XP del día y empieza de cero al día siguiente', () => {
    const s = run([stage('s1', D1), stage('s2', D1), { type: 'line_review', line: 'l', grade: 'good', day: D1 }]);
    expect(s.daily).toEqual({ day: D1, xp: 45 });
    expect(dailyXp(s, D1)).toBe(45);
    expect(dailyXp(s, D2)).toBe(0);
    const next = run([stage('s3', D2)], s);
    expect(next.daily).toEqual({ day: D2, xp: 20 });
    expect(next.xp).toBe(65);
  });

  it('el objetivo es de 50 XP: tres etapas en un día lo cumplen', () => {
    expect(DAILY_GOAL).toBe(50);
    const s = run([stage('s1', D1), stage('s2', D1)]);
    expect(dailyXp(s, D1)).toBeLessThan(DAILY_GOAL);
    expect(dailyXp(run([stage('s3', D1)], s), D1)).toBeGreaterThanOrEqual(DAILY_GOAL);
  });

  it('los eventos que no dan XP no tocan el día', () => {
    const s = run([stage('s1', D1), { type: 'puzzle_attempt', puzzle: 'p', solved: false, day: D2 }, stage('s1', D2)]);
    expect(s.daily).toEqual({ day: D1, xp: 20 });
  });

  it('un evento atrasado (sincronización tardía) no borra el progreso de hoy', () => {
    const s = run([stage('s1', D3), stage('s2', D2)]);
    expect(s.xp).toBe(40);
    expect(s.daily).toEqual({ day: D3, xp: 20 });
    expect(dailyXp(s, D3)).toBe(20);
  });
});

describe('racha', () => {
  it('empieza en 1 y crece con cada día seguido de actividad', () => {
    expect(run([stage('s1', D1)]).streak).toEqual({ count: 1, best: 1, lastDay: D1 });
    expect(run([stage('s1', D1), stage('s2', D1)]).streak.count).toBe(1);
    expect(run([stage('s1', D1), stage('s2', D2), stage('s3', D3)]).streak).toEqual({ count: 3, best: 3, lastDay: D3 });
  });

  it('se rompe si se salta un día, pero la mejor racha se conserva', () => {
    const s = run([stage('s1', D1), stage('s2', D2), stage('s3', D3), stage('s4', '2026-10-17')]);
    expect(s.streak).toEqual({ count: 1, best: 3, lastDay: '2026-10-17' });
    const again = run([stage('exam', '2026-10-18')], s);
    expect(again.streak).toEqual({ count: 2, best: 3, lastDay: '2026-10-18' });
  });

  it('cruza fines de mes y de año', () => {
    const s = run([stage('s1', '2026-12-31'), stage('s2', '2027-01-01'), stage('s3', '2027-01-02')]);
    expect(s.streak).toEqual({ count: 3, best: 3, lastDay: '2027-01-02' });
  });

  it('un evento atrasado no cambia la racha', () => {
    const s = run([stage('s1', D3), stage('s2', D1)]);
    expect(s.streak).toEqual({ count: 1, best: 1, lastDay: D3 });
  });

  it('los eventos sin XP no cuentan como actividad', () => {
    const s = run([stage('s1', D1), { type: 'puzzle_attempt', puzzle: 'p', solved: false, day: D2 }]);
    expect(s.streak.lastDay).toBe(D1);
    expect(currentStreak(s, D3)).toBe(0);
  });

  it('currentStreak: vale hoy y mañana; si pasa un día entero sin actividad, se pierde', () => {
    const s = run([stage('s1', D1), stage('s2', D2)]);
    expect(currentStreak(s, D2)).toBe(2);
    expect(currentStreak(s, D3)).toBe(2);
    expect(currentStreak(s, '2026-10-16')).toBe(0);
    expect(currentStreak(emptyProgress(), D3)).toBe(0);
  });

  it('currentStreak: una fecha de otra zona horaria (un día por delante) no rompe la racha', () => {
    const s = run([stage('s1', D2), stage('s2', D3)]);
    expect(currentStreak(s, D2)).toBe(2);
  });
});

describe('mergeProgress', () => {
  function withData(patch: Partial<ProgressState>): ProgressState {
    return { ...emptyProgress(), ...patch };
  }

  it('une etapas, puzzles, exámenes y sparring quedándose con lo mejor de cada uno', () => {
    const guest = withData({
      xp: 200,
      stages: { 'c/s1': { completedAt: D2, score: 50 }, 'c/s2': { completedAt: D3 } },
      puzzles: { p1: { solved: false, attempts: 3 }, p2: { solved: true, attempts: 1, firstSolvedAt: D3 } },
      exams: { c: { best: 0.9, passedAt: D3 } },
      sparring: { c: { games: 1, wins: 1, draws: 0, losses: 0 } },
    });
    const account = withData({
      xp: 1000,
      stages: { 'c/s1': { completedAt: D1, score: 80 } },
      puzzles: { p1: { solved: true, attempts: 1, firstSolvedAt: D1 }, p2: { solved: true, attempts: 2, firstSolvedAt: D1 } },
      exams: { c: { best: 0.7 }, k: { best: 0.85, passedAt: D1 } },
      sparring: { c: { games: 3, wins: 0, draws: 1, losses: 2 } },
    });
    const merged = mergeProgress(account, guest);
    expect(merged.xp).toBe(1000);
    expect(merged.stages).toEqual({ 'c/s1': { completedAt: D1, score: 80 }, 'c/s2': { completedAt: D3 } });
    expect(merged.puzzles).toEqual({
      p1: { solved: true, attempts: 3, firstSolvedAt: D1 },
      p2: { solved: true, attempts: 2, firstSolvedAt: D1 },
    });
    expect(merged.exams).toEqual({ c: { best: 0.9, passedAt: D3 }, k: { best: 0.85, passedAt: D1 } });
    expect(merged.sparring).toEqual({ c: { games: 3, wins: 0, draws: 1, losses: 2 } });
    expect(merged.v).toBe(1);
  });

  it('en cada línea gana el repaso más reciente (o, el mismo día, el de más repeticiones)', () => {
    const first = review(undefined, 'good', D1);
    const second = review(first, 'good', D2);
    const a = withData({ lines: { l1: first, l2: review(undefined, 'again', D3), l3: review(undefined, 'good', D2) } });
    const b = withData({ lines: { l1: second, l3: review(review(undefined, 'good', D2), 'good', D2) } });
    const merged = mergeProgress(a, b);
    expect(merged.lines.l1).toEqual(second);
    expect(merged.lines.l2).toEqual(a.lines.l2);
    expect(merged.lines.l3.reps).toBe(2);
    expect(mergeProgress(b, a).lines).toEqual(merged.lines);
  });

  it('la racha del invitado de hoy continúa la de la cuenta hasta ayer', () => {
    const account = withData({ streak: { count: 10, best: 12, lastDay: D2 } });
    const guest = withData({ streak: { count: 1, best: 1, lastDay: D3 } });
    expect(mergeProgress(account, guest).streak).toEqual({ count: 11, best: 12, lastDay: D3 });
    expect(mergeProgress(guest, account).streak).toEqual({ count: 11, best: 12, lastDay: D3 });
    const shorter = withData({ streak: { count: 10, best: 10, lastDay: D2 } });
    expect(mergeProgress(shorter, guest).streak).toEqual({ count: 11, best: 11, lastDay: D3 });
  });

  it('rachas que acaban el mismo día o se solapan se unen sin contar dos veces', () => {
    const a = withData({ streak: { count: 2, best: 2, lastDay: D3 } });
    const b = withData({ streak: { count: 5, best: 7, lastDay: D3 } });
    expect(mergeProgress(a, b).streak).toEqual({ count: 5, best: 7, lastDay: D3 });
    expect(mergeProgress(b, a).streak).toEqual({ count: 5, best: 7, lastDay: D3 });
    // 10-10…10-14 y 10-13…10-15 -> 10-10…10-15.
    const c = withData({ streak: { count: 5, best: 5, lastDay: D2 } });
    const d = withData({ streak: { count: 3, best: 3, lastDay: D3 } });
    expect(mergeProgress(c, d).streak).toEqual({ count: 6, best: 6, lastDay: D3 });
  });

  it('si entre las dos rachas hay un día sin actividad, solo cuenta la más reciente', () => {
    const old = withData({ streak: { count: 10, best: 10, lastDay: '2026-10-12' } });
    const recent = withData({ streak: { count: 2, best: 2, lastDay: D3 } });
    expect(mergeProgress(old, recent).streak).toEqual({ count: 2, best: 10, lastDay: D3 });
    expect(mergeProgress(recent, emptyProgress()).streak).toEqual(recent.streak);
  });

  it('objetivo diario: se queda el del día más reciente y, si es el mismo día, el mayor', () => {
    const a = withData({ daily: { day: D3, xp: 30 } });
    const b = withData({ daily: { day: D3, xp: 45 } });
    const c = withData({ daily: { day: D2, xp: 80 } });
    expect(mergeProgress(a, b).daily).toEqual({ day: D3, xp: 45 });
    expect(mergeProgress(b, a).daily).toEqual({ day: D3, xp: 45 });
    expect(mergeProgress(c, a).daily).toEqual({ day: D3, xp: 30 });
    expect(mergeProgress(emptyProgress(), c).daily).toEqual({ day: D2, xp: 80 });
  });

  it('es conmutativa e idempotente, y unir con un progreso vacío no cambia nada', () => {
    const a = run([
      stage('s1', D1, 70),
      { type: 'line_review', line: 'l1', grade: 'good', day: D1 },
      { type: 'puzzle_attempt', puzzle: 'p1', solved: false, day: D1 },
      stage('s2', D2),
      { type: 'line_review', line: 'l1', grade: 'hard', day: D2 },
      { type: 'sparring_result', course: 'c', result: 'win', day: D2 },
    ]);
    const b = run([
      stage('s1', D2, 90),
      { type: 'puzzle_attempt', puzzle: 'p1', solved: true, day: D2 },
      { type: 'line_review', line: 'l2', grade: 'easy', day: D3 },
      { type: 'exam_result', course: 'c', score: 0.9, passScore: 0.8, day: D3 },
    ]);
    const ab = mergeProgress(a, b);
    expect(ab).toEqual(mergeProgress(b, a));
    expect(mergeProgress(ab, ab)).toEqual(ab);
    expect(mergeProgress(ab, b)).toEqual(ab);
    expect(mergeProgress(a, a)).toEqual(a);
    expect(mergeProgress(a, emptyProgress())).toEqual(a);
    expect(mergeProgress(emptyProgress(), a)).toEqual(a);
    expect(ab.streak).toEqual({ count: 3, best: 3, lastDay: D3 });
    expect(ab.stages['c/s1']).toEqual({ completedAt: D1, score: 90 });
  });

  it('no modifica los progresos de entrada', () => {
    const a = run([stage('s1', D1)]);
    const b = run([stage('s1', D2, 50)]);
    const [ca, cb] = [structuredClone(a), structuredClone(b)];
    const merged = mergeProgress(a, b);
    merged.stages['c/s1'].score = 0;
    expect(a).toEqual(ca);
    expect(b).toEqual(cb);
  });
});

describe('etapas y desbloqueo', () => {
  const course = makeCourse('c');
  const ids = (state: ProgressState) => stageStatuses(course, state);

  it('flattenStages recorre los campamentos en orden', () => {
    expect(flattenStages(course).map((f) => [f.stage.id, f.campIndex, f.index])).toEqual([
      ['s1', 0, 0],
      ['s2', 0, 1],
      ['s3', 1, 2],
      ['s4', 2, 3],
      ['exam', 2, 4],
    ]);
  });

  it('sin progreso solo está abierta la primera etapa', () => {
    expect(ids(emptyProgress())).toEqual(['current', 'locked', 'locked', 'locked', 'locked']);
    expect(isStageUnlocked(course, 's1', emptyProgress())).toBe(true);
    expect(isStageUnlocked(course, 's2', emptyProgress())).toBe(false);
  });

  it('se desbloquean en orden, también al pasar de un campamento al siguiente', () => {
    const s = run([stage('s1', D1), stage('s2', D1)]);
    expect(ids(s)).toEqual(['done', 'done', 'current', 'locked', 'locked']);
    expect(isStageUnlocked(course, 's2', s)).toBe(true);
    expect(isStageUnlocked(course, 's3', s)).toBe(true);
    expect(isStageUnlocked(course, 's4', s)).toBe(false);
    expect(isStageUnlocked(course, 'no-existe', s)).toBe(false);
    const all = run(['s3', 's4', 'exam'].map((id) => stage(id, D2)), s);
    expect(ids(all)).toEqual(['done', 'done', 'done', 'done', 'done']);
  });

  it('una etapa hecha fuera de orden cuenta como hecha, pero el camino sigue en la primera pendiente', () => {
    const s = run([stage('s3', D1)]);
    expect(ids(s)).toEqual(['current', 'locked', 'done', 'locked', 'locked']);
    expect(isStageUnlocked(course, 's3', s)).toBe(true);
    expect(isStageUnlocked(course, 's2', s)).toBe(false);
  });

  it('las etapas de otro curso no cuentan', () => {
    const s = run([stage('s1', D1, undefined, 'otro')]);
    expect(ids(s)).toEqual(['current', 'locked', 'locked', 'locked', 'locked']);
  });

  it('courseCompletion cuenta las etapas hechas', () => {
    expect(courseCompletion(course, emptyProgress())).toEqual({ done: 0, total: 5, ratio: 0 });
    expect(courseCompletion(course, run([stage('s1', D1), stage('s3', D1)]))).toEqual({ done: 2, total: 5, ratio: 0.4 });
  });
});

describe('dueLines', () => {
  const c = makeCourse('c');
  const o = makeCourse('o');
  const state = withLines({
    'c-a': card(D2, 2.5),
    'c-b': card(D1, 2.1),
    'c-c': card('2026-10-20'),
    'c-warn': card(D1),
    'o-a': card(D2, 1.9),
    fantasma: card(D1),
  });
  function withLines(lines: Record<string, SrsCard>): ProgressState {
    return { ...emptyProgress(), lines };
  }

  it('devuelve las líneas aprendidas y vencidas, las más atrasadas primero y, a igual fecha, las más difíciles', () => {
    expect(dueLines([c, o], state, D3).map((d) => d.lineId)).toEqual(['c-b', 'o-a', 'c-a']);
    expect(dueLines([c, o], state, D3).map((d) => d.course.id)).toEqual(['c', 'o', 'c']);
    expect(dueLines([c, o], state, D3)[0].card).toEqual(state.lines['c-b']);
  });

  it('no incluye líneas sin aprender, que aún no tocan, de "error a evitar" o de otros cursos', () => {
    expect(dueLines([c], state, D3).map((d) => d.lineId)).toEqual(['c-b', 'c-a']);
    expect(dueLines([c, o], state, '2026-10-12')).toEqual([]);
    expect(dueLines([c, o], state, D1).map((d) => d.lineId)).toEqual(['c-b']);
    expect(dueLines([c, o], emptyProgress(), D3)).toEqual([]);
    expect(dueLines([c, o], state, '2026-10-20').map((d) => d.lineId)).toEqual(['c-b', 'o-a', 'c-a', 'c-c']);
  });
});

describe('niveles', () => {
  it('xpForLevel: 0, 100, 300, 600, 1000, 1500…', () => {
    expect([1, 2, 3, 4, 5, 6].map(xpForLevel)).toEqual([0, 100, 300, 600, 1000, 1500]);
  });

  it('levelInfo da el nivel, sus límites y el progreso hacia el siguiente', () => {
    expect(levelInfo(0)).toEqual({ level: 1, base: 0, next: 100, progress: 0 });
    expect(levelInfo(99)).toEqual({ level: 1, base: 0, next: 100, progress: 0.99 });
    expect(levelInfo(100)).toEqual({ level: 2, base: 100, next: 300, progress: 0 });
    expect(levelInfo(450)).toEqual({ level: 3, base: 300, next: 600, progress: 0.5 });
    expect(levelInfo(1000).level).toBe(5);
    expect(levelInfo(1499).level).toBe(5);
    expect(levelInfo(1500).level).toBe(6);
  });
});

describe('insignias', () => {
  const courses = [makeCourse('c'), makeCourse('k')];
  const earned = (state: ProgressState, list: Course[] = courses) =>
    badges(state, list)
      .filter((b) => b.earned)
      .map((b) => b.id);

  it('sin progreso no hay ninguna', () => {
    expect(badges(emptyProgress(), courses).map((b) => b.id)).toEqual(['first-stage', 'streak-7', 'puzzles-10', 'first-win', 'first-summit', 'all-summits']);
    expect(earned(emptyProgress())).toEqual([]);
  });

  it('primera etapa, racha de 7 días y 10 puzzles resueltos', () => {
    expect(earned(run([stage('s1', D1)]))).toEqual(['first-stage']);
    const days = Array.from({ length: 7 }, (_, i) => `2026-10-0${i + 1}`);
    expect(earned(run(days.map((d) => ({ type: 'line_review', line: 'l', grade: 'good', day: d }) as ProgressEvent)))).toEqual(['streak-7']);
    const six = run(days.slice(0, 6).map((d) => ({ type: 'line_review', line: 'l', grade: 'good', day: d }) as ProgressEvent));
    expect(earned(six)).toEqual([]);
    const puzzles = (n: number) => run(Array.from({ length: n }, (_, i) => ({ type: 'puzzle_attempt', puzzle: `p${i}`, solved: true, day: D1 }) as ProgressEvent));
    expect(earned(puzzles(9))).toEqual([]);
    expect(earned(puzzles(10))).toEqual(['puzzles-10']);
    const failed = run(Array.from({ length: 10 }, (_, i) => ({ type: 'puzzle_attempt', puzzle: `p${i}`, solved: i > 0, day: D1 }) as ProgressEvent));
    expect(earned(failed)).toEqual([]);
  });

  it('primera victoria en sparring (las tablas no cuentan)', () => {
    expect(earned(run([{ type: 'sparring_result', course: 'c', result: 'draw', day: D1 }]))).toEqual([]);
    expect(earned(run([{ type: 'sparring_result', course: 'c', result: 'win', day: D1 }]))).toEqual(['first-win']);
  });

  it('primera cumbre y todas las cumbres', () => {
    const exam = (course: string, score: number): ProgressEvent => ({ type: 'exam_result', course, score, passScore: 0.8, day: D1 });
    expect(earned(run([exam('c', 0.5)]))).toEqual([]);
    expect(earned(run([exam('c', 0.9)]))).toEqual(['first-summit']);
    expect(earned(run([exam('c', 0.9), exam('k', 0.8)]))).toEqual(['first-summit', 'all-summits']);
    expect(earned(run([exam('c', 0.9)]), [courses[0]])).toEqual(['first-summit', 'all-summits']);
    expect(earned(run([exam('c', 0.9)]), [])).toEqual(['first-summit']);
  });
});
