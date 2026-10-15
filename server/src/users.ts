// Usuarios: fila de la base de datos -> objeto `User` de la API.

import { DEFAULT_SETTINGS, sanitizeSettings, type Settings } from '@chessblizzard/shared';

export interface User {
  id: string;
  email: string;
  displayName: string;
  settings: Settings;
  createdAt: string;
}

export interface UserRow {
  id: string;
  email: string;
  display_name: string;
  settings: unknown;
  created_at: Date;
}

const COLUMNS = ['id', 'email', 'display_name', 'settings', 'created_at'] as const;

/** Columnas de `UserRow` para un SELECT/RETURNING, opcionalmente con alias de tabla. */
export function userColumns(alias?: string): string {
  return COLUMNS.map((c) => (alias ? `${alias}.${c}` : c)).join(', ');
}

/** Ajustes completos: los guardados (solo los válidos) sobre los valores por defecto. */
export function resolveSettings(stored: unknown): Settings {
  return { ...DEFAULT_SETTINGS, ...sanitizeSettings(stored) };
}

export function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    settings: resolveSettings(row.settings),
    createdAt: row.created_at.toISOString(),
  };
}
