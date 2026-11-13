/** Admin actions on catalog categories: create, rename, reorder and delete. */

import { asc, eq, inArray } from 'drizzle-orm';
import {
  categoryIdFromLabel,
  isProtectedCategory,
  publishedLeftWithout,
  reorderIds,
} from '@/lib/categories';
import { limits } from '@/lib/publish';
import { fail, ok, type Result } from '@/lib/result';
import { schema } from '../db/client';
import { runBatch, type AdminDeps } from './context';

/** Category ids in display order. */
const currentIds = async ({ db }: AdminDeps) =>
  (
    await db
      .select({ id: schema.categories.id })
      .from(schema.categories)
      .orderBy(asc(schema.categories.position), asc(schema.categories.createdAt))
  ).map((r) => r.id);

/** `admin.createCategory`: adds a category at the end of the list, with an id made from its name. */
export async function createCategory(
  deps: AdminDeps,
  input: { label: string },
): Promise<Result<{ id: string }>> {
  const ids = await currentIds(deps);
  if (ids.length >= limits.maxCategories) return fail('TOO_MANY_CATEGORIES');
  const id = categoryIdFromLabel(input.label, ids);
  const now = new Date(deps.now());
  await deps.db
    .insert(schema.categories)
    .values({ id, label: input.label, position: ids.length, createdAt: now, updatedAt: now });
  return ok({ id });
}

/** `admin.renameCategory`: changes the name; the id (and so the URL) stays the same. */
export async function renameCategory(
  deps: AdminDeps,
  input: { id: string; label: string },
): Promise<Result<{ id: string }>> {
  const [row] = await deps.db
    .select()
    .from(schema.categories)
    .where(eq(schema.categories.id, input.id));
  if (!row) return fail('NOT_FOUND');
  await deps.db
    .update(schema.categories)
    .set({ label: input.label, updatedAt: new Date(deps.now()) })
    .where(eq(schema.categories.id, input.id));
  return ok({ id: input.id });
}

/** `admin.reorderCategories`: rewrites every position in one batch. */
export async function reorderCategories(
  deps: AdminDeps,
  input: { ids: string[] },
): Promise<Result<{ count: number }>> {
  const order = reorderIds(await currentIds(deps), input.ids);
  const now = new Date(deps.now());
  await runBatch(
    deps.db,
    order.map((id, position) =>
      deps.db
        .update(schema.categories)
        .set({ position, updatedAt: now })
        .where(eq(schema.categories.id, id)),
    ),
  );
  return ok({ count: order.length });
}

/**
 * `admin.deleteCategory`: removes the category and its links to products in one batch.
 * Refused when it is Navidad (the season logic needs it) or when a published product would be
 * left without any category (it could not stay published, docs/09 §3).
 */
export async function deleteCategory(
  deps: AdminDeps,
  input: { id: string },
): Promise<Result<{ id: string }>> {
  const { db } = deps;
  if (isProtectedCategory(input.id)) return fail('CATEGORY_PROTECTED');
  const [row] = await db.select().from(schema.categories).where(eq(schema.categories.id, input.id));
  if (!row) return fail('NOT_FOUND');

  const linked = await db
    .select({ productId: schema.productCategories.productId })
    .from(schema.productCategories)
    .where(eq(schema.productCategories.category, input.id));
  const productIds = linked.map((l) => l.productId);
  if (productIds.length > 0) {
    // Every product in this category with all its categories, read in chunks to keep the queries small.
    const products: { id: string; name: string; published: boolean; categories: string[] }[] = [];
    for (let i = 0; i < productIds.length; i += 80) {
      const chunk = productIds.slice(i, i + 80);
      const [ps, cs] = await Promise.all([
        db.select().from(schema.products).where(inArray(schema.products.id, chunk)),
        db
          .select()
          .from(schema.productCategories)
          .where(inArray(schema.productCategories.productId, chunk)),
      ]);
      for (const p of ps)
        products.push({
          id: p.id,
          name: p.name,
          published: p.published,
          categories: cs.filter((c) => c.productId === p.id).map((c) => c.category),
        });
    }
    const stuck = publishedLeftWithout(input.id, products);
    if (stuck.length > 0) return fail('CATEGORY_IN_USE', { products: stuck.map((p) => p.name) });
  }

  // The remaining categories are renumbered so positions stay contiguous.
  const rest = (await currentIds(deps)).filter((id) => id !== input.id);
  const now = new Date(deps.now());
  await runBatch(db, [
    db.delete(schema.productCategories).where(eq(schema.productCategories.category, input.id)),
    db.delete(schema.categories).where(eq(schema.categories.id, input.id)),
    ...rest.map((id, position) =>
      db
        .update(schema.categories)
        .set({ position, updatedAt: now })
        .where(eq(schema.categories.id, id)),
    ),
  ]);
  return ok({ id: input.id });
}
