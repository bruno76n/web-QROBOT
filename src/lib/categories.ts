/** Pure rules for managing categories: ids, protection, deletion impact and ordering. */

import { CHRISTMAS_CATEGORY } from '@/config/categories';
import { slugFromName, uniqueSlug } from './publish';

/** Id (and URL segment) of a new category: "Para la oficina" → "para-la-oficina", made unique. */
export function categoryIdFromLabel(label: string, taken: readonly string[]): string {
  const base = slugFromName(label).slice(0, 36).replace(/-+$/g, '') || 'categoria';
  return uniqueSlug(base, taken);
}

/** The Christmas season logic points at this category: it cannot be deleted. */
export const isProtectedCategory = (id: string): boolean => id === CHRISTMAS_CATEGORY;

/** Published products that would have no category left if `categoryId` were deleted. */
export function publishedLeftWithout<T extends { published: boolean; categories: string[] }>(
  categoryId: string,
  products: readonly T[],
): T[] {
  return products.filter(
    (p) => p.published && p.categories.includes(categoryId) && p.categories.length === 1,
  );
}

/** New order for `current` following `wanted`: unknown ids are dropped, missing ones keep their place at the end. */
export function reorderIds(current: readonly string[], wanted: readonly string[]): string[] {
  const known = new Set(current);
  const head = wanted.filter((id) => known.has(id));
  const seen = new Set(head);
  return [...head, ...current.filter((id) => !seen.has(id))];
}
