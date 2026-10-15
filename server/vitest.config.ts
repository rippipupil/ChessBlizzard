import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    // Arranca PostgreSQL de pruebas si no hay TEST_DATABASE_URL (ver scripts/test-db.sh).
    globalSetup: ['test/global-setup.ts'],
    // Todos los ficheros comparten la misma base de datos y la vacían entre tests.
    fileParallelism: false,
    testTimeout: 20_000,
    hookTimeout: 60_000,
  },
});
