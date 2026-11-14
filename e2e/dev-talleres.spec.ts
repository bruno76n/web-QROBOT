import { test, expect, type Page } from '@playwright/test';

// Flow M of the page for workshops (docs/25 §12): the main page with `pnpm dev`, the only place
// where the hidden page answers. Each test sets its own width where the flow names one.

const path = '/talleres';

/** True when the page does not scroll sideways. */
async function noSideScroll(page: Page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  );
}

test('M · el nombre en grande cabe en una línea en 360, sin scroll horizontal', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(path);
  const name = page.locator('main h1');
  await expect(name).toBeVisible();
  const fits = await name.evaluate((el) => {
    const box = el.getBoundingClientRect();
    const size = parseFloat(getComputedStyle(el).fontSize);
    // One line: no taller than one line of its own size, and inside the window.
    return box.height < size * 1.2 && box.right <= window.innerWidth;
  });
  expect(fits).toBe(true);
  expect(await noSideScroll(page)).toBe(true);
});

test('M · sin scroll horizontal en el ancho del proyecto', async ({ page }) => {
  await page.goto(path);
  await expect(page.locator('#modulos')).toBeAttached();
  expect(await noSideScroll(page)).toBe(true);
});

test('M · «Módulos» de la barra lleva a Módulos, justo debajo de la barra', async ({ page }) => {
  await page.goto(path);
  const bar = page.locator('.pbar');
  // On phones the links of the bar live in its menu.
  const menu = bar.locator('.pmenu summary');
  if (await menu.isVisible()) await menu.click();
  await bar.getByRole('link', { name: 'Módulos', exact: true }).filter({ visible: true }).click();
  await expect(page).toHaveURL(/#modulos$/);
  const heading = page.locator('#mod-h');
  await expect(heading).toBeInViewport();
  // Wait for the (smooth) scroll to settle, then the section starts right under the bar.
  await expect
    .poll(async () => {
      const b = await bar.boundingBox();
      const top = (await page.locator('#modulos').boundingBox())?.y ?? -1;
      const gap = top - ((b?.y ?? 0) + (b?.height ?? 0));
      return gap >= 0 && gap <= 16;
    })
    .toBe(true);
  // The bar does not cover the heading: the heading starts below the bar's bottom edge.
  const b = await bar.boundingBox();
  const h = await heading.boundingBox();
  expect(h?.y ?? -1).toBeGreaterThan((b?.y ?? 0) + (b?.height ?? 0));
});

// On phones the bar's links live in a `<details>` without script: after picking «Módulos» on this
// same page the menu stays open over the section (the mockup closes it with `_talleres.js`). The
// fix belongs to `SystemNav.astro` (docs/notas-fase-9/principal.md). Enable when it closes.
test.fixme('M · en celular el menú de la barra se cierra al elegir «Módulos»', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(path);
  const menu = page.locator('.pbar .pmenu');
  await menu.locator('summary').click();
  await menu.getByRole('link', { name: 'Módulos', exact: true }).click();
  await expect(page).toHaveURL(/#modulos$/);
  await expect(menu).not.toHaveAttribute('open', '');
  const heading = page.locator('#mod-h');
  const covered = await heading.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + 4, r.top + 4);
    return !hit || !el.contains(hit);
  });
  expect(covered).toBe(false);
});

test('M · cada pantalla del sistema es una imagen con nombre accesible', async ({ page }) => {
  await page.goto(path);
  const screens = page.locator('main figure');
  // Home, piece, order, printers, filaments, purchases, stock, quote and reports.
  expect(await screens.count()).toBeGreaterThanOrEqual(9);
  for (const screen of await screens.all()) {
    await expect(screen).toHaveAttribute('role', 'img');
    await expect(screen).toHaveAttribute('aria-label', /\S/);
  }
});

// The home screen is still the placeholder frame drawn while its agent draws it (docs/25 §6.3):
// it has neither side bar nor phone top bar yet. Enable when `UiHome` is the real screen.
test.fixme('M · en 390 la pantalla de Inicio va sin barra lateral', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(path);
  const home = page.locator('.hero-shot figure').first();
  await expect(home.locator('.ui-mtop')).toBeVisible();
  await expect(home.locator('.ui-side')).toBeHidden();
});
