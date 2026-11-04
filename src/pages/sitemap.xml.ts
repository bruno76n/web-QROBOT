import type { APIRoute } from 'astro';
import { categories } from '@/config/categories';
import { site } from '@/config/site';
import { sitemapXml } from '@/lib/seo';
import { listSitemapProducts } from '@/server/queries/public';

export const prerender = false;

/** Fixed pages plus every published product with its `lastmod` (docs/14 §3). */
export const GET: APIRoute = async () => {
  const products = await listSitemapProducts();
  const xml = sitemapXml(site.domain, [
    { path: '/' },
    { path: '/catalogo' },
    ...categories.map((c) => ({ path: `/catalogo/${c.id}` })),
    ...products.map((p) => ({ path: `/producto/${p.slug}`, lastmod: p.updatedAt })),
    { path: '/privacidad' },
  ]);
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
