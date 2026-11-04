import { formatMoney } from './money';

/** Absolute URL from the site domain and a path; absolute inputs pass through (docs/14 §1). */
export function absoluteUrl(domain: string, pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${domain.replace(/\/+$/, '')}/${pathOrUrl.replace(/^\/+/, '')}`;
}

export interface Crumb {
  name: string;
  /** Path or URL; the last crumb (the page itself) may omit it. */
  href?: string;
}

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

export interface BusinessSeoInput {
  domain: string;
  name: string;
  logo: string;
  image: string;
  telephone?: string | null;
  sameAs: string[];
}

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

export function productDescription(short: string): string {
  const base = short.trim();
  return base ? `${base} Impresión 3D en Guadalajara.` : 'Impresión 3D en Guadalajara.';
}

export interface SitemapEntry {
  path: string;
  lastmod?: Date;
}

const xmlEscape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function sitemapXml(domain: string, entries: SitemapEntry[]): string {
  const urls = entries
    .map(
      (e) =>
        `  <url><loc>${xmlEscape(absoluteUrl(domain, e.path))}</loc>${e.lastmod ? `<lastmod>${e.lastmod.toISOString().slice(0, 10)}</lastmod>` : ''}</url>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

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
