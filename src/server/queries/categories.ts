/** Read queries of catalog categories. */

import { asc } from 'drizzle-orm';
import type { CategoryView } from '@/config/categories';
import { getDb, schema, type Db } from '../db/client';

/** Every category in display order (the first one a product has is its main one). */
export async function listCategories(db: Db = getDb()): Promise<CategoryView[]> {
  const rows = await db
    .select()
    .from(schema.categories)
    .orderBy(asc(schema.categories.position), asc(schema.categories.createdAt));
  return rows.map((r) => ({ id: r.id, label: r.label }));
}

/** Sorter by display position for lists of category ids; unknown ids go last. */
export function categoryOrder(list: readonly CategoryView[]) {
  const position = new Map(list.map((c, i) => [c.id, i]));
  return (a: string, b: string) =>
    (position.get(a) ?? Number.MAX_SAFE_INTEGER) - (position.get(b) ?? Number.MAX_SAFE_INTEGER);
}
