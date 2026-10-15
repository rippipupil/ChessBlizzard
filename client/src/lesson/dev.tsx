// Página de desarrollo del núcleo de ajedrez (solo en local: /dev-lesson.html).
// No forma parte de la app: la app monta estos componentes en sus propias rutas.
//
//   ?view=stage&course=kings-indian&stage=main-line   una etapa (StagePlayer)
//   ?view=review                                      repaso de hoy (ReviewSession)
//   ?view=puzzle&course=kings-indian&puzzle=<id>      un puzzle suelto (PuzzleSolver)
//   ?view=analysis                                    tablero de análisis
//   ?view=board                                       laboratorio del tablero y del motor
//   (sin parámetros)                                  índice con todas las etapas
//
// Ajustes rápidos por URL: &theme=neon &mode=light &locale=en &notation=en
import { StrictMode, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { Chess } from 'chess.js';
import { START_FEN, addDays, courses, emptyProgress, flattenStages, getCourse, type ProgressState } from '@chessblizzard/shared';
import { ProgressProvider, useProgress } from '../state/progress';
import { SettingsProvider, useSettings } from '../state/settings';
import { Backdrop } from '../theme/Backdrop';
import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/app.css';
import { Board, checkSquare, legalDests, type Orientation } from '../board';
import { EvalBar, analysisScore, formatScore, getEngine, useAnalysis } from '../engine';
import { AnalysisBoard, PuzzleSolver, ReviewSession, StagePlayer } from './index';

const params = new URLSearchParams(location.search);

function nav(next: Record<string, string | undefined>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(next)) if (v) p.set(k, v);
  location.search = p.toString();
}

function BoardLab() {
  const [fen, setFen] = useState(START_FEN);
  const [last, setLast] = useState<[string, string] | null>(null);
  const [orientation, setOrientation] = useState<Orientation>('white');
  const dests = useMemo(() => legalDests(fen), [fen]);
  const turn = fen.split(' ')[1] as 'w' | 'b';
  const analysis = useAnalysis(fen, { multipv: 3, depth: 14 });
  return (
    <div style={{ display: 'flex', gap: 16, padding: 16, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', gap: 8, width: 'min(560px, 100%)' }}>
        <EvalBar score={analysisScore(analysis)} orientation={orientation} thinking={analysis.running} />
        <Board
          fen={fen}
          orientation={orientation}
          movable={{ color: turn, dests }}
          lastMove={last}
          check={checkSquare(fen)}
          arrows={[
            { from: 'g1', to: 'f3', kind: 'plan' },
            { from: 'e7', to: 'e5', kind: 'rival' },
            { from: 'b1', to: 'c3', kind: 'hint' },
            { from: 'd2', to: 'd4', kind: 'best' },
          ]}
          marks={['d5', 'e4']}
          onMove={(from, to, promotion) => {
            const chess = new Chess(fen);
            try {
              chess.move({ from, to, promotion: promotion ?? 'q' });
              setFen(chess.fen());
              setLast([from, to]);
            } catch {
              // Ilegal: no hacemos nada.
            }
          }}
        />
      </div>
      <div data-testid="engine" style={{ fontFamily: 'monospace', fontSize: 13, minWidth: 260 }}>
        <button type="button" onClick={() => setOrientation((o) => (o === 'white' ? 'black' : 'white'))}>
          Girar
        </button>{' '}
        <button type="button" onClick={() => setFen(START_FEN)}>
          Reiniciar
        </button>{' '}
        <button type="button" onClick={() => setFen('8/P7/8/8/8/8/6k1/4K3 w - - 0 1')}>
          Promoción
        </button>
        <p data-testid="depth">
          profundidad {analysis.depth} {analysis.running ? '…' : '✓'}
        </p>
        {analysis.lines.map((l) => (
          <p key={l.multipv} data-testid="pv">
            {formatScore(l, 'es', { digits: 2 })} {l.san.join(' ')}
          </p>
        ))}
        {analysis.error && <p>Error: {analysis.error}</p>}
      </div>
    </div>
  );
}

/** Progreso de prueba: líneas aprendidas con repaso pendiente hoy. */
function seededProgress(today: string, base: ProgressState): ProgressState {
  const s = structuredClone(base);
  const lines = ['kid-main', 'kid-bayonet', 'kid-samisch'];
  const eng = getCourse('english')?.lines.filter((l) => l.practice !== false).slice(0, 2) ?? [];
  for (const id of [...lines, ...eng.map((l) => l.id)]) {
    s.lines[id] = { ease: 2.5, interval: 1, due: today, reps: 1, lapses: 0, last: addDays(today, -1) };
  }
  return s;
}

function DevBar() {
  const { settings, update } = useSettings();
  const { state, today, replace } = useProgress();
  const [open, setOpen] = useState(params.get('bar') !== '0');
  const style = { fontSize: 12, padding: '2px 4px' };
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} style={{ position: 'fixed', right: 8, bottom: 8, zIndex: 99, ...style }}>
        dev
      </button>
    );
  return (
    <div
      data-testid="devbar"
      style={{
        position: 'fixed',
        right: 8,
        bottom: 8,
        zIndex: 99,
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
        alignItems: 'center',
        padding: 6,
        borderRadius: 8,
        background: 'var(--s2)',
        border: '1px solid var(--bd)',
        fontSize: 12,
        maxWidth: 'calc(100vw - 16px)',
      }}
    >
      <a href="?" style={{ color: 'var(--accent-text)' }}>
        índice
      </a>
      <select style={style} value={settings.theme} onChange={(e) => update({ theme: e.target.value as 'blizzard' | 'neon' })}>
        <option value="blizzard">blizzard</option>
        <option value="neon">neon</option>
      </select>
      <select style={style} value={settings.colorMode} onChange={(e) => update({ colorMode: e.target.value as 'dark' | 'light' })}>
        <option value="dark">dark</option>
        <option value="light">light</option>
      </select>
      <select style={style} value={settings.locale} onChange={(e) => update({ locale: e.target.value as 'es' | 'en' })}>
        <option value="es">es</option>
        <option value="en">en</option>
      </select>
      <select style={style} value={settings.notation} onChange={(e) => update({ notation: e.target.value as 'es' | 'en' })}>
        <option value="es">notación es</option>
        <option value="en">notación en</option>
      </select>
      <label>
        <input type="checkbox" checked={settings.sounds} onChange={(e) => update({ sounds: e.target.checked })} /> sonido
      </label>
      <button type="button" style={style} onClick={() => replace(seededProgress(today, state))}>
        sembrar repasos
      </button>
      <button type="button" style={style} onClick={() => replace(emptyProgress())}>
        borrar progreso
      </button>
      <span>XP {state.xp}</span>
      <button type="button" style={style} onClick={() => setOpen(false)}>
        ×
      </button>
    </div>
  );
}

function Index() {
  return (
    <div style={{ padding: 24, display: 'grid', gap: 24, maxWidth: 1100 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', margin: 0 }}>ChessBlizzard · núcleo de ajedrez</h1>
      <p style={{ margin: 0 }}>
        <a href="?view=review">Repaso</a> · <a href="?view=analysis">Análisis</a> · <a href="?view=board">Laboratorio del tablero</a>
      </p>
      {courses.map((course) => (
        <section key={course.id}>
          <h2 style={{ fontFamily: 'var(--font-display)', margin: '0 0 8px' }}>{course.name.es}</h2>
          <ol style={{ margin: 0, display: 'grid', gap: 4 }}>
            {flattenStages(course).map(({ stage }) => (
              <li key={stage.id}>
                <a href={`?view=stage&course=${course.id}&stage=${stage.id}`}>
                  {stage.title.es} <small>({stage.type})</small>
                </a>
              </li>
            ))}
          </ol>
          {course.puzzles.length > 0 && (
            <p style={{ margin: '8px 0 0' }}>
              Puzzles:{' '}
              {course.puzzles.slice(0, 12).map((p) => (
                <a key={p.id} href={`?view=puzzle&course=${course.id}&puzzle=${p.id}`} style={{ marginRight: 8 }}>
                  {p.id}
                </a>
              ))}
            </p>
          )}
        </section>
      ))}
    </div>
  );
}

function Frame({ children }: { children: ReactNode }) {
  return <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>{children}</div>;
}

function DevApp() {
  const { update } = useSettings();
  // Ajustes desde la URL (para las capturas).
  useEffect(() => {
    const patch: Record<string, string> = {};
    for (const k of ['theme', 'locale', 'notation'] as const) {
      const v = params.get(k);
      if (v) patch[k] = v;
    }
    const mode = params.get('mode');
    if (mode) patch.colorMode = mode;
    if (Object.keys(patch).length) update(patch);
    (window as unknown as { cbEngine: unknown }).cbEngine = getEngine();
    // Solo al cargar la página.
  }, []);

  const view = params.get('view');
  const course = getCourse(params.get('course') ?? 'kings-indian') ?? courses[0];
  let content: ReactNode;
  if (view === 'stage') {
    const stage = flattenStages(course).find((f) => f.stage.id === params.get('stage'))?.stage ?? flattenStages(course)[0].stage;
    content = <StagePlayer key={`${course.id}/${stage.id}`} course={course} stage={stage} onExit={() => nav({})} />;
  } else if (view === 'review') {
    content = <ReviewSession onExit={() => nav({})} />;
  } else if (view === 'puzzle') {
    const puzzle = course.puzzles.find((p) => p.id === params.get('puzzle')) ?? course.puzzles[0];
    content = puzzle ? (
      <Frame>
        <PuzzleSolver puzzle={puzzle} course={course} onDone={(solved) => alert(solved ? 'resuelto' : 'no resuelto')} />
      </Frame>
    ) : (
      <Frame>Sin puzzles</Frame>
    );
  } else if (view === 'analysis') {
    content = (
      <Frame>
        <AnalysisBoard />
      </Frame>
    );
  } else if (view === 'board') {
    content = <BoardLab />;
  } else {
    content = <Index />;
  }
  return (
    <>
      <Backdrop />
      <div style={{ position: 'relative', zIndex: 1 }}>{content}</div>
      <DevBar />
    </>
  );
}

// Con la recarga en caliente de Vite el módulo puede volver a ejecutarse: reutilizamos la raíz.
const w = window as unknown as { cbRoot?: ReturnType<typeof createRoot> };
w.cbRoot ??= createRoot(document.getElementById('root')!);
w.cbRoot.render(
  <StrictMode>
    <SettingsProvider>
      <ProgressProvider>
        <DevApp />
      </ProgressProvider>
    </SettingsProvider>
  </StrictMode>,
);
