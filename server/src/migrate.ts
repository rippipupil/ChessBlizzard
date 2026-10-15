// Migraciones: aplica en orden los ficheros `server/migrations/NNN_nombre.sql` que aún no
// estén en la tabla `schema_migrations`. Cada fichero va en su propia transacción.
//
// Uso directo: `npm run migrate -w server`.

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { SERVER_DIR, loadConfig, loadEnvFile } from './config';
import { createPool, type Pool } from './db';

export const MIGRATIONS_DIR = path.join(SERVER_DIR, 'migrations');

// Bloqueo consultivo para que dos instancias que arrancan a la vez no migren a la par.
const LOCK_KEY = 4_815_162_342;

/** Aplica las migraciones pendientes y devuelve las que ha aplicado. */
export async function migrate(pool: Pool, log: (message: string) => void = () => {}): Promise<string[]> {
  const files = (await readdir(MIGRATIONS_DIR)).filter((f) => /^\d+_[\w-]+\.sql$/.test(f)).sort();
  const client = await pool.connect();
  try {
    await client.query('SELECT pg_advisory_lock($1)', [LOCK_KEY]);
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version    text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )`);
    const { rows } = await client.query<{ version: string }>('SELECT version FROM schema_migrations');
    const done = new Set(rows.map((r) => r.version));
    const applied: string[] = [];

    for (const file of files) {
      const version = file.replace(/\.sql$/, '');
      if (done.has(version)) continue;
      const sql = await readFile(path.join(MIGRATIONS_DIR, file), 'utf8');
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [version]);
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        throw new Error(`La migración ${file} ha fallado: ${err instanceof Error ? err.message : String(err)}`, { cause: err });
      }
      applied.push(version);
      log(`Migración aplicada: ${file}`);
    }
    return applied;
  } finally {
    await client.query('SELECT pg_advisory_unlock($1)', [LOCK_KEY]).catch(() => {});
    client.release();
  }
}

// Ejecutado como script (`tsx src/migrate.ts`).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  loadEnvFile();
  const pool = createPool(loadConfig().databaseUrl);
  try {
    const applied = await migrate(pool, (m) => console.log(m));
    if (applied.length === 0) console.log('La base de datos ya está al día.');
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
