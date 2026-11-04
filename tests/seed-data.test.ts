import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { categoryIds } from '@/config/categories';
import { colorIds } from '@/config/colors';
import { seedProducts } from '../scripts/seed-data';

// docs/05 §4: the 14 example products, in catalog order.
describe('seed data', () => {
  it('has the 14 products in the order of the table', () => {
    expect(seedProducts.map((p) => p.slug)).toEqual([
      'llaveros-con-nombre',
      'servilleteros-con-tu-logo',
      'numeros-de-mesa',
      'porta-qr',
      'tu-en-miniatura',
      'q-404',
      'macetas',
      'floreros',
      'buho',
      'gato',
      'dinosaurio',
      'estrella-con-nombre',
      'arbolito-de-navidad',
      'casita-de-jengibre',
    ]);
  });
  it('uses only known categories and colors, and slugs are unique', () => {
    for (const p of seedProducts) {
      for (const c of p.categories) expect(categoryIds, p.slug).toContain(c);
      for (const c of p.colors) expect(colorIds, p.slug).toContain(c);
    }
    expect(new Set(seedProducts.map((p) => p.slug)).size).toBe(14);
  });
  it('every photo exists in reference/seed-photos', () => {
    for (const p of seedProducts) {
      for (const n of p.photos) {
        expect(existsSync(`reference/seed-photos/${p.slug}-${n}.webp`), `${p.slug}-${n}`).toBe(
          true,
        );
      }
    }
  });
  it('the featured products are the four of the table', () => {
    expect(seedProducts.filter((p) => p.featured).map((p) => p.slug)).toEqual([
      'llaveros-con-nombre',
      'tu-en-miniatura',
      'q-404',
      'estrella-con-nombre',
    ]);
  });
  it('Q-404 has six photos and prices are the ones of the table', () => {
    expect(seedProducts.find((p) => p.slug === 'q-404')?.photos).toHaveLength(6);
    expect(seedProducts.map((p) => p.from)).toEqual([
      50, 180, 60, 120, 650, 350, 150, 220, 180, 180, 200, 60, 250, 320,
    ]);
  });
});
