import { defineConfig, devices } from '@playwright/test';
import { existsSync, readdirSync } from 'node:fs';

// The panel flows and the development-only pages (the season of the home page, the hidden page for
// workshops) run against `pnpm dev` (the panel needs the development admin session, docs/16 §4),
// one worker at a time because they share the local D1 and R2.
const port = Number(process.env.ADMIN_PORT ?? 4322);
const baseURL = `http://localhost:${port}`;

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
  { name: 'admin-w390', width: 390, height: 844 },
  { name: 'admin-w820', width: 820, height: 1180 },
  { name: 'admin-w1440', width: 1440, height: 900 },
] as const;

/**
 * WebKit (Safari's engine) runs the flows of the page for workshops M–P (docs/25 §12) on an
 * iPhone 13 and on a 1440 px desktop. It is added only where Playwright's WebKit is installed
 * (`pnpm exec playwright install webkit`), so the suite still runs where there is only Chromium.
 */
function hasWebKit(): boolean {
  const dirs = [process.env.PLAYWRIGHT_BROWSERS_PATH, `${process.env.HOME}/.cache/ms-playwright`];
  return dirs.some(
    (d) => !!d && existsSync(d) && readdirSync(d).some((n) => n.startsWith('webkit-')),
  );
}
const systemFlows = /dev-talleres-.*\.spec\.ts/;
const webkit = hasWebKit()
  ? [
      { name: 'webkit-w390', testMatch: systemFlows, use: { ...devices['iPhone 13'] } },
      {
        name: 'webkit-w1440',
        testMatch: systemFlows,
        use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } },
      },
    ]
  : [];

export default defineConfig({
  testDir: 'e2e',
  testMatch: /(admin|dev)-.*\.spec\.ts/,
  workers: 1,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  globalSetup: './e2e/admin-global-setup.ts',
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [
    ...widths.map((w) => ({
      name: w.name,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: w.width, height: w.height },
        launchOptions,
      },
    })),
    ...webkit,
  ],
  webServer: {
    command: `pnpm dev --port ${port} --ignore-lock`,
    url: `${baseURL}/admin`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
