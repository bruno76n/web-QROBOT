import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.PORT ?? 4321);
const baseURL = `http://localhost:${port}`;
// Pre-installed browser in some environments; otherwise Playwright's own download is used.
const executablePath = process.env.PW_CHROMIUM_PATH || undefined;
const launchOptions = executablePath ? { executablePath, args: ['--no-sandbox'] } : {};

const widths = [
  { name: 'w390', width: 390, height: 844 },
  { name: 'w820', width: 820, height: 1180 },
  { name: 'w1440', width: 1440, height: 900 },
] as const;

export default defineConfig({
  testDir: '.',
  testMatch: ['e2e/**/*.spec.ts', 'tests/**/*.spec.ts'],
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
    command: `pnpm build && pnpm preview --port ${port} --ignore-lock`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
