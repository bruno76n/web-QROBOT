import { describe, expect, it } from 'vitest';
import {
  articleJsonLd,
  definedTermSetJsonLd,
  absoluteUrl,
  jsonLdString,
  breadcrumbJsonLd,
  localBusinessJsonLd,
  productDescription,
  productJsonLd,
  productTitle,
  robotsTxt,
  sitemapXml,
} from './seo';

const domain = 'https://quickrobot.example';

describe('titles and URLs', () => {
  it('product title carries the price (docs/14 §1)', () => {
    expect(productTitle('Llaveros con nombre', 5000)).toBe(
      'Llaveros con nombre desde $50 · Quick Robot',
    );
    expect(productTitle('Algo', null)).toBe('Algo · Quick Robot');
    expect(productDescription('Con tu nombre.')).toBe('Con tu nombre. Impresión 3D.');
    expect(productDescription('')).toBe('Impresión 3D.');
  });
  it('builds absolute URLs without double slashes', () => {
    expect(absoluteUrl(domain + '/', '/producto/a')).toBe('https://quickrobot.example/producto/a');
    expect(absoluteUrl(domain, 'https://img.x/a.jpg')).toBe('https://img.x/a.jpg');
  });
});

describe('JSON-LD (docs/14 §2) against the expected output', () => {
  it('Product with AggregateOffer', () => {
    expect(
      productJsonLd({
        domain,
        slug: 'llaveros-con-nombre',
        name: 'Llaveros con nombre',
        description: 'Con tu nombre. Impresión 3D.',
        priceFromCents: 5000,
        images: ['https://img.quickrobot.example/ph/a/v/1200.webp'],
      }),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Llaveros con nombre',
      description: 'Con tu nombre. Impresión 3D.',
      url: 'https://quickrobot.example/producto/llaveros-con-nombre',
      image: ['https://img.quickrobot.example/ph/a/v/1200.webp'],
      brand: { '@type': 'Brand', name: 'Quick Robot' },
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: '50.00',
        priceCurrency: 'MXN',
        availability: 'https://schema.org/InStock',
      },
    });
  });
  it('without a price there is no offer; without photos no image', () => {
    const ld = productJsonLd({
      domain,
      slug: 'a',
      name: 'A',
      description: '',
      priceFromCents: null,
      images: [],
    });
    expect(ld).not.toHaveProperty('offers');
    expect(ld).not.toHaveProperty('image');
  });
  it('BreadcrumbList positions and absolute items', () => {
    expect(
      breadcrumbJsonLd(domain, [
        { name: 'Catálogo', href: '/catalogo' },
        { name: 'Para la casa', href: '/catalogo/casa' },
        { name: 'Gato' },
      ]),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Catálogo',
          item: 'https://quickrobot.example/catalogo',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Para la casa',
          item: 'https://quickrobot.example/catalogo/casa',
        },
        { '@type': 'ListItem', position: 3, name: 'Gato' },
      ],
    });
  });
  it('LocalBusiness with Guadalajara, optional phone and social links', () => {
    const ld = localBusinessJsonLd({
      domain,
      name: 'Quick Robot',
      logo: '/favicon.svg',
      image: '/brand/og-default.jpg',
      sameAs: [],
    });
    expect(ld).toMatchObject({
      '@type': 'LocalBusiness',
      areaServed: 'Guadalajara',
      logo: 'https://quickrobot.example/favicon.svg',
    });
    expect(ld).not.toHaveProperty('telephone');
    expect(ld).not.toHaveProperty('sameAs');
    expect(
      localBusinessJsonLd({
        domain,
        name: 'Q',
        logo: '/l',
        image: '/i',
        telephone: '+52 33',
        sameAs: ['https://fb.com/q'],
      }),
    ).toMatchObject({ telephone: '+52 33', sameAs: ['https://fb.com/q'] });
  });
});

describe('sitemap and robots', () => {
  it('lists URLs with lastmod and escapes XML', () => {
    const xml = sitemapXml(domain, [
      { path: '/' },
      { path: '/producto/a&b', lastmod: new Date('2026-11-04T10:00:00Z') },
    ]);
    expect(xml).toContain('<loc>https://quickrobot.example/</loc>');
    expect(xml).toContain(
      '<loc>https://quickrobot.example/producto/a&amp;b</loc><lastmod>2026-11-04</lastmod>',
    );
    expect(xml.startsWith('<?xml')).toBe(true);
  });
  it('robots blocks the panel and the API and points to the sitemap', () => {
    const txt = robotsTxt(domain);
    expect(txt).toContain('Disallow: /admin');
    expect(txt).toContain('Disallow: /api');
    expect(txt).toContain('Sitemap: https://quickrobot.example/sitemap.xml');
  });
});

describe('jsonLdString', () => {
  it('cannot close the script tag or open markup, and stays valid JSON', () => {
    const nasty = { name: '</script><script>alert(1)</script> & <img onerror=x>' };
    const text = jsonLdString(nasty);
    expect(text).not.toContain('<');
    expect(text).not.toContain('>');
    expect(text).not.toContain('&');
    expect(JSON.parse(text)).toEqual(nasty);
  });
});

describe('Aprende structured data', () => {
  it('Article with date, language and Quick Robot as author and publisher', () => {
    const a = articleJsonLd({
      domain: 'https://quickrobot.example',
      path: '/aprende/filamentos/pla',
      headline: 'PLA',
      description: 'Para figuras.',
      updatedAt: new Date('2026-11-13T12:00:00Z'),
    });
    expect(a).toMatchObject({
      '@type': 'Article',
      headline: 'PLA',
      url: 'https://quickrobot.example/aprende/filamentos/pla',
      dateModified: '2026-11-13T12:00:00.000Z',
      inLanguage: 'es-MX',
      author: { '@type': 'Organization', name: 'Quick Robot' },
      publisher: { '@type': 'Organization', name: 'Quick Robot' },
    });
  });
  it('DefinedTermSet with one term per anchor', () => {
    const d = definedTermSetJsonLd('https://quickrobot.example', '/aprende/glosario', 'Glosario', [
      { name: 'Boquilla', description: 'Punta por donde sale el plástico.', id: 'boquilla' },
    ]);
    expect(d.hasDefinedTerm).toEqual([
      {
        '@type': 'DefinedTerm',
        name: 'Boquilla',
        description: 'Punta por donde sale el plástico.',
        url: 'https://quickrobot.example/aprende/glosario#boquilla',
      },
    ]);
  });
});
