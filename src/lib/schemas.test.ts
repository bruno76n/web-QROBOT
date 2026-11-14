import { describe, expect, it } from 'vitest';
import {
  heroInputSchema,
  learnPageInputSchema,
  learnSearchMissesInputSchema,
  learnSetPublishedSchema,
  productInputSchema,
  reorderSchema,
  uploadFieldsSchema,
} from './schemas';

const photo = {
  id: 'f1',
  crop: { x: 0, y: 0, width: 800, height: 800 },
  version: 'abcdef12',
  widths: [400, 800],
  alt: '',
};
const minimal = { name: 'Gato', categories: ['casa'], colors: ['verde'], photos: [] };

describe('productInputSchema', () => {
  it('accepts a minimal draft and fills defaults', () => {
    const p = productInputSchema.parse(minimal);
    expect(p).toMatchObject({
      slug: '',
      priceFromCents: null,
      priceNote: 'Baja si pides varias.',
      material: 'PLA',
      published: false,
      featured: false,
    });
  });
  it('rejects empty and too long names', () => {
    expect(productInputSchema.safeParse({ ...minimal, name: '   ' }).success).toBe(false);
    expect(productInputSchema.safeParse({ ...minimal, name: 'x'.repeat(81) }).success).toBe(false);
  });
  it('rejects bad slugs, malformed category ids and unknown colors, and too many items', () => {
    expect(productInputSchema.safeParse({ ...minimal, slug: 'Con Espacios' }).success).toBe(false);
    expect(productInputSchema.safeParse({ ...minimal, categories: ['Otra Cosa'] }).success).toBe(
      false,
    );
    expect(productInputSchema.safeParse({ ...minimal, colors: ['fucsia'] }).success).toBe(false);
    // The limit of 10 photos is a business rule: saveProduct answers TOO_MANY_PHOTOS.
    expect(
      productInputSchema.safeParse({ ...minimal, photos: Array.from({ length: 11 }, () => photo) })
        .success,
    ).toBe(true);
    expect(
      productInputSchema.safeParse({ ...minimal, photos: Array.from({ length: 101 }, () => photo) })
        .success,
    ).toBe(false);
  });
  it('rejects repeated categories and colors', () => {
    expect(productInputSchema.safeParse({ ...minimal, categories: ['casa', 'casa'] }).success).toBe(
      false,
    );
    expect(productInputSchema.safeParse({ ...minimal, colors: ['verde', 'verde'] }).success).toBe(
      false,
    );
  });
  it('rejects limits on text fields', () => {
    expect(productInputSchema.safeParse({ ...minimal, short: 'x'.repeat(121) }).success).toBe(
      false,
    );
    expect(
      productInputSchema.safeParse({ ...minimal, description: 'x'.repeat(2001) }).success,
    ).toBe(false);
    expect(productInputSchema.safeParse({ ...minimal, priceFromCents: -1 }).success).toBe(false);
    expect(productInputSchema.safeParse({ ...minimal, priceFromCents: 1.5 }).success).toBe(false);
  });
  it('keeps markup as plain text (it is escaped when shown)', () => {
    const p = productInputSchema.parse({ ...minimal, name: '<script>alert(1)</script>' });
    expect(p.name).toBe('<script>alert(1)</script>');
  });
});

describe('heroInputSchema', () => {
  it('allows only the four intervals (the limit of 6 slides is a business rule)', () => {
    const slide = { desktop: photo };
    expect(
      heroInputSchema.safeParse({ slides: Array.from({ length: 7 }, () => slide) }).success,
    ).toBe(true);
    expect(
      heroInputSchema.safeParse({ slides: Array.from({ length: 51 }, () => slide) }).success,
    ).toBe(false);
    expect(heroInputSchema.safeParse({ slides: [], intervalSeconds: 5 }).success).toBe(false);
    expect(heroInputSchema.parse({ slides: [] }).intervalSeconds).toBe(6);
  });
});

describe('reorderSchema and uploadFieldsSchema', () => {
  it('reorder takes a list of ids', () => {
    expect(reorderSchema.safeParse({ ids: ['a', 'b'] }).success).toBe(true);
    expect(reorderSchema.safeParse({ ids: [''] }).success).toBe(false);
  });
  it('upload fields come as strings from FormData', () => {
    const parsed = uploadFieldsSchema.parse({
      kind: 'product',
      aspect: '1:1',
      cropX: '0',
      cropY: '10',
      cropWidth: '800',
      cropHeight: '800',
      originalWidth: '1000',
      originalHeight: '1000',
      widths: '[400,800]',
    });
    expect(parsed.cropY).toBe(10);
    expect(parsed.widths).toEqual([400, 800]);
    expect(
      uploadFieldsSchema.safeParse({
        ...parsed,
        widths: 'not json',
        cropX: '0',
        cropY: '0',
        cropWidth: '1',
        cropHeight: '1',
        originalWidth: '1',
        originalHeight: '1',
      }).success,
    ).toBe(false);
  });
});

describe('learnPageInputSchema', () => {
  const page = {
    id: 'learn-filamentos-pla',
    title: 'PLA',
    subtitle: '',
    summary: '',
    bodyMd: '',
    tags: [],
    related: ['filamentos/petg', ''],
    sources: [],
    faqs: [{ q: '¿Sí?', a: 'Sí.' }],
    published: true,
    cta: 'whatsapp',
  };
  it('accepts the editable fields and fills the button text', () => {
    expect(learnPageInputSchema.parse(page)).toMatchObject({
      ctaText: '',
      related: ['filamentos/petg', ''],
    });
  });
  it('keeps the rules of the page files', () => {
    const bad = (o: object) => learnPageInputSchema.safeParse({ ...page, ...o }).success;
    expect(bad({ title: '' })).toBe(false);
    expect(bad({ title: 'x'.repeat(121) })).toBe(false);
    expect(bad({ summary: 'x'.repeat(501) })).toBe(false);
    expect(bad({ cta: 'email' })).toBe(false);
    expect(bad({ related: ['Con Espacios'] })).toBe(false);
    expect(bad({ faqs: [{ q: '', a: 'x' }] })).toBe(false);
    expect(bad({ tags: Array.from({ length: 41 }, (_, i) => `t${i}`) })).toBe(false);
    expect(bad({ bodyMd: 'x'.repeat(100_001) })).toBe(false);
    expect(bad({ id: '' })).toBe(false);
  });
  it('slug, topic and kind are not part of it', () => {
    const parsed = learnPageInputSchema.parse({ ...page, slug: 'otra', topic: 'x', kind: 'home' });
    expect(parsed).not.toHaveProperty('slug');
    expect(parsed).not.toHaveProperty('topic');
    expect(parsed).not.toHaveProperty('kind');
  });
});

describe('small learning inputs', () => {
  it('publish switch and misses window', () => {
    expect(learnSetPublishedSchema.safeParse({ id: 'learn-x', published: 'yes' }).success).toBe(
      false,
    );
    expect(learnSearchMissesInputSchema.parse({})).toEqual({ days: 30 });
    expect(learnSearchMissesInputSchema.safeParse({ days: 0 }).success).toBe(false);
    expect(learnSearchMissesInputSchema.safeParse({ days: 366 }).success).toBe(false);
  });
});
