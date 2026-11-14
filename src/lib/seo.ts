/** Structured data (JSON-LD), titles, sitemap and robots text for search engines (docs/14). Pure. */

import { formatMoney } from './money';

/** Absolute URL from the site domain and a path; absolute inputs pass through (docs/14 §1). */
export function absoluteUrl(domain: string, pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${domain.replace(/\/+$/, '')}/${pathOrUrl.replace(/^\/+/, '')}`;
}

/** One step of a breadcrumb trail. */
export interface Crumb {
  name: string;
  /** Path or URL; the last crumb (the page itself) may omit it. */
  href?: string;
}

/** `BreadcrumbList` structured data for a trail of pages. */
export function breadcrumbJsonLd(domain: string, crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      ...(c.href ? { item: absoluteUrl(domain, c.href) } : {}),
    })),
  };
}

/** What the `Article` structured data of an Aprende page needs (docs/21 §12). */
export interface ArticleSeoInput {
  domain: string;
  path: string;
  headline: string;
  description: string;
  updatedAt: Date;
}

/** `Article` for sheets, articles and problems of Aprende, written by Quick Robot. */
export function articleJsonLd(i: ArticleSeoInput) {
  const org = { '@type': 'Organization', name: 'Quick Robot', url: absoluteUrl(i.domain, '/') };
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: i.headline,
    description: i.description,
    url: absoluteUrl(i.domain, i.path),
    dateModified: i.updatedAt.toISOString(),
    inLanguage: 'es-MX',
    author: org,
    publisher: org,
  };
}

/** `DefinedTermSet` of the glossary: every term with its anchor (docs/21 §12). */
export function definedTermSetJsonLd(
  domain: string,
  path: string,
  name: string,
  terms: { name: string; description: string; id: string }[],
) {
  const url = absoluteUrl(domain, path);
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name,
    url,
    inLanguage: 'es-MX',
    hasDefinedTerm: terms.map((t) => ({
      '@type': 'DefinedTerm',
      name: t.name,
      description: t.description,
      url: `${url}#${t.id}`,
    })),
  };
}

/** What the `Product` structured data needs. */
export interface ProductSeoInput {
  domain: string;
  slug: string;
  name: string;
  description: string;
  priceFromCents: number | null;
  /** Absolute URLs of the 1200 px versions (or the largest that exists). */
  images: string[];
}

/** `Product` with an `AggregateOffer` from the "price from" (docs/14 §2). */
export function productJsonLd(i: ProductSeoInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: i.name,
    description: i.description,
    url: absoluteUrl(i.domain, `/producto/${i.slug}`),
    ...(i.images.length > 0 ? { image: i.images } : {}),
    brand: { '@type': 'Brand', name: 'Quick Robot' },
    ...(i.priceFromCents !== null
      ? {
          offers: {
            '@type': 'AggregateOffer',
            lowPrice: (i.priceFromCents / 100).toFixed(2),
            priceCurrency: 'MXN',
            availability: 'https://schema.org/InStock',
          },
        }
      : {}),
  };
}

/** What the `LocalBusiness` structured data needs. */
export interface BusinessSeoInput {
  domain: string;
  name: string;
  logo: string;
  image: string;
  telephone?: string | null;
  sameAs: string[];
}

/** `LocalBusiness` structured data for the whole site; phone and social links are optional. */
export function localBusinessJsonLd(i: BusinessSeoInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: i.name,
    url: i.domain,
    logo: absoluteUrl(i.domain, i.logo),
    image: absoluteUrl(i.domain, i.image),
    areaServed: 'Guadalajara',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Guadalajara',
      addressRegion: 'Jalisco',
      addressCountry: 'MX',
    },
    ...(i.telephone ? { telephone: i.telephone } : {}),
    ...(i.sameAs.length > 0 ? { sameAs: i.sameAs } : {}),
  };
}

/** `<title>` of a product page: "Llaveros desde $50 · Quick Robot" (docs/14 §1). */
export function productTitle(name: string, priceFromCents: number | null): string {
  return priceFromCents === null
    ? `${name} · Quick Robot`
    : `${name} desde ${formatMoney(priceFromCents)} · Quick Robot`;
}

/** Meta description of a product page: its short text plus "Impresión 3D.". */
export function productDescription(short: string): string {
  const base = short.trim();
  return base ? `${base} Impresión 3D.` : 'Impresión 3D.';
}

/** A page of the sitemap; `lastmod` is optional. */
export interface SitemapEntry {
  path: string;
  lastmod?: Date;
}

/** Escapes the characters that are special in XML text. */
const xmlEscape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** `sitemap.xml` for the given pages (absolute URLs, `lastmod` as `YYYY-MM-DD`). */
export function sitemapXml(domain: string, entries: SitemapEntry[]): string {
  const urls = entries
    .map(
      (e) =>
        `  <url><loc>${xmlEscape(absoluteUrl(domain, e.path))}</loc>${e.lastmod ? `<lastmod>${e.lastmod.toISOString().slice(0, 10)}</lastmod>` : ''}</url>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

/** `robots.txt`: allows the public site, blocks `/admin` and `/api`, points to the sitemap. */
export function robotsTxt(domain: string): string {
  return [
    'User-agent: *',
    'Disallow: /admin',
    'Disallow: /api',
    'Allow: /',
    '',
    `Sitemap: ${absoluteUrl(domain, '/sitemap.xml')}`,
    '',
  ].join('\n');
}

/**
 * JSON text safe to put inside `<script type="application/ld+json">`: `<`, `>`, `&` and the two
 * JS line separators are written as `\uXXXX`, so no product text can close the tag or start markup.
 */
export function jsonLdString(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
