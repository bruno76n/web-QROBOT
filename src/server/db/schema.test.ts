import { describe, expect, it } from 'vitest';
import { env } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { getDb, schema } from './client';

const product = (id: string, slug: string) => ({ id, slug, name: `Producto ${id}` });
const photo = (id: string, ownerId: string | null) => ({
  id,
  ownerType: 'product' as const,
  ownerId,
  originalKey: `ph/${id}/original.jpg`,
  originalWidth: 800,
  originalHeight: 800,
  cropX: 0,
  cropY: 0,
  cropWidth: 800,
  cropHeight: 800,
  aspect: '1:1' as const,
  version: 'v1',
  widths: JSON.stringify([400, 800]),
});

describe('schema (local D1)', () => {
  it('stores and reads a product with categories, colors and photos', async () => {
    const db = getDb(env.DB);
    await db.insert(schema.products).values({ ...product('p1', 'llaveros'), priceFromCents: 5000 });
    await db.insert(schema.productCategories).values([
      { productId: 'p1', category: 'casa' },
      { productId: 'p1', category: 'navidad' },
    ]);
    await db.insert(schema.productColors).values([
      { productId: 'p1', color: 'morado', sortOrder: 0 },
      { productId: 'p1', color: 'verde', sortOrder: 1 },
    ]);
    await db.insert(schema.photos).values({ ...photo('f1', 'p1'), status: 'attached' });

    const [row] = await db.select().from(schema.products).where(eq(schema.products.id, 'p1'));
    expect(row).toMatchObject({
      slug: 'llaveros',
      priceFromCents: 5000,
      priceNote: 'Baja si pides varias.',
      material: 'PLA',
      published: false,
      featured: false,
      personalizable: false,
      sortOrder: 0,
    });
    expect(row?.createdAt).toBeInstanceOf(Date);
    expect(await db.select().from(schema.productCategories)).toHaveLength(2);
    expect(await db.select().from(schema.productColors)).toHaveLength(2);
    const [ph] = await db.select().from(schema.photos);
    expect(ph).toMatchObject({ status: 'attached', widths: '[400,800]', alt: '' });
  });

  it('keeps slugs unique', async () => {
    const db = getDb(env.DB);
    await db.insert(schema.products).values(product('a', 'igual'));
    await expect(db.insert(schema.products).values(product('b', 'igual'))).rejects.toThrow();
  });

  it('deleting a product deletes its categories and colors', async () => {
    const db = getDb(env.DB);
    await db.insert(schema.products).values(product('c', 'cascada'));
    await db.insert(schema.productCategories).values({ productId: 'c', category: 'casa' });
    await db.insert(schema.productColors).values({ productId: 'c', color: 'azul' });
    await db.delete(schema.products).where(eq(schema.products.id, 'c'));
    expect(
      await db
        .select()
        .from(schema.productCategories)
        .where(eq(schema.productCategories.productId, 'c')),
    ).toEqual([]);
    expect(
      await db.select().from(schema.productColors).where(eq(schema.productColors.productId, 'c')),
    ).toEqual([]);
  });

  it('a hero slide needs an existing desktop photo', async () => {
    const db = getDb(env.DB);
    await expect(
      db.insert(schema.heroSlides).values({ id: 's1', desktopPhotoId: 'missing' }),
    ).rejects.toThrow();
    await db
      .insert(schema.photos)
      .values({ ...photo('h1', null), ownerType: 'hero_desktop', aspect: '16:9' });
    await db.insert(schema.heroSlides).values({ id: 's1', desktopPhotoId: 'h1' });
    expect(await db.select().from(schema.heroSlides)).toHaveLength(1);
  });
});
