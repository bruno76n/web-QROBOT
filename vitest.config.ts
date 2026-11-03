import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    exclude: ['tests/negative/**', 'node_modules/**'],
    environment: 'node',
    passWithNoTests: true,
    coverage: { provider: 'v8', include: ['src/lib/**', 'src/server/**', 'src/actions/**'] },
  },
});
