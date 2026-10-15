// Prepara la base de datos de los tests una sola vez por ejecución.
//
// Se usa TEST_DATABASE_URL si está definida (CI, o un PostgreSQL propio). Si no, se arranca
// el clúster desechable de scripts/test-db.sh (puerto 5433) y se para al terminar.
// Atención: se borran las tablas de la aplicación de esa base de datos.

import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import type { TestProject } from 'vitest/node';
import { createPool } from '../src/db';
import { migrate } from '../src/migrate';

declare module 'vitest' {
  export interface ProvidedContext {
    databaseUrl: string;
  }
}

const SCRIPT = fileURLToPath(new URL('../scripts/test-db.sh', import.meta.url));

function startLocalDatabase(): { url: string; startedHere: boolean } {
  const wasRunning = spawnSync('bash', [SCRIPT, 'status']).status === 0;
  let output: string;
  try {
    output = execFileSync('bash', [SCRIPT, 'start'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
  } catch (err) {
    throw new Error(
      'No hay TEST_DATABASE_URL y no se pudo arrancar el PostgreSQL de pruebas con scripts/test-db.sh ' +
        '(necesita los binarios de PostgreSQL 16; ver PG_BIN). Define TEST_DATABASE_URL apuntando a una base de datos de pruebas.',
      { cause: err },
    );
  }
  const url = /TEST_DATABASE_URL=(\S+)/.exec(output)?.[1];
  if (!url) throw new Error(`scripts/test-db.sh no devolvió la URL: ${output}`);
  return { url, startedHere: !wasRunning };
}

export default async function setup(project: TestProject) {
  const envUrl = process.env.TEST_DATABASE_URL?.trim();
  const local = envUrl ? null : startLocalDatabase();
  const url = envUrl || local!.url;

  // Esquema limpio: se borran las tablas de una ejecución anterior y se migra de cero.
  const pool = createPool(url, { max: 1 });
  try {
    await pool.query('DROP TABLE IF EXISTS progress, sessions, users, schema_migrations CASCADE');
    await migrate(pool);
  } finally {
    await pool.end();
  }

  project.provide('databaseUrl', url);

  return () => {
    if (local?.startedHere) execFileSync('bash', [SCRIPT, 'stop'], { stdio: 'inherit' });
  };
}
