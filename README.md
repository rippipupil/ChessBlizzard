# ❄ ChessBlizzard

Aprende aperturas de ajedrez subiendo una montaña. Cada apertura es un curso con
tres campamentos (la estructura, las alternativas del rival y la cumbre), práctica
con repetición espaciada, trampas, puzzles, sparring y análisis con Stockfish.

Cursos incluidos:

| Curso | Bando | Contenido |
| --- | --- | --- |
| Apertura Inglesa | Blancas · 1.c4 | Dragón al revés, Simétrica, esquemas contra ...Cf6, ...e6 y ...g6 |
| India de Rey | Negras · contra 1.d4 | Mar del Plata, Bayoneta, Sämisch, Cuatro Peones, Averbakh, fianchetto y Londres |
| Siciliana Dragón | Negras · contra 1.e4 | Ataque Yugoslavo, Clásica, Levenfish y anti-sicilianas |

Todas las líneas se comprueban automáticamente: legalidad y coherencia del
repertorio con tests, y calidad de cada jugada con Stockfish.

## Funciones

- **Camino de montaña**: las etapas se desbloquean en orden, del campamento base a la cumbre.
- **Ideas y planes**: diapositivas con flechas sobre el tablero y un test al final.
- **Estudio y práctica**: cada línea jugada a jugada, con el porqué de cada movimiento.
  En la práctica juegas tú; si fallas, Stockfish te enseña por qué tu jugada es peor.
- **¿Y si...?**: qué hacer contra cada alternativa del rival.
- **Repetición espaciada**: las líneas que fallas vuelven antes ("Repaso de hoy").
- **Trampas y puzzles** de cada apertura, verificados con Stockfish.
- **Sparring**: partida contra Stockfish; mientras el rival siga el libro, practicas tu repertorio.
- **Examen** final para conquistar la cumbre.
- **Análisis**: importa un PGN o un FEN y analiza con Stockfish.
- **Cuentas** con progreso en la nube, o modo invitado sin registro.
- Temas **Black Blizzard** y **Neón**, modo claro y oscuro, español e inglés,
  y notación española (C A T D R) o inglesa.

## Estructura

```
shared/   Lógica y contenido compartidos (TypeScript): cursos, notación,
          repetición espaciada, progreso. Scripts de auditoría con Stockfish.
server/   API en Fastify + PostgreSQL: cuentas, sesiones y progreso.
client/   La web: Vite + React 19. Stockfish corre en el navegador (WebAssembly).
docs/     Arquitectura y contratos entre módulos.
```

Más detalles en [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Puesta en marcha

Requisitos: Node.js 22 y PostgreSQL 16 (o Docker).

```bash
npm install
npm test                 # tests de shared y server
npm run typecheck
```

Desarrollo (la web en http://localhost:5173 y la API en el puerto 3000):

```bash
cp .env.example .env     # y rellena DATABASE_URL
npm run dev
```

Con Docker (web y base de datos juntas, en http://localhost:3000):

```bash
docker compose up --build
```

### Revisar el contenido con Stockfish

```bash
npm run audit:content                                   # todos los cursos
npm run audit -w shared -- --course kings-indian        # un curso
npm run audit -w shared -- --line kid-main --depth 18   # una línea
```

## Despliegue

El repositorio incluye un `Dockerfile` y un `render.yaml` para desplegar en
[Render](https://render.com) con un clic: un servicio web y una base de datos
PostgreSQL. Variables de entorno en `.env.example`.

## Licencias

El código de ChessBlizzard es del autor del repositorio. El motor
[Stockfish.js](https://github.com/nmrugg/stockfish.js) se distribuye bajo la
licencia GPL v3 y se sirve como archivo independiente (`client/public/stockfish`).
Las explicaciones de los cursos son originales; los libros citados en cada curso
son lecturas recomendadas.
