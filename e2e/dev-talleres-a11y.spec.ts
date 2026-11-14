import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// docs/25 §12: no serious accessibility violations on the 3 pages for workshops, checked with
// `pnpm dev` (the only place they answer while hidden), in every width of the config.
for (const path of ['/talleres', '/talleres/precios', '/talleres/descargar']) {
  test(`axe sin errores serios en ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('h1')).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });
}
