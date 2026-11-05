import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import { r2Keys } from '@/lib/crop';
import { limits, missingToPublish, slugForSave, slugFromName, uniqueSlug } from '@/lib/publish';
import { fail, ok, type Result } from '@/lib/result';
import type { ProductInput } from '@/lib/schemas';
import { schema } from '../db/client';
import { checkPhotoRefs } from './photos';
import { removePrefixes, runBatch, type AdminDeps } from './context';

const maxSortOrder = async ({ db }: AdminDeps) => {
  const [row] = await db
    .select({ max: sql<number | null>`max(${schema.products.sortOrder})` })
    .from(schema.products);
  return row?.max ?? -1;
};

const takenSlugs = async ({ db }: AdminDeps, exceptId?: string) =>
  new Set(
    (await db.select({ id: schema.products.id, slug: schema.products.slug }).from(schema.products))
      .filter((p) => p.id !== exceptId)
      .map((p) => p.slug),
  );

/** `admin.saveProduct`: creates or updates a product with its photos in one `db.batch` (docs/10 §3). */
export async function saveProduct(
  deps: AdminDeps,
  input: ProductInput,
): Promise<Result<{ id: string; slug: string }>> {
  const { db, bucket } = deps;
  const [existing] = input.id
    ? await db.select().from(schema.products).where(eq(schema.products.id, input.id))
    : [];
  if (input.id && !existing) return fail('NOT_FOUND');
  if (input.photos.length > limits.maxPhotos) return fail('TOO_MANY_PHOTOS');
  if (input.categories.length > 0) {
    const known = new Set(
      (await db.select({ id: schema.categories.id }).from(schema.categories)).map((c) => c.id),
    );
    if (input.categories.some((c) => !known.has(c))) return fail('UNKNOWN_CATEGORY');
  }

  // Slug: typed by hand → must be free; generated → made unique (docs/09 §3).
  const taken = await takenSlugs(deps, existing?.id);
  const typed = input.slug.trim();
  if (typed && taken.has(typed)) return fail('SLUG_TAKEN');
  const wanted = slugForSave({
    name: input.name,
    typedSlug: typed,
    currentSlug: existing?.slug,
    wasPublished: existing?.everPublished ?? false,
  });
  const slug = typed ? wanted : uniqueSlug(wanted || 'producto', taken);

  const missing = missingToPublish({
    name: input.name,
    slug,
    photoCount: input.photos.length,
    categoryCount: input.categories.length,
    priceFromCents: input.priceFromCents,
  });
  if (input.published && missing.length > 0) return fail('CANNOT_PUBLISH', { missing });

  const id = existing?.id ?? deps.newId();
  const checked = await checkPhotoRefs(db, bucket, input.photos, 'product', {
    id: existing ? id : null,
  });
  if (!Array.isArray(checked)) return checked;

  const now = new Date(deps.now());
  const values = {
    slug,
    name: input.name,
    unitSingular: input.unitSingular,
    unitPlural: input.unitPlural,
    short: input.short,
    description: input.description,
    priceFromCents: input.priceFromCents,
    priceNote: input.priceNote,
    size: input.size,
    material: input.material,
    leadTime: input.leadTime,
    customSize: input.customSize,
    personalizable: input.personalizable,
    personalHint: input.personalHint,
    featured: input.featured,
    published: input.published,
    everPublished: (existing?.everPublished ?? false) || input.published,
    updatedAt: now,
  };

  // Photos of this product that are no longer in the list.
  const keptIds = new Set(input.photos.map((p) => p.id));
  const previous = existing
    ? await db
        .select()
        .from(schema.photos)
        .where(and(eq(schema.photos.ownerType, 'product'), eq(schema.photos.ownerId, id)))
    : [];
  const removed = previous.filter((p) => !keptIds.has(p.id));

  const items = [
    existing
      ? db.update(schema.products).set(values).where(eq(schema.products.id, id))
      : db
          .insert(schema.products)
          .values({ id, ...values, sortOrder: (await maxSortOrder(deps)) + 1, createdAt: now }),
    db.delete(schema.productCategories).where(eq(schema.productCategories.productId, id)),
    ...input.categories.map((category) =>
      db.insert(schema.productCategories).values({ productId: id, category }),
    ),
    db.delete(schema.productColors).where(eq(schema.productColors.productId, id)),
    ...input.colors.map((color, i) =>
      db.insert(schema.productColors).values({ productId: id, color, sortOrder: i }),
    ),
    ...checked.map(({ ref, recentered }, i) =>
      db
        .update(schema.photos)
        .set({
          status: 'attached',
          ownerId: id,
          sortOrder: i,
          alt: ref.alt,
          updatedAt: now,
          ...(recentered
            ? {
                cropX: ref.crop.x,
                cropY: ref.crop.y,
                cropWidth: ref.crop.width,
                cropHeight: ref.crop.height,
                version: ref.version,
                widths: JSON.stringify([...ref.widths].sort((a, b) => a - b)),
              }
            : {}),
        })
        .where(eq(schema.photos.id, ref.id)),
    ),
    ...(removed.length > 0
      ? [
          db.delete(schema.photos).where(
            inArray(
              schema.photos.id,
              removed.map((p) => p.id),
            ),
          ),
        ]
      : []),
  ];
  await runBatch(db, items);

  // After the database is written: files of removed photos and of replaced versions.
  await removePrefixes(bucket, [
    ...removed.map((p) => r2Keys.prefix(p.id)),
    ...checked
      .filter((c) => c.recentered)
      .map((c) => r2Keys.versionPrefix(c.row.id, c.row.version)),
  ]);
  return ok({ id, slug });
}

/** `admin.setPublished`: the quick switch of the list. */
export async function setPublished(
  deps: AdminDeps,
  input: { id: string; published: boolean },
): Promise<Result<{ published: boolean }>> {
  const { db } = deps;
  const [p] = await db.select().from(schema.products).where(eq(schema.products.id, input.id));
  if (!p) return fail('NOT_FOUND');
  if (input.published) {
    const [photos, cats] = await Promise.all([
      db
        .select({ id: schema.photos.id })
        .from(schema.photos)
        .where(
          and(
            eq(schema.photos.ownerType, 'product'),
            eq(schema.photos.ownerId, p.id),
            eq(schema.photos.status, 'attached'),
          ),
        ),
      db
        .select()
        .from(schema.productCategories)
        .where(eq(schema.productCategories.productId, p.id)),
    ]);
    const missing = missingToPublish({
      name: p.name,
      slug: p.slug,
      photoCount: photos.length,
      categoryCount: cats.length,
      priceFromCents: p.priceFromCents,
    });
    if (missing.length > 0) return fail('CANNOT_PUBLISH', { missing });
  }
  await db
    .update(schema.products)
    .set({
      published: input.published,
      everPublished: p.everPublished || input.published,
      updatedAt: new Date(deps.now()),
    })
    .where(eq(schema.products.id, p.id));
  return ok({ published: input.published });
}

/**
 * `admin.reorderProducts`: rewrites `sort_order` 0…N in one batch. Unknown ids are ignored;
 * products missing from the list keep their relative order after the listed ones.
 */
export async function reorderProducts(
  deps: AdminDeps,
  input: { ids: string[] },
): Promise<Result<{ count: number }>> {
  const { db } = deps;
  if (new Set(input.ids).size !== input.ids.length)
    return fail('VALIDATION', { fields: { ids: ['duplicates'] } });
  const all = await db
    .select({ id: schema.products.id })
    .from(schema.products)
    .orderBy(asc(schema.products.sortOrder), asc(schema.products.createdAt));
  const existing = new Set(all.map((p) => p.id));
  const listed = input.ids.filter((id) => existing.has(id));
  const rest = all.map((p) => p.id).filter((id) => !listed.includes(id));
  const order = [...listed, ...rest];
  await runBatch(
    db,
    order.map((id, i) =>
      db.update(schema.products).set({ sortOrder: i }).where(eq(schema.products.id, id)),
    ),
  );
  return ok({ count: order.length });
}

/** `admin.duplicateProduct`: copies the data (not the photos); the copy starts hidden, at the end. */
export async function duplicateProduct(
  deps: AdminDeps,
  input: { id: string },
): Promise<Result<{ id: string; slug: string }>> {
  const { db } = deps;
  const [p] = await db.select().from(schema.products).where(eq(schema.products.id, input.id));
  if (!p) return fail('NOT_FOUND');
  const [cats, cols] = await Promise.all([
    db.select().from(schema.productCategories).where(eq(schema.productCategories.productId, p.id)),
    db.select().from(schema.productColors).where(eq(schema.productColors.productId, p.id)),
  ]);
  const id = deps.newId();
  const name = `${p.name.slice(0, limits.nameMax - ' (copia)'.length)} (copia)`;
  const slug = uniqueSlug(slugFromName(name) || 'producto-copia', await takenSlugs(deps));
  const now = new Date(deps.now());
  const {
    id: _id,
    slug: _slug,
    name: _name,
    createdAt: _c,
    updatedAt: _u,
    sortOrder: _s,
    ...data
  } = p;
  void [_id, _slug, _name, _c, _u, _s];
  await runBatch(db, [
    db.insert(schema.products).values({
      ...data,
      id,
      slug,
      name,
      published: false,
      everPublished: false,
      sortOrder: (await maxSortOrder(deps)) + 1,
      createdAt: now,
      updatedAt: now,
    }),
    ...cats.map((c) =>
      db.insert(schema.productCategories).values({ productId: id, category: c.category }),
    ),
    ...cols.map((c) =>
      db
        .insert(schema.productColors)
        .values({ productId: id, color: c.color, sortOrder: c.sortOrder }),
    ),
  ]);
  return ok({ id, slug });
}

/** `admin.deleteProduct`: the product, its rows and its photos (D1 first, then R2). */
export async function deleteProduct(
  deps: AdminDeps,
  input: { id: string },
): Promise<Result<{ id: string }>> {
  const { db, bucket } = deps;
  const [p] = await db.select().from(schema.products).where(eq(schema.products.id, input.id));
  if (!p) return fail('NOT_FOUND');
  const photos = await db
    .select({ id: schema.photos.id })
    .from(schema.photos)
    .where(and(eq(schema.photos.ownerType, 'product'), eq(schema.photos.ownerId, p.id)));
  await runBatch(db, [
    db
      .delete(schema.photos)
      .where(and(eq(schema.photos.ownerType, 'product'), eq(schema.photos.ownerId, p.id))),
    db.delete(schema.products).where(eq(schema.products.id, p.id)),
  ]);
  await removePrefixes(
    bucket,
    photos.map((ph) => r2Keys.prefix(ph.id)),
  );
  return ok({ id: p.id });
}
