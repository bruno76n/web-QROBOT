import { test, expect } from '@playwright/test';
import { es } from '@/i18n/es';

// docs/25 §2, §12: while `site.system.enabled` is false, the page for workshops does not exist in
// the production build (`pnpm preview`): every path under `/talleres`, also encoded, answers the
// site's 404 page, and nothing links to it (pages, sitemap, robots.txt).

const hiddenPaths = [
  '/talleres',
  '/talleres/',
  '/talleres/precios',
  '/talleres/descargar',
  '/talleres/x',
  '/%74alleres',
  '/talleres%2Fprecios',
];

test('every path of the page for workshops answers the 404 page', async ({ request }) => {
  for (const path of hiddenPaths) {
    const res = await request.get(path);
    expect(res.status(), path).toBe(404);
    const html = await res.text();
    expect(html, path).toContain(es.notFound.title);
    expect(html, path).not.toContain(es.system.home.title);
  }
});

test('no page, nor the sitemap or robots.txt, mentions /talleres', async ({ request }) => {
  for (const path of [
    '/',
    '/catalogo',
    '/aprende',
    '/aprende/negocio/costo',
    '/sitemap.xml',
    '/robots.txt',
  ]) {
    const res = await request.get(path);
    expect(res.status(), path).toBe(200);
    expect(await res.text(), path).not.toContain('/talleres');
  }
});
