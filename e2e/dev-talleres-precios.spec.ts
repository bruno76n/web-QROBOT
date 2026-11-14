import { test, expect, type Page } from '@playwright/test';

// Flow N of the page for workshops (docs/25 §12): the period switch of the pricing page changes
// the prices of the plans, the page reads monthly without JavaScript, and the switch still works
// after leaving and coming back through the product bar (View Transitions). Needs `pnpm dev`: the
// page is hidden outside it (docs/25 §2).

const shopPrice = (page: Page) => page.locator('[data-plan-price="shop"]');
const shopNote = (page: Page) =>
  page.locator('.plan', { has: page.locator('[data-plan-price="shop"]') }).locator('.price-yr');

/** Clicks a period button until the page script answers (it starts on `astro:page-load`). */
async function choose(page: Page, name: 'Mensual' | 'Anual', amount: string) {
  const button = page.getByRole('group', { name: 'Periodo de pago' }).getByRole('button', { name });
  await expect(async () => {
    await button.click();
    await expect(shopPrice(page).locator('b')).toHaveText(amount, { timeout: 1000 });
  }).toPass({ timeout: 15_000 });
  await expect(button).toHaveAttribute('aria-pressed', 'true');
}

/** Follows a link of the product bar; on phones its links are inside the bar's menu. */
async function barLink(page: Page, name: string) {
  const inline = page.locator('.plinks').getByRole('link', { name, exact: true });
  if (await inline.isVisible()) {
    await inline.click();
    return;
  }
  await page.locator('.pmenu summary').click();
  await page.locator('.pmenu-list').getByRole('link', { name, exact: true }).click();
}

async function expectYearlyThenMonthly(page: Page) {
  await choose(page, 'Anual', '$1,490');
  await expect(shopPrice(page).locator('span')).toHaveText('al año');
  await expect(shopNote(page)).toHaveText('Equivale a $124 al mes');
  await expect(
    page.getByRole('group', { name: 'Periodo de pago' }).getByRole('button', { name: 'Mensual' }),
  ).toHaveAttribute('aria-pressed', 'false');
  await choose(page, 'Mensual', '$149');
  await expect(shopPrice(page).locator('span')).toHaveText('al mes');
  await expect(shopNote(page)).toHaveText('o $1,490 al año');
}

test('N · Anual muestra $1,490 y $124 al mes; Mensual regresa a $149', async ({ page }) => {
  await page.goto('/talleres/precios');
  await expect(page.getByRole('heading', { level: 1, name: 'Precios' })).toBeVisible();
  await expect(shopPrice(page).locator('b')).toHaveText('$149');
  await expect(shopNote(page)).toHaveText('o $1,490 al año');
  await expectYearlyThenMonthly(page);
  // the free plan reads the same in both periods
  await expect(page.locator('[data-plan-price="free"] b')).toHaveText('$0');
});

test('N · el periodo sigue funcionando después de ir a /talleres y volver por la barra', async ({
  page,
}) => {
  await page.goto('/talleres/precios');
  await choose(page, 'Anual', '$1,490');
  // a mark on window survives only if the page changes without a full load (View Transitions)
  await page.evaluate(() => ((window as unknown as { __stay: number }).__stay = 1));
  await page.locator('.pbar .pname').click();
  await expect(page).toHaveURL(/\/talleres$/);
  await barLink(page, 'Precios');
  await expect(page).toHaveURL(/\/talleres\/precios$/);
  expect(await page.evaluate(() => (window as unknown as { __stay?: number }).__stay)).toBe(1);
  // the page comes back monthly, and the switch works again
  await expect(shopPrice(page).locator('b')).toHaveText('$149');
  await expectYearlyThenMonthly(page);
});

test.describe('sin JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('N · se ve el mensual con su línea anual', async ({ page }) => {
    await page.goto('/talleres/precios');
    await expect(shopPrice(page).locator('b')).toHaveText('$149');
    await expect(shopPrice(page).locator('span')).toHaveText('al mes');
    await expect(shopNote(page)).toHaveText('o $1,490 al año');
    await expect(page.locator('[data-plan-price="business"] b')).toHaveText('$299');
  });
});
