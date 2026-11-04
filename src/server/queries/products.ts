import { and, asc, eq, inArray } from 'drizzle-orm';
import type { ProductDetail, ProductRow } from '@/lib/admin-types';
import { categoryIds, type CategoryId } from '@/config/categories';
import type { ColorId } from '@/config/colors';
import { getDb, schema, type Db } from '../db/client';
import { getEnv } from '../env';
import { toPhotoView } from './photos';

const byCategoryOrder = (a: string, b: string) =>
  categoryIds.indexOf(a as CategoryId) - categoryIds.indexOf(b as CategoryId);

/** Every product for the panel list, with status and first photo, in catalog order. */
export async function listAllProductsForAdmin(
  db: Db = getDb(),
  imgBase: string = getEnv().PUBLIC_IMG_BASE,
): Promise<ProductRow[]> {
  const products = await db
    .select()
    .from(schema.products)
    .orderBy(asc(schema.products.sortOrder), asc(schema.products.createdAt));
  if (products.length === 0) return [];
  const ids = products.map((p) => p.id);

  // D1 limits bound parameters per query, so big lists are read in chunks.
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += 80) chunks.push(ids.slice(i, i + 80));
  const cats = (
    await Promise.all(
      chunks.map((c) =>
        db
          .select()
          .from(schema.productCategories)
          .where(inArray(schema.productCategories.productId, c)),
      ),
    )
  ).flat();
  const photos = (
    await Promise.all(
      chunks.map((c) =>
        db
          .select()
          .from(schema.photos)
          .where(and(eq(schema.photos.ownerType, 'product'), inArray(schema.photos.ownerId, c)))
          .orderBy(asc(schema.photos.sortOrder)),
      ),
    )
  ).flat();

  return products.map((p) => {
    const own = photos.filter((ph) => ph.ownerId === p.id && ph.status === 'attached');
    const first = own[0] ? toPhotoView(own[0], imgBase) : null;
    const smallest = first
      ? Object.keys(first.urls).sort((a, b) => Number(a) - Number(b))[0]
      : undefined;
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      priceFromCents: p.priceFromCents,
      published: p.published,
      featured: p.featured,
      categories: cats
        .filter((c) => c.productId === p.id)
        .map((c) => c.category as CategoryId)
        .sort(byCategoryOrder),
      photoCount: own.length,
      thumbUrl: first && smallest ? (first.urls[smallest] ?? null) : null,
      sortOrder: p.sortOrder,
    };
  });
}

/** Everything about one product, including photos with crop, version, widths and alt. */
export async function getProductForAdmin(
  id: string,
  db: Db = getDb(),
  imgBase: string = getEnv().PUBLIC_IMG_BASE,
): Promise<ProductDetail | null> {
  const [p] = await db.select().from(schema.products).where(eq(schema.products.id, id));
  if (!p) return null;
  const [cats, cols, photos] = await Promise.all([
    db.select().from(schema.productCategories).where(eq(schema.productCategories.productId, id)),
    db
      .select()
      .from(schema.productColors)
      .where(eq(schema.productColors.productId, id))
      .orderBy(asc(schema.productColors.sortOrder)),
    db
      .select()
      .from(schema.photos)
      .where(
        and(
          eq(schema.photos.ownerType, 'product'),
          eq(schema.photos.ownerId, id),
          eq(schema.photos.status, 'attached'),
        ),
      )
      .orderBy(asc(schema.photos.sortOrder)),
  ]);
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    unitSingular: p.unitSingular,
    unitPlural: p.unitPlural,
    short: p.short,
    description: p.description,
    priceFromCents: p.priceFromCents,
    priceNote: p.priceNote,
    size: p.size,
    material: p.material,
    leadTime: p.leadTime,
    personalizable: p.personalizable,
    personalHint: p.personalHint,
    featured: p.featured,
    published: p.published,
    everPublished: p.everPublished,
    categories: cats.map((c) => c.category as CategoryId).sort(byCategoryOrder),
    colors: cols.map((c) => c.color as ColorId),
    photos: photos.map((ph) => toPhotoView(ph, imgBase)),
  };
}
