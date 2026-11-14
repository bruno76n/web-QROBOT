import { test, expect } from '@playwright/test';
import { es } from '../src/i18n/es';
import { site } from '../src/config/site';

// Links to the page for workshops with `pnpm dev`, where it is visible (docs/25 §2): the header
// menu, the footer, the `system` call of Aprende (docs/21 §4.6) and the sitemap. That nothing links
// to `/talleres` in a production build is covered by `tests/security/system-hidden.spec.ts`.

test('el menú del header y el footer llevan a Para talleres', async ({ page }) => {
  await page.goto('/');
  const header = page.getByRole('navigation', { name: es.a11y.mainNav });
  await expect(header.getByRole('link', { name: es.header.system.label })).toHaveAttribute(
    'href',
    '/talleres',
  );
  const footer = page.getByRole('navigation', { name: es.footer.navLabel });
  await expect(footer.getByRole('link', { name: es.header.system.label })).toHaveAttribute(
    'href',
    '/talleres',
  );
});

test('una página de Aprende con llamado system muestra su texto y el botón a /talleres', async ({
  page,
}) => {
  await page.goto('/aprende/negocio/costo');
  const call = page.locator('.ap-cta');
  await expect(call).toHaveCount(1);
  await expect(call.locator('p')).toHaveText(
    'Quick Cerebro lee el archivo del laminador (gramos, horas, colores) y hace este cálculo solo, con tus precios.',
  );
  const button = call.getByRole('link', { name: es.learn.cta.system(site.system.name) });
  await expect(button).toBeVisible();
  await expect(button).toHaveAttribute('href', '/talleres');
  // The black button of the block, not the green one of WhatsApp.
  await expect(button).not.toHaveClass(/\bwa\b/);
  await button.click();
  await expect(page).toHaveURL(/\/talleres$/);
});

test('el sitemap incluye las 3 páginas de Para talleres', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  for (const path of ['/talleres', '/talleres/precios', '/talleres/descargar']) {
    expect(xml).toContain(`${path}</loc>`);
  }
});
