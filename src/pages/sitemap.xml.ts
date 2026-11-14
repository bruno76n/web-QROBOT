/**
 * `/sitemap.xml`: fixed pages, every category, every published product and every published page of
 * Aprende (read from D1), plus the 3 pages for workshops only while they are visible (docs/25 §2).
 * Cached for an hour; the panel and the API are not listed.
 */
import type { APIRoute } from 'astro';
import { site } from '@/config/site';
import { sitemapXml } from '@/lib/seo';
import { listCategories } from '@/server/queries/categories';
import { listSitemapProducts } from '@/server/queries/public';
import { listLearnSitemap } from '@/server/queries/learn';
import { learnUrl } from '@/lib/learn/content';
import { systemVisible } from '@/config/system';
import { systemBase } from '@/lib/system/visibility';

export const prerender = false;

/** Fixed pages plus every published product with its `lastmod` (docs/14 §3). */
export const GET: APIRoute = async () => {
  const [products, categories, learn] = await Promise.all([
    listSitemapProducts(),
    listCategories(),
    listLearnSitemap(),
  ]);
  const xml = sitemapXml(site.domain, [
    { path: '/' },
    { path: '/catalogo' },
    ...categories.map((c) => ({ path: `/catalogo/${c.id}` })),
    ...products.map((p) => ({ path: `/producto/${p.slug}`, lastmod: p.updatedAt })),
    { path: '/privacidad' },
    // Para talleres: listed only with `systemVisible`, so nothing announces the hidden pages.
    ...(systemVisible
      ? [systemBase, `${systemBase}/precios`, `${systemBase}/descargar`].map((path) => ({ path }))
      : []),
    // Aprende: home, topics, answers and glossary; the results page is not listed (`noindex`).
    ...learn.map((p) => ({ path: learnUrl(p.slug), lastmod: p.updatedAt })),
  ]);
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
