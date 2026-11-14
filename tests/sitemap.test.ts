/**
 * `/sitemap.xml` (docs/14 §3): the 3 pages for workshops are listed only with `systemVisible`
 * (docs/25 §2); the rest of the list does not depend on the switch. The D1 queries are replaced by
 * fixed rows so the route runs in plain Node.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { APIContext } from 'astro';

const state = vi.hoisted(() => ({ visible: false }));
vi.mock('@/config/system', () => ({
  get systemVisible() {
    return state.visible;
  },
}));
vi.mock('@/server/queries/categories', () => ({
  listCategories: async () => [{ id: 'navidad' }],
}));
vi.mock('@/server/queries/public', () => ({
  listSitemapProducts: async () => [
    { slug: 'llavero', updatedAt: new Date('2026-11-01T00:00:00Z') },
  ],
}));
vi.mock('@/server/queries/learn', () => ({
  listLearnSitemap: async () => [
    { slug: 'negocio/costo', updatedAt: new Date('2026-11-02T00:00:00Z') },
  ],
}));

const { GET } = await import('../src/pages/sitemap.xml');
const { site } = await import('../src/config/site');
const { absoluteUrl } = await import('../src/lib/seo');

const loc = (path: string) => `<loc>${absoluteUrl(site.domain, path)}</loc>`;

const systemPaths = ['/talleres', '/talleres/precios', '/talleres/descargar'];

async function sitemap(): Promise<string> {
  const res = await GET({} as APIContext);
  expect(res.headers.get('Content-Type')).toContain('application/xml');
  return res.text();
}

describe('sitemap.xml', () => {
  beforeEach(() => {
    state.visible = false;
  });

  it('hidden: no page for workshops, the rest as always', async () => {
    const xml = await sitemap();
    expect(xml).not.toContain('talleres');
    for (const path of [
      '/catalogo/navidad',
      '/producto/llavero',
      '/privacidad',
      '/aprende/negocio/costo',
    ]) {
      expect(xml).toContain(loc(path));
    }
  });

  it('visible: the 3 pages for workshops are listed', async () => {
    state.visible = true;
    const xml = await sitemap();
    for (const path of systemPaths) expect(xml).toContain(loc(path));
    expect(xml).toContain(loc('/privacidad'));
  });
});
