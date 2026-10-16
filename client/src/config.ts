// Opciones que se fijan al compilar.

/**
 * Versión estática para GitHub Pages (`npm run build:pages`, que compila con
 * `vite build --mode pages`). Se sirve bajo /ChessBlizzard/ y no tiene servidor.
 */
export const STATIC_SITE = import.meta.env.MODE === 'pages';

/** Cuentas de usuario. Sin servidor, la app funciona entera en modo invitado y no llama a la API. */
export const ACCOUNTS_ENABLED = !STATIC_SITE;

/**
 * Prefijo de las rutas para el router ("" en la raíz, "/ChessBlizzard" en GitHub Pages). Se
 * toma de la URL real para que también funcione si alguien escribe la ruta en minúsculas.
 */
export function routerBasename(): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (!base) return '/';
  const path = window.location.pathname;
  return path.toLowerCase().startsWith(base.toLowerCase()) ? path.slice(0, base.length) : base;
}
