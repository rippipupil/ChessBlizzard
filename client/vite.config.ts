import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// En desarrollo, Vite sirve la web y reenvía /api al servidor (puerto 3000).
export default defineConfig({
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
});
