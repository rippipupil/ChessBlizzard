# Arquitectura de ChessBlizzard

App web para aprender aperturas de ajedrez: cursos con forma de montaña, práctica con
repetición espaciada, puzzles, sparring y análisis con Stockfish, y cuentas de usuario.

## Estructura (npm workspaces)

```
shared/   TypeScript puro, sin dependencias de navegador ni de servidor.
  src/types.ts        Tipos del contenido (Course, Camp, Stage, LineDef, Puzzle...)
  src/notation.ts     SAN inglés -> notación española (C A T D R) y texto con [jugadas]
  src/lines.ts        Reproducir líneas (chess.js), árbol de repertorio, flechas
  src/srs.ts          Repetición espaciada (SM-2 simplificado), fechas AAAA-MM-DD
  src/progress.ts     Estado de progreso + reductor de eventos (XP, racha, desbloqueos)
  src/lookup.ts       findLine / findPuzzle / findStage
  src/content/        Cursos: english.ts, kings-indian.ts, dragon.ts
  src/content/puzzles/ Puzzles de cada curso (verificados con Stockfish)
  scripts/engine.ts   Stockfish en Node para scripts
  scripts/audit-content.ts  Revisión de las líneas con Stockfish
server/   Fastify + PostgreSQL. Cuentas, sesiones y progreso.
client/   Vite + React 19 + TypeScript. La web.
docs/     Este documento.
```

## Reglas del equipo

- Cada agente trabaja solo en sus carpetas. No edites archivos de otro sin que el
  coordinador lo pida.
- No ejecutes `npm install` ni cambies `package.json` o `package-lock.json`. Si
  necesitas una dependencia, pídela en tu informe final.
- No hagas commits, push, checkout, reset ni stash. El coordinador integra y sube.
- Stockfish: un solo motor a la vez por agente, profundidad 16 como máximo salvo
  verificaciones puntuales (la máquina tiene 4 núcleos).
- Textos de la interfaz en español e inglés. Comentarios del código en español.
- Las jugadas se guardan siempre en SAN inglés (`Nf3`, `O-O`). La interfaz las
  traduce con `localizeSan` / `parseRichText` de `shared`.
- No copies texto de libros: las explicaciones son propias. Los libros se citan
  como lectura recomendada (`references`).

## Contenido (shared)

- Cada curso tiene 3 campamentos: base (ideas, línea principal, práctica),
  campamento 1 (las alternativas del rival, etapas `branch`) y cumbre (trampas,
  puzzles, sparring y examen).
- `LineDef.moves` empieza siempre desde la posición inicial.
- `notes` se indexa por `"6...e5"` / `"9.Ne1"` (número, puntos y SAN exacta).
- Flechas: `"f7f5"`. En `arrows` van las del plan del alumno y en `rival` las del rival.
- `practice: false` marca líneas que solo se estudian (errores del alumno que hay
  que evitar). No entran en práctica, sparring ni examen.
- El repertorio debe ser coherente: en cada posición donde le toca al alumno, todas
  las líneas recomiendan la misma jugada (`buildRepertoire(course).conflicts` vacío).
- Comprobaciones: `npm test -w shared` (legalidad, notas, coherencia) y
  `npm run audit -w shared -- --course <id>` (Stockfish).

## API del servidor

Todas las respuestas son JSON. Los errores tienen la forma
`{ "error": { "code": "...", "message": "...", "details"?: [{ "path", "message" }] } }`
con códigos `validation` (el único que trae `details`), `email_taken`,
`invalid_credentials`, `unauthorized`, `forbidden`, `rate_limited`, `not_found` e
`internal`. En `/api/progress/events`, un solo evento inválido rechaza el lote entero.

La sesión va en la cookie `cb_session` (httpOnly, SameSite=Lax, Secure en producción).

| Método | Ruta | Cuerpo | Respuesta |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | `{ email, password, displayName }` | `201 { user }` |
| POST | `/api/auth/login` | `{ email, password }` | `200 { user }` |
| POST | `/api/auth/logout` | – | `204` |
| GET | `/api/auth/me` | – | `200 { user }` o `401` |
| PATCH | `/api/me/settings` | `Partial<Settings>` | `200 { user }` |
| GET | `/api/progress` | – | `200 { progress }` |
| POST | `/api/progress/events` | `{ events: ProgressEvent[] }` | `200 { progress, xp }` |
| POST | `/api/progress/import` | `{ progress: ProgressState }` | `200 { progress }` (fusión) |
| GET | `/api/health` | – | `200 { ok: true }` |

```ts
interface User {
  id: string;
  email: string;
  displayName: string;
  settings: Settings;
  createdAt: string;
}

interface Settings {
  locale: 'es' | 'en';
  theme: 'blizzard' | 'neon';
  colorMode: 'dark' | 'light' | 'system';
  notation: 'es' | 'en';
  coordinates: boolean;
  highlightLastMove: boolean;
  planArrows: boolean;
  sounds: boolean;
}
```

`ProgressState` y `ProgressEvent` están en `shared/src/progress.ts`. El servidor
aplica los eventos con `applyEvents` y valida que los ids existan en el contenido.

## Cliente

```
client/src/
  main.tsx, app/        Rutas, layout (menú lateral, barra móvil) y páginas
  styles/tokens.css     Variables de color por tema y modo
  theme/                Fondos animados de cada tema y el fantasma (mascota)
  i18n/                 Textos es/en: useT(), tx()
  state/                settings.tsx, progress.tsx, auth.tsx, api.ts
  board/                Tablero propio (SVG), flechas, promoción
  engine/               Stockfish en un Web Worker, barra de evaluación
  lesson/               Reproductores de etapas: ideas, estudio, práctica,
                        puzzles, sparring, examen, repaso y análisis
```

Rutas:

| Ruta | Página |
| --- | --- |
| `/` | Aprender: la montaña del curso elegido |
| `/curso/:courseId/:stageId` | Etapa (la reproduce `StagePlayer`) |
| `/repaso` | Repaso de hoy (líneas pendientes de todos los cursos) |
| `/puzzles` | Puzzles de todos los cursos |
| `/analisis` | Tablero de análisis con Stockfish e importación de PGN |
| `/perfil` | Estadísticas, nivel, racha y medallas |
| `/ajustes` | Tema, modo de color, idioma, notación y tablero |
| `/entrar`, `/registro` | Cuenta |

### Contratos entre módulos del cliente

```ts
// i18n
useT(): (key: string, vars?: Record<string, string | number>) => string
useTx(): (text: L10n) => string            // elige es/en del contenido
useNotation(): NotationStyle                // 'es' | 'en'

// state/settings.tsx
useSettings(): { settings: Settings; update(patch: Partial<Settings>): void }

// state/progress.tsx
useProgress(): {
  state: ProgressState;
  today: string;                            // AAAA-MM-DD local
  record(event: DistributiveOmit<ProgressEvent, 'day'>): number;  // XP ganada
  replace(state: ProgressState): void;
  lastXp: { amount: number; at: number } | null;
  syncStatus: ...;                          // estado de la sincronización con la cuenta
}
// ProgressSync: push(events) y, opcionales, attach() / pull() para enlazar la cuenta.

// state/auth.tsx
useAuth(): sesión actual (user | null), login, register, logout

// theme/Ghost.tsx
<Ghost mood="neutral" | "happy" | "sad" | "thinking" size={number} theme?={'blizzard' | 'neon'} />

// theme/Backdrop.tsx
<Backdrop />                                // fondo animado del tema actual

// board/Board.tsx
<Board
  fen={string}
  orientation={'white' | 'black'}
  movable={{ color: 'w' | 'b'; dests: Map<string, string[]> } | null}
  onMove={(from, to, promotion?) => void}
  lastMove={[from, to] | null}
  check={square | null}
  arrows={BoardArrow[]}                    // { from, to, via?, kind: 'plan' | 'rival' | 'hint' | 'best' }
  marks={string[]}
  // opcionales:
  tones={{ [square]: 'ok' | 'err' | 'hint' }} // color de fondo de casillas sueltas
  ariaLabel={string}  animate={boolean}  coordinates={boolean}
  highlightLastMove={boolean}  className={string}
/>

// engine/stockfish.ts (un solo Web Worker para toda la app)
getEngine().analyze(fen, { multipv?, depth?, movetime?, searchmoves?, onUpdate? })
  -> { promise: Promise<EngineResult>, cancel() }   // EngineResult: { lines, best, cancelled }
getEngine().play(fen, { skill?, elo?, movetime?, depth? }) -> { promise: Promise<string | null>, cancel() }
getEngine().stop()

// engine/useAnalysis.ts: análisis en directo de una posición
useAnalysis(fen | null, { enabled?, multipv?, depth? }): { fen, depth, lines, running, end, error }

// lesson/index.ts
<StagePlayer course={Course} stage={Stage} onExit={() => void} />
<ReviewSession onExit={() => void} courses?={Course[]} />
<PuzzleSolver
  puzzle={Puzzle} course={Course} onDone={(solved: boolean) => void}
  // opcionales:
  mode={'normal' | 'exam'}        // en examen: sin pistas y el primer fallo suspende
  recordAttempt={boolean}         // registrar el intento en el progreso (por defecto, sí)
  header={ReactNode}  continueLabel={string}
  onXp={(xp: number) => void}     // XP ganada al registrar el intento
/>
<AnalysisBoard />
```

### Diseño

Referencia visual: las maquetas del lienzo de diseño (tema Black Blizzard y tema Neón).
Tokens del tema Black Blizzard oscuro: fondo `#0c0d0f`, superficie `#141518`,
superficie 2 `#1b1d21`, superficie 3 `#24272c`, borde `#272a30`, texto `#eceef1`,
texto 2 `#a9afb7`, texto 3 `#8a9098`, acento hielo `#9fe3ea` (tinta `#0b0c0e`,
labio `#4f969d`), aviso `#f2c14e`, casilla clara `#d4d8dc`, casilla oscura `#50565e`.
Tema Neón: fondo `#08070d`, superficie `#110e19`, borde `#2c2440`, texto `#efeaf8`,
magenta `#ff4fd8`, cian `#4ff0ff`, amarillo `#ffe45c`, casillas `#3a3948` / `#1f1e2a`.
Tipografía: Chakra Petch (títulos, botones) y Barlow (texto).
