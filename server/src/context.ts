// Dependencias que comparten las rutas.

import type { Config } from './config';
import type { Pool } from './db';
import type { ScryptParams } from './password';

export interface AppContext {
  config: Config;
  pool: Pool;
  /** Reloj del servidor. */
  now: () => Date;
  /** Coste de scrypt para las contraseñas nuevas. */
  passwordParams: ScryptParams;
}
