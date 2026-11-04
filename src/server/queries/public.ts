import { and, asc, eq, inArray, ne } from 'drizzle-orm';
import { categoryIds, type CategoryId } from '@/config/categories';
import type { ColorId } from '@/config/colors';
import type { PhotoSrc } from '@/lib/photos';
import { getDb, schema, type Db } from '../db/client';
import type { Photo } from '../db/schema';

/** Card of the catalog (docs/10 §2): only published products ever reach a public page. */
export interface CardView {
  id: string;
  slug: string;
  name: string;
  short: string;
  priceFromCents: number | null;
  featured: boolean;
  /** Main category: the first one in `categories.ts` (breadcrumbs, labels). */
  category: CategoryId | null;
  photo: PhotoSrc | null;
}

export interface ProductPageView extends CardView {
  description: string;
  priceNote: string;
  size: string;
  material: string;
  leadTime: string;
  unitSingular: string;
  unitPlural: string;
  personalizable: boolean;
  personalHint: string;
  categories: CategoryId[];
  colors: ColorId[];
  photos: PhotoSrc[];
  updatedAt: Date;
}

const toSrc = (p: Photo, fallbackAlt: string): PhotoSrc => ({
  id: p.id,
  alt: p.alt.trim() || fallbackAlt,
  version: p.version,
  widths: (JSON.parse(p.widths) as number[]).filter(Number.isInteger),
  aspect: p.aspect,
});

const byCategoryOrder = (a: string, b: string) =>
  categoryIds.indexOf(a as CategoryId) - categoryIds.indexOf(b as CategoryId);

const chunks = <T>(items: T[], size: number) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) =>
    items.slice(i * size, i * size + size),
  );

async function toCards(
  db: Db,
  products: (typeof schema.products.$inferSelect)[],
): Promise<CardView[]> {
  if (products.length === 0) return [];
  const groups = chunks(
    products.map((p) => p.id),
    80,
  );
  const photos = (
    await Promise.all(
      groups.map((ids) =>
        db
          .select()
          .from(schema.photos)
          .where(
            and(
              eq(schema.photos.ownerType, 'product'),
              eq(schema.photos.status, 'attached'),
              inArray(schema.photos.ownerId, ids),
            ),
          )
          .orderBy(asc(schema.photos.sortOrder)),
      ),
    )
  ).flat();
  const cats = (
    await Promise.all(
      groups.map((ids) =>
        db
          .select()
          .from(schema.productCategories)
          .where(inArray(schema.productCategories.productId, ids)),
      ),
    )
  ).flat();
  return products.map((p) => {
    const first = photos.find((ph) => ph.ownerId === p.id);
    const category = cats
      .filter((c) => c.productId === p.id)
      .map((c) => c.category)
      .sort(byCategoryOrder)[0] as CategoryId | undefined;
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      short: p.short,
      priceFromCents: p.priceFromCents,
      featured: p.featured,
      category: category ?? null,
      photo: first ? toSrc(first, p.name) : null,
    };
  });
}

/** Published products in catalog order, optionally of one category. */
export async function listPublishedProducts(
  opts: { category?: CategoryId } = {},
  db: Db = getDb(),
): Promise<CardView[]> {
  const published = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.published, true))
    .orderBy(asc(schema.products.sortOrder), asc(schema.products.createdAt));
  let list = published;
  if (opts.category) {
    const inCategory = new Set(
      (
        await db
          .select({ id: schema.productCategories.productId })
          .from(schema.productCategories)
          .where(eq(schema.productCategories.category, opts.category))
      ).map((r) => r.id),
    );
    list = published.filter((p) => inCategory.has(p.id));
  }
  return toCards(db, list);
}

/** One product with everything its page needs; null when it does not exist or is hidden. */
export async function getPublishedProduct(
  slug: string,
  db: Db = getDb(),
): Promise<ProductPageView | null> {
  const [p] = await db
    .select()
    .from(schema.products)
    .where(and(eq(schema.products.slug, slug), eq(schema.products.published, true)));
  if (!p) return null;
  const [cats, cols, photos] = await Promise.all([
    db.select().from(schema.productCategories).where(eq(schema.productCategories.productId, p.id)),
    db
      .select()
      .from(schema.productColors)
      .where(eq(schema.productColors.productId, p.id))
      .orderBy(asc(schema.productColors.sortOrder)),
    db
      .select()
      .from(schema.photos)
      .where(
        and(
          eq(schema.photos.ownerType, 'product'),
          eq(schema.photos.ownerId, p.id),
          eq(schema.photos.status, 'attached'),
        ),
      )
      .orderBy(asc(schema.photos.sortOrder)),
  ]);
  const categories = cats.map((c) => c.category as CategoryId).sort(byCategoryOrder);
  const srcs = photos.map((ph) => toSrc(ph, p.name));
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    short: p.short,
    priceFromCents: p.priceFromCents,
    featured: p.featured,
    category: categories[0] ?? null,
    photo: srcs[0] ?? null,
    description: p.description,
    priceNote: p.priceNote,
    size: p.size,
    material: p.material,
    leadTime: p.leadTime,
    unitSingular: p.unitSingular,
    unitPlural: p.unitPlural,
    personalizable: p.personalizable,
    personalHint: p.personalHint,
    categories,
    colors: cols.map((c) => c.color as ColorId),
    photos: srcs,
    updatedAt: p.updatedAt,
  };
}

/** Up to `limit` other published products that share a category, in catalog order. */
export async function listRelated(
  product: Pick<ProductPageView, 'id' | 'categories'>,
  limit = 4,
  db: Db = getDb(),
): Promise<CardView[]> {
  if (product.categories.length === 0) return [];
  const sharing = new Set(
    (
      await db
        .select({ id: schema.productCategories.productId })
        .from(schema.productCategories)
        .where(inArray(schema.productCategories.category, product.categories))
    ).map((r) => r.id),
  );
  const published = await db
    .select()
    .from(schema.products)
    .where(and(eq(schema.products.published, true), ne(schema.products.id, product.id)))
    .orderBy(asc(schema.products.sortOrder), asc(schema.products.createdAt));
  return toCards(db, published.filter((p) => sharing.has(p.id)).slice(0, limit));
}

/** Slug and last change of every published product, for the sitemap. */
export async function listSitemapProducts(
  db: Db = getDb(),
): Promise<{ slug: string; updatedAt: Date }[]> {
  return db
    .select({ slug: schema.products.slug, updatedAt: schema.products.updatedAt })
    .from(schema.products)
    .where(eq(schema.products.published, true))
    .orderBy(asc(schema.products.sortOrder));
}

/** The first `limit` published Christmas products marked "Más pedido", in catalog order (docs/04 §2.2). */
export async function listChristmasPicks(limit = 4, db: Db = getDb()): Promise<CardView[]> {
  const all = await listPublishedProducts({ category: 'navidad' }, db);
  return all.filter((p) => p.featured).slice(0, limit);
}

/** "Price from" of one published product, or null (for the Q-404 section). */
export async function getProductPrice(slug: string, db: Db = getDb()): Promise<number | null> {
  const [row] = await db
    .select({ price: schema.products.priceFromCents })
    .from(schema.products)
    .where(and(eq(schema.products.slug, slug), eq(schema.products.published, true)));
  return row?.price ?? null;
}
