/**
 * Flows of Aprende (docs/21 §15): H search «petj» and open PETG, I filter the filaments table,
 * J ¿Cabe mi pieza?, K cost calculator, L a search without results offers WhatsApp; plus the
 * keyboard of the search box. Run at 390, 820 and 1440 (and I, J, K at 360 below).
 */
import { test, expect, type Page } from '@playwright/test';

/** The live search box of the page (the big one on the home page). */
const searchBox = (page: Page) => page.getByRole('combobox', { name: 'Buscar en Aprende' }).first();

test('flujo H: buscar «petj» encuentra PETG y lo abre', async ({ page }) => {
  await page.goto('/aprende');
  await searchBox(page).fill('petj');
  const option = page.getByRole('option').filter({ hasText: 'PETG' }).first();
  await expect(option).toBeVisible();
  await expect(option.locator('mark').first()).toHaveText(/PETG/);
  await option.getByRole('link').click();
  await expect(page).toHaveURL(/\/aprende\/filamentos\/petg$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('PETG');
});

test('flujo I: Exterior y sol + impresora abierta deja PETG y quita ASA', async ({ page }) => {
  await page.goto('/aprende/filamentos');
  const table = page.locator('[data-filaments]');
  await table.getByRole('button', { name: 'Exterior y sol' }).click();
  const rows = table.locator('tbody tr:not([hidden])');
  await expect(rows.filter({ hasText: 'ASA' })).toHaveCount(1);
  await table.getByText('Mi impresora es abierta').click();
  await expect(rows.filter({ hasText: 'ASA' })).toHaveCount(0);
  await expect(rows.filter({ hasText: 'PETG' }).first()).toBeVisible();
  await expect(table.locator('[data-ft-count]')).not.toHaveText('11 materiales');
});

test('flujo J: ¿Cabe mi pieza? con 30 × 30 × 30 cm dice en cuántas cabe', async ({ page }) => {
  await page.goto('/aprende/maquinas/volumen-de-impresion');
  const fit = page.locator('[data-fit]');
  await fit.getByLabel('Ancho').fill('30');
  await fit.getByLabel('Fondo').fill('30');
  await fit.getByLabel('Alto').fill('30');
  await expect(fit.locator('[data-fit-out]')).toHaveText(/^Cabe en \d+ de 30 impresoras\.$/);
  // comma as decimal mark, like the iPhone in Spanish
  await fit.getByLabel('Ancho').fill('24,7');
  await expect(fit.locator('[data-fit-out]')).toHaveText(/^Cabe en \d+ de 30 impresoras\.$/);
  // in mm the values are converted and the result stays
  await fit.getByRole('button', { name: 'mm' }).click();
  await expect(fit.getByLabel('Ancho')).toHaveValue('247');
  await expect(page.locator('[data-printers] tbody tr .fitcell .tag').first()).toBeVisible();
});

test('flujo K: la calculadora da $21.04 con el ejemplo y se recalcula al escribir', async ({
  page,
}) => {
  await page.goto('/aprende/negocio/costo');
  const calc = page.locator('[data-calc]');
  await expect(calc.locator('.tot [data-r="cost"]')).toHaveText('$21.04');
  await calc.getByLabel('Piezas que salen mal').fill('0');
  await expect(calc.locator('.tot [data-r="cost"]')).toHaveText('$19.99');
  await calc.getByLabel('Piezas que salen mal').fill('5');
  await expect(calc.locator('.tot [data-r="cost"]')).toHaveText('$21.04');
});

test('flujo L: sin resultados sale Q-404 y la liga de WhatsApp con la búsqueda', async ({
  page,
}) => {
  await page.goto('/aprende');
  await searchBox(page).fill('xyzqw');
  const empty = page.locator('.q-empty');
  await expect(empty).toBeVisible();
  await expect(empty).toContainText('404: no encontramos «xyzqw».');
  const wa = empty.getByRole('link', { name: '¿Lo preguntamos por ti?' });
  await expect(wa).toHaveAttribute('href', /wa\.me\/\d+\?text=.*xyzqw/);
  // the page without JavaScript says the same
  await page.goto('/aprende/buscar?q=xyzqw');
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('404: no encontramos «xyzqw».');
});

test('teclado: ⌘K o Ctrl+K enfoca, ↓ elige y Enter abre', async ({ page }) => {
  await page.goto('/aprende/filamentos/pla');
  await page.locator('body').click();
  await page.keyboard.press('ControlOrMeta+k');
  await expect(searchBox(page)).toBeFocused();
  await page.keyboard.type('secado');
  await expect(page.getByRole('option').first()).toBeVisible();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('option').first()).toHaveAttribute('aria-selected', 'true');
  const href = await page.getByRole('option').first().getByRole('link').getAttribute('href');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(new RegExp(`${href?.replace(/[#?]/g, '.')}`));
});

test('sin JavaScript: Enter lleva a la página de resultados', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/aprende');
  await searchBox(page).fill('petg');
  await searchBox(page).press('Enter');
  await expect(page).toHaveURL(/\/aprende\/buscar\?q=petg/);
  await expect(page.locator('.res a').first()).toHaveAttribute('href', '/aprende/filamentos/petg');
  await context.close();
});

test.describe('a 360 px', () => {
  test.use({ viewport: { width: 360, height: 780 } });
  test('portada, tabla de filamentos, ¿Cabe mi pieza? y calculadora sin desbordar', async ({
    page,
  }) => {
    for (const url of [
      '/aprende',
      '/aprende/filamentos',
      '/aprende/maquinas/volumen-de-impresion',
      '/aprende/negocio/costo',
    ]) {
      await page.goto(url);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        url,
      ).toBe(false);
    }
    await page.goto('/aprende/filamentos');
    await page.locator('[data-filaments]').getByRole('button', { name: 'Calor' }).click();
    await expect(page.locator('[data-filaments] tbody tr:not([hidden])').first()).toBeVisible();
  });
});
