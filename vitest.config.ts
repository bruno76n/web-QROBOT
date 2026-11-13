import { defineConfig } from 'vitest/config';
import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-plugin';
import { fileURLToPath } from 'node:url';

const alias = { '@': fileURLToPath(new URL('./src', import.meta.url)) };

export default defineConfig({
  test: {
    passWithNoTests: true,
    coverage: { provider: 'v8', include: ['src/lib/**', 'src/server/**', 'src/actions/**'] },
    projects: [
      // Astro components rendered with the Container API (vitest.astro.config.ts).
      './vitest.astro.config.ts',
      {
        // Pure logic and tooling: plain Node.
        resolve: { alias },
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/lib/**/*.test.ts', 'src/components/**/*.test.ts', 'tests/**/*.test.ts'],
          exclude: [
            'tests/negative/**',
            '**/*.server.test.ts',
            '**/*.astro.test.ts',
            'node_modules/**',
          ],
        },
      },
      {
        // Server code: inside the Workers runtime with local D1 and R2 (miniflare).
        resolve: { alias },
        plugins: [
          cloudflareTest({
            wrangler: { configPath: './wrangler.test.jsonc' },
            miniflare: {
              // Tests never see production values; they start from a clean local D1 and R2.
              bindings: {
                APP_ENV: 'development',
                PUBLIC_IMG_BASE: '/img',
                TEST_MIGRATIONS: await readD1Migrations('./migrations'),
              },
            },
          }),
        ],
        test: {
          name: 'server',
          include: [
            'src/server/**/*.test.ts',
            'src/actions/**/*.test.ts',
            'tests/**/*.server.test.ts',
          ],
          setupFiles: ['./src/server/test-setup.ts'],
        },
      },
    ],
  },
});
