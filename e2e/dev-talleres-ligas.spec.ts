import { test, expect } from '@playwright/test';

// Links to the page for workshops with `pnpm dev`, where it is visible (docs/25 §2, fase 9 · 9.10):
// the header menu and the footer lead to `/talleres`, an Aprende page with `cta: system` shows its
// call with a button to `/talleres`, and the sitemap lists the 3 pages. In any build all of this is
// absent (tests/security/system-hidden.spec.ts).

test('el menú del header y el footer llevan «Para talleres» a /talleres', async ({ page }) => {
  await page.goto('/');
  const header = page.locator('header#top nav');
  await expect(header.locator('a[href="/talleres"]')).toHaveCount(1);
  await expect(header.locator('a[href="/talleres"]')).toContainText(/Para talleres|Talleres/);
  const footer = page.locator('footer');
  await expect(footer.getByRole('link', { name: 'Para talleres' })).toHaveAttribute(
    'href',
    '/talleres',
  );
});

test('Aprende · negocio/costo muestra el llamado a Para talleres', async ({ page }) => {
  await page.goto('/aprende/negocio/costo');
  const cta = page.locator('.ap-cta');
  await expect(cta).toHaveCount(1);
  // Its `ctaText` (content/aprende/paginas/negocio/costo.md).
  await expect(cta).toContainText(
    'Quick Cerebro lee el archivo del laminador (gramos, horas, colores) y hace este cálculo solo, con tus precios.',
  );
  const button = cta.locator('a.btn');
  await expect(button).toHaveAttribute('href', '/talleres');
  await expect(button).not.toHaveClass(/\bwa\b/);
  await button.click();
  await expect(page).toHaveURL(/\/talleres$/);
});

test('el sitemap incluye las 3 páginas para talleres', async ({ request, baseURL }) => {
  const res = await request.get(`${baseURL}/sitemap.xml`);
  expect(res.status()).toBe(200);
  const xml = await res.text();
  for (const path of ['/talleres', '/talleres/precios', '/talleres/descargar']) {
    expect(xml).toMatch(new RegExp(`<loc>[^<]*${path.replace(/\//g, '\\/')}</loc>`));
  }
});
