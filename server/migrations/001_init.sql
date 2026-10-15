-- Esquema inicial: cuentas, sesiones y progreso.
-- gen_random_uuid() es nativa desde PostgreSQL 13 (no hace falta pgcrypto).

CREATE TABLE users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Siempre en minúsculas: la aplicación lo normaliza y la restricción lo garantiza.
  email         text NOT NULL UNIQUE CHECK (email = lower(email) AND char_length(email) <= 254),
  -- scrypt con sus parámetros: $scrypt$ln=..,r=..,p=..$sal$hash
  password_hash text NOT NULL,
  display_name  text NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 100),
  -- Solo los ajustes que el usuario ha cambiado; el resto toma los valores por defecto.
  settings      jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(settings) = 'object'),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
  -- sha256 (hex) del token de la cookie: el token en sí no se guarda nunca.
  token_hash   text PRIMARY KEY CHECK (token_hash ~ '^[0-9a-f]{64}$'),
  user_id      uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  expires_at   timestamptz NOT NULL,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  user_agent   text
);

CREATE INDEX sessions_user_id_idx ON sessions (user_id);
CREATE INDEX sessions_expires_at_idx ON sessions (expires_at);

CREATE TABLE progress (
  user_id    uuid PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  -- ProgressState de @chessblizzard/shared
  data       jsonb NOT NULL CHECK (jsonb_typeof(data) = 'object'),
  updated_at timestamptz NOT NULL DEFAULT now()
);
