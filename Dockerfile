# syntax=docker/dockerfile:1
#
# ChessBlizzard en una sola imagen: el servidor Fastify sirve la API y la web compilada.
#   docker build -t chessblizzard .
#   docker run -p 3000:3000 -e DATABASE_URL=postgres://... chessblizzard
# (o `docker compose up`, que además levanta PostgreSQL).

ARG NODE_IMAGE=node:22-alpine

# --- 1. Todas las dependencias y compilación de la web -------------------------------
FROM ${NODE_IMAGE} AS build
WORKDIR /app
# Primero solo los manifiestos: la capa de `npm ci` se reutiliza mientras no cambien.
COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY server/package.json server/
COPY client/package.json client/
RUN npm ci --no-audit --no-fund
COPY . .
# El `prebuild` del cliente copia Stockfish desde node_modules a client/public/stockfish.
RUN npm run build -w client

# --- 2. Solo las dependencias de producción ------------------------------------------
FROM ${NODE_IMAGE} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY server/package.json server/
COPY client/package.json client/
RUN npm ci --omit=dev --no-audit --no-fund

# --- 3. Imagen final -----------------------------------------------------------------
FROM ${NODE_IMAGE}
ENV NODE_ENV=production \
    PORT=3000 \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json tsconfig.base.json ./
COPY shared/package.json shared/tsconfig.json shared/
COPY shared/src shared/src
COPY server/package.json server/tsconfig.json server/
COPY server/src server/src
COPY server/migrations server/migrations
COPY client/package.json client/
COPY --from=build /app/client/dist client/dist

USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -q -O /dev/null "http://127.0.0.1:${PORT}/api/health" || exit 1
# Aplica las migraciones pendientes al arrancar (MIGRATE_ON_START=false para no hacerlo).
# npm reenvía SIGTERM a tsx y este al servidor, que cierra limpio (`docker stop` no espera).
CMD ["npm", "start", "-w", "server"]
