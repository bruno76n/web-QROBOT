import { existsSync, readdirSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.PORT ?? 4321);
const baseURL = `http://localhost:${port}`;
// Some environments ship a pre-installed Chromium (PW_CHROMIUM_PATH or /opt/pw-browsers);
// otherwise Playwright uses its own download (`pnpm exec playwright install chromium`).
function findChromium(): string | undefined {
  if (process.env.PW_CHROMIUM_PATH) return process.env.PW_CHROMIUM_PATH;
  const base = '/opt/pw-browsers';
  if (!existsSync(base)) return undefined;
  const dir = readdirSync(base).find((d) => /^chromium-\d+$/.test(d));
  const candidate = dir ? `${base}/${dir}/chrome-linux64/chrome` : '';
  return candidate && existsSync(candidate) ? candidate : undefined;
}
const executablePath = findChromium();
const launchOptions = executablePath ? { executablePath, args: ['--no-sandbox'] } : {};

const widths = [
  { name: 'w390', width: 390, height: 844 },
  { name: 'w820', width: 820, height: 1180 },
  { name: 'w1440', width: 1440, height: 900 },
] as const;

export default defineConfig({
  testDir: '.',
  testMatch: ['e2e/**/*.spec.ts', 'tests/**/*.spec.ts'],
  testIgnore: /admin-.*\.spec\.ts/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: { baseURL, trace: 'retain-on-failure' },
  projects: widths.map((w) => ({
    name: w.name,
    use: {
      ...devices['Desktop Chrome'],
      viewport: { width: w.width, height: w.height },
      launchOptions,
    },
  })),
  // e2e runs against the production build served by workerd (headers, CSP and size
  // are only real there). Flows that need `pnpm dev` start it themselves (phase 2+).
  webServer: {
    // Starts from the seed so the public pages have the 14 example products.
    command: `node scripts/setup-local.mjs && node scripts/seed.ts && pnpm build && pnpm preview --port ${port} --ignore-lock`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
