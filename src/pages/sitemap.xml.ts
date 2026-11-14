/**
 * `/sitemap.xml`: fixed pages, every category, every published product and every published page of
 * Aprende (read from D1).
 * Cached for an hour; the panel and the API are not listed.
 */
import type { APIRoute } from 'astro';
import { site } from '@/config/site';
import { sitemapXml } from '@/lib/seo';
import { listCategories } from '@/server/queries/categories';
import { listSitemapProducts } from '@/server/queries/public';
import { listLearnSitemap } from '@/server/queries/learn';
import { learnUrl } from '@/lib/learn/content';

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
