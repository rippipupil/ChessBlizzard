// Acceso a PostgreSQL: pool de conexiones y transacciones.

import { Pool, type PoolClient, type PoolConfig } from 'pg';

export type { Pool, PoolClient };

export function createPool(connectionString: string, options: Partial<PoolConfig> = {}): Pool {
  const pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    application_name: 'chessblizzard',
    ...options,
  });
  // Sin este manejador, el error de una conexión inactiva (por ejemplo, si PostgreSQL se
  // reinicia) tumbaría el proceso. El pool descarta esa conexión y abre otra cuando haga falta.
  pool.on('error', (err) => {
    console.error(`[db] Error en una conexión inactiva: ${err.message}`);
  });
  return pool;
}

/** Ejecuta `fn` dentro de una transacción: COMMIT si termina bien y ROLLBACK si lanza. */
export async function withTransaction<T>(pool: Pool, fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  let broken: Error | undefined;
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      // La conexión ha quedado inservible: se destruye en vez de devolverla al pool.
      broken = rollbackError instanceof Error ? rollbackError : new Error(String(rollbackError));
    }
    throw err;
  } finally {
    client.release(broken);
  }
}

/** Error de PostgreSQL por violar una restricción UNIQUE (código 23505). */
export function isUniqueViolation(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: unknown }).code === '23505';
}
