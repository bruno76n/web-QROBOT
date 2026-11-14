import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { openAdmin, reseed } from './admin-helpers';

// docs/16 §4: no serious accessibility violations in the panel.
test.beforeAll(() => reseed());
test('lista y editor de productos', async ({ page }) => {
  await openAdmin(page, '?p=seed-gato');
  await expect(page.getByLabel('Nombre', { exact: true })).toBeVisible();
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  const serious = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
});

test('portada', async ({ page }) => {
  await page.goto('/admin/portada');
  await expect(page.getByRole('heading', { name: 'Portada del inicio' })).toBeVisible({
    timeout: 30_000,
  });
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  const serious = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
});

test('aprende: lista, buscador y editor', async ({ page }) => {
  await page.goto('/admin/aprende?p=learn-filamentos-pla');
  await expect(page.getByLabel('Título', { exact: true })).toBeVisible({ timeout: 30_000 });
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  const serious = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
});
