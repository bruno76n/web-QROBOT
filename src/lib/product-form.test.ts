import { describe, expect, it } from 'vitest';
import { emptyValues, productFormSchema, toProductInput, valuesFromDetail } from './product-form';
import { productInputSchema } from './schemas';
import type { ProductDetail } from './admin-types';

describe('productFormSchema', () => {
  const ok = { ...emptyValues(), name: 'Gato' };
  it('accepts a draft with only a name', () => {
    expect(productFormSchema.safeParse(ok).success).toBe(true);
  });
  it('asks for the name, validates price text and slug', () => {
    expect(productFormSchema.safeParse({ ...ok, name: '  ' }).error?.issues[0]?.message).toBe(
      'Este dato es obligatorio.',
    );
    expect(productFormSchema.safeParse({ ...ok, priceText: 'abc' }).success).toBe(false);
    expect(productFormSchema.safeParse({ ...ok, priceText: '1,250' }).success).toBe(true);
    expect(productFormSchema.safeParse({ ...ok, slug: 'Mal Slug' }).success).toBe(false);
  });
  it('enforces the same text limits as the server', () => {
    expect(productFormSchema.safeParse({ ...ok, short: 'x'.repeat(121) }).success).toBe(false);
    expect(productFormSchema.safeParse({ ...ok, description: 'x'.repeat(2001) }).success).toBe(
      false,
    );
  });
});

describe('toProductInput', () => {
  it('produces input the server schema accepts, in cents', () => {
    const input = toProductInput(
      {
        ...emptyValues(),
        name: ' Gato ',
        priceText: '$1,250.50',
        categories: ['casa'],
        colors: ['verde'],
        personalHint: 'Nombre',
        personalizable: false,
      },
      [
        {
          id: 'p1',
          crop: { x: 0, y: 0, width: 800, height: 800 },
          version: 'abcdef12',
          widths: [400, 800],
          alt: '',
        },
      ],
      'abc',
    );
    expect(input).toMatchObject({
      id: 'abc',
      name: 'Gato',
      priceFromCents: 125050,
      personalHint: '',
    });
    expect(productInputSchema.safeParse(input).success).toBe(true);
  });
  it('an empty price is null; no id for a new product', () => {
    const input = toProductInput({ ...emptyValues(), name: 'x' }, []);
    expect(input.priceFromCents).toBeNull();
    expect('id' in input).toBe(false);
  });
});

describe('valuesFromDetail', () => {
  it('turns cents into the price field', () => {
    const detail = {
      id: 'a',
      slug: 'gato',
      name: 'Gato',
      unitSingular: '',
      unitPlural: '',
      short: '',
      description: '',
      priceFromCents: 18000,
      priceNote: 'n',
      size: '',
      material: 'PLA',
      leadTime: '',
      personalizable: true,
      personalHint: 'h',
      featured: true,
      published: true,
      everPublished: true,
      categories: ['casa'],
      colors: ['verde'],
      photos: [],
    } satisfies ProductDetail;
    expect(valuesFromDetail(detail)).toMatchObject({
      priceText: '180',
      personalizable: true,
      featured: true,
    });
  });
});
