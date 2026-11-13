/** Full export of the catalog data for the panel's backup download. */

import { schema } from '../db/client';
import type { AdminDeps } from './context';

/** `admin.exportBackup`: every table except the files, which stay in R2 (docs/09 §5). `version` is the format version. */
export async function exportBackup(deps: AdminDeps) {
  const { db } = deps;
  const [products, slugHistory, categories, categoryList, colors, photos, heroSlides, settings] =
    await Promise.all([
      db.select().from(schema.products),
      db.select().from(schema.productSlugs),
      db.select().from(schema.productCategories),
      db.select().from(schema.categories),
      db.select().from(schema.productColors),
      db.select().from(schema.photos),
      db.select().from(schema.heroSlides),
      db.select().from(schema.settings),
    ]);
  return {
    version: 1 as const,
    exportedAt: new Date(deps.now()).toISOString(),
    products,
    /** Old addresses of each product (they redirect). */
    slugHistory,
    /** Links product → category. */
    categories,
    /** The category list itself (id, name, order). */
    categoryList,
    colors,
    photos,
    heroSlides,
    settings,
  };
}
