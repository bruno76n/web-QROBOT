import { test, expect, type Page } from '@playwright/test';

// Flows M and O of the main page for workshops (docs/25 §12), against `pnpm dev` (the page is
// hidden outside development, docs/25 §2). Each flow runs in the width it is about and is skipped
// in the other projects.

/** Width of the running project, from its viewport. */
const width = (page: Page) => page.viewportSize()?.width ?? 0;

async function openTour(page: Page) {
  await page.goto('/talleres');
  const tour = page.locator('[data-tour]');
  // The script marks the tour ready once it has set the start state.
  await expect(tour).toHaveAttribute('data-ready', '');
  return tour;
}

test.describe('M · recorrido', () => {
  test('en escritorio abre un tema y cierra el otro; ↓ pasa al siguiente', async ({ page }) => {
    test.skip(width(page) < 1100, 'only the desktop layout (tabs)');
    const tour = await openTour(page);
    const costs = tour.getByRole('button', { name: /Costos y precios/ });
    const orders = tour.getByRole('button', { name: /Pedidos con anticipo/ });
    const production = tour.getByRole('button', { name: /Producción por impresora/ });

    await expect(costs).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#tp-costos')).toBeVisible();

    await orders.click();
    await expect(orders).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#tp-pedidos')).toBeVisible();
    await expect(costs).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#tp-costos')).toBeHidden();

    // Clicking the open tab keeps it open: on desktop one topic is always open.
    await orders.click();
    await expect(orders).toHaveAttribute('aria-expanded', 'true');

    await orders.focus();
    await page.keyboard.press('ArrowDown');
    await expect(production).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await expect(orders).toBeFocused();
  });

  test('en el celular el tema abierto se cierra y se abre otro', async ({ page }) => {
    test.skip(width(page) !== 390, 'only the phone layout (accordion)');
    const tour = await openTour(page);
    const costs = tour.getByRole('button', { name: /Costos y precios/ });
    const orders = tour.getByRole('button', { name: /Pedidos con anticipo/ });

    await expect(costs).toHaveAttribute('aria-expanded', 'true');
    await costs.click();
    await expect(costs).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#tp-costos')).toBeHidden();
    await expect(tour.locator('.t-item[aria-expanded="true"]')).toHaveCount(0);

    await orders.click();
    await expect(orders).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#tp-pedidos')).toBeVisible();
    await expect(page.locator('#tp-costos')).toBeHidden();
  });
});

test.describe('O · calculadora con precio', () => {
  test('ganancia con $120 y ganancia negativa en rojo con $15', async ({ page }) => {
    test.skip(width(page) !== 1440, 'one width is enough for the arithmetic');
    await page.goto('/talleres#calculadora');
    const calc = page.locator('#calculadora [data-calc]');
    const gain = calc.locator('[data-gain]');
    const profit = gain.locator('[data-r="profit"]');

    // Start values (cost $21.04) and the sample price.
    await expect(calc.locator('.calc-r [data-r="cost"]')).toHaveText('$21.04');
    await expect(calc.locator('input[name="price"]')).toHaveValue('120');
    await expect(profit).toHaveText('$98.96');
    await expect(gain.locator('[data-r="times"]')).toHaveText('5.7 veces el costo');
    await expect(gain).not.toHaveClass(/\bneg\b/);
    const green = await profit.evaluate((el) => getComputedStyle(el).color);

    await calc.locator('input[name="price"]').fill('15');
    await expect(profit).toHaveText('−$6.04');
    await expect(gain).toHaveClass(/\bneg\b/);
    const red = await profit.evaluate((el) => getComputedStyle(el).color);
    expect(red).not.toBe(green);
    // A red tone: more red than green and blue.
    const [r, g, b] = (red.match(/\d+/g) ?? []).map(Number);
    expect(r).toBeGreaterThan(g ?? 255);
    expect(r).toBeGreaterThan(b ?? 255);
  });
});
