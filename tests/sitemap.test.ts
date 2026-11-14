/**
 * `/sitemap.xml` (docs/14 §3, docs/25 §2): the 3 pages for workshops are listed only while the page
 * is visible (`systemVisible`); hidden, nothing under `/talleres` appears. The D1 queries are
 * replaced with fixed rows so the endpoint runs in plain Node.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ visible: false }));

vi.mock('@/config/system', () => ({
  get systemVisible() {
    return state.visible;
  },
}));
vi.mock('@/server/queries/categories', () => ({
  listCategories: async () => [{ id: 'llaveros' }],
}));
vi.mock('@/server/queries/public', () => ({
  listSitemapProducts: async () => [
    { slug: 'llavero-con-nombre', updatedAt: new Date('2026-11-01T00:00:00Z') },
  ],
}));
vi.mock('@/server/queries/learn', () => ({
  listLearnSitemap: async () => [
    { slug: '', updatedAt: new Date('2026-11-02T00:00:00Z') },
    { slug: 'negocio/costo', updatedAt: new Date('2026-11-03T00:00:00Z') },
  ],
}));

const { GET } = await import('../src/pages/sitemap.xml');
const { site } = await import('../src/config/site');

async function sitemap(): Promise<string> {
  const res = await (GET as unknown as () => Promise<Response>)();
  expect(res.headers.get('Content-Type')).toContain('application/xml');
  return res.text();
}

const systemUrls = ['/talleres', '/talleres/precios', '/talleres/descargar'].map(
  (p) => `<loc>${site.domain}${p}</loc>`,
);

describe('sitemap and the page for workshops', () => {
  beforeEach(() => {
    state.visible = false;
  });

  it('hidden: no /talleres at all, the rest is listed', async () => {
    const xml = await sitemap();
    expect(xml).not.toContain('/talleres');
    expect(xml).toContain(`<loc>${site.domain}/catalogo/llaveros</loc>`);
    expect(xml).toContain(`<loc>${site.domain}/producto/llavero-con-nombre</loc>`);
    expect(xml).toContain(`<loc>${site.domain}/aprende/negocio/costo</loc>`);
  });

  it('visible: home, pricing and download for workshops are listed', async () => {
    state.visible = true;
    const xml = await sitemap();
    for (const url of systemUrls) expect(xml).toContain(url);
    expect(xml.match(/\/talleres/g)).toHaveLength(3);
  });
});
