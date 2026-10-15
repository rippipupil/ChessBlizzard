// Arranque del servidor: `npm start -w server` (producción) o `npm run dev -w server`.

import { buildApp } from './app';
import { loadConfig, loadEnvFile } from './config';
import { createPool, type Pool } from './db';
import { migrate } from './migrate';
import { deleteExpiredSessions } from './sessions';

loadEnvFile();
const config = loadConfig();
const pool = createPool(config.databaseUrl);
const app = await buildApp({ config, pool });

/** Espera a que PostgreSQL acepte conexiones (en Docker puede arrancar después que la app). */
async function waitForDatabase(db: Pool, attempts = 15): Promise<void> {
  for (let i = 1; ; i++) {
    try {
      await db.query('SELECT 1');
      return;
    } catch (err) {
      if (i >= attempts) throw err;
      app.log.warn(`PostgreSQL no responde (${err instanceof Error ? err.message : err}); reintento ${i}/${attempts - 1}`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

try {
  await waitForDatabase(pool);
  if (config.migrateOnStart) await migrate(pool, (message) => app.log.info(message));
  await app.listen({ port: config.port, host: config.host });
} catch (err) {
  app.log.error({ err }, 'No se pudo arrancar el servidor');
  await pool.end().catch(() => {});
  process.exit(1);
}

// Limpieza de sesiones caducadas: al arrancar y cada hora.
const cleanup = () =>
  deleteExpiredSessions(pool)
    .then((n) => n > 0 && app.log.info(`Sesiones caducadas borradas: ${n}`))
    .catch((err) => app.log.warn({ err }, 'No se pudieron borrar las sesiones caducadas'));
void cleanup();
const cleanupTimer = setInterval(cleanup, 60 * 60 * 1000);
cleanupTimer.unref();

let closing = false;
async function shutdown(signal: string): Promise<void> {
  if (closing) return;
  closing = true;
  app.log.info(`${signal}: cerrando el servidor`);
  clearInterval(cleanupTimer);
  try {
    await app.close();
    await pool.end();
  } finally {
    process.exit(0);
  }
}
process.once('SIGTERM', () => void shutdown('SIGTERM'));
process.once('SIGINT', () => void shutdown('SIGINT'));
