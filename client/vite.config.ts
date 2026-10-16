import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** Ruta de la versión publicada en GitHub Pages: https://<usuario>.github.io/ChessBlizzard/ */
const PAGES_BASE = '/ChessBlizzard/';

// En desarrollo, Vite sirve la web y reenvía /api al servidor (puerto 3000).
// `vite build --mode pages` compila la versión estática para GitHub Pages (src/config.ts).
export default defineConfig(({ mode }) => ({
  base: mode === 'pages' ? PAGES_BASE : '/',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:3000' },
  },
  preview: {
    port: 4173,
    proxy: { '/api': 'http://localhost:3000' },
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 900,
  },
}));
