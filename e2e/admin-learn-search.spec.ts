/**
 * Search block of the panel's «Aprende» tab (docs/22 §10, docs/12 §5c) on its development page:
 * searches without a result show up counted and most searched first, the block says when the
 * search reads the database (no Meilisearch in `pnpm dev`), «Actualizar buscador» answers, and
 * axe finds no serious violations.
 */
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { spawnSync } from 'node:child_process';

const PAGE = '/admin/aprende';

/** Prefix of every query this spec searches, so they can be told apart from real ones. */
const PREFIX = 'zzq';

/**
 * Removes this spec's searches from the LOCAL D1 (the one `pnpm dev` uses), so they never pile up
 * past the 100 rows the panel shows. Real searches are left alone.
 */
function forgetTestSearches() {
  const r = spawnSync(
    'pnpm',
    [
      'exec',
      'wrangler',
      'd1',
      'execute',
      'DB',
      '--local',
      '--command',
      `DELETE FROM learn_search_misses WHERE query LIKE '${PREFIX}%'`,
    ],
    { stdio: 'ignore' },
  );
  if (r.status !== 0) throw new Error('could not clean the local searches without a result');
}

test.beforeAll(() => forgetTestSearches());
test.afterAll(() => forgetTestSearches());

/** A query no page can match: letters only, different on every run and width. */
function nonsense() {
  const letters = 'bcdfghjklmnpqrstvwxz';
  let s = PREFIX;
  for (let i = 0; i < 10; i++) s += letters[Math.floor(Math.random() * letters.length)];
  return s;
}

/** Searches Aprende through its public endpoint and checks nothing was found. */
async function searchNothing(page: Page, q: string) {
  const res = await page.request.get(`/api/aprende/buscar?q=${encodeURIComponent(q)}`);
  expect(res.status()).toBe(200);
  const body = (await res.json()) as { total: number; hits: unknown[] };
  expect(body.total).toBe(0);
  expect(body.hits).toHaveLength(0);
}

/** Opens the development page and waits until the report has loaded. */
async function open(page: Page) {
  await page.goto(PAGE);
  await expect(page.getByRole('heading', { name: 'Buscador', exact: true })).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0, { timeout: 30_000 });
}

test('una búsqueda sin resultado aparece en la lista, con sus veces y de más a menos', async ({
  page,
}) => {
  const often = nonsense();
  const once = nonsense();
  for (let i = 0; i < 3; i++) await searchNothing(page, often);
  await searchNothing(page, once);

  await open(page);
  const misses = page.getByTestId('learn-search-misses');
  await expect(
    misses.getByRole('heading', { name: 'Búsquedas sin resultado (30 días)' }),
  ).toBeVisible();
  const rows = misses.locator('li');
  const oftenRow = rows.filter({ hasText: often });
  const onceRow = rows.filter({ hasText: once });
  await expect(oftenRow).toContainText('3 veces');
  await expect(onceRow).toContainText('1 vez');

  // Most searched first: the row searched 3 times comes before the one searched once.
  const order = await rows.locator('b').allTextContents();
  expect(order.indexOf(often)).toBeLessThan(order.indexOf(once));
  const counts = (await rows.locator('span').allTextContents()).map((s) => parseInt(s, 10));
  expect(counts).toEqual([...counts].sort((a, b) => b - a));
});

test('sin Meilisearch el bloque dice que usa la base de datos y el botón responde', async ({
  page,
}) => {
  await open(page);
  const index = page.getByTestId('learn-search-index');
  await expect(index).toContainText(
    'El buscador usa la base de datos. Configura Meilisearch para que tolere errores de dedo.',
  );

  const sync = index.getByRole('button', { name: 'Actualizar buscador' });
  const answer = page.waitForResponse((r) => r.url().includes('/_actions/admin.syncLearnIndex'));
  await sync.click();
  const res = await answer;
  expect(res.status()).toBe(200);
  await expect(
    page
      .locator('[data-sonner-toast]')
      .filter({ hasText: 'No hacía falta: el buscador ya lee la base de datos.' }),
  ).toBeVisible();
  await expect(sync).toBeEnabled();
  await expect(index).toContainText('El buscador usa la base de datos.');
});

test('sin errores serios de accesibilidad', async ({ page }) => {
  await searchNothing(page, nonsense());
  await open(page);
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  const serious = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
});
