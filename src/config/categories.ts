/**
 * The categories every site starts with (docs/05 §4). They are copied into the `categories` table
 * by migration 0004; from then on the panel owns the list (docs/09 › categories).
 * `navidad` is special: the season logic points at it, so it cannot be deleted or renamed by id.
 */
export const seedCategories = [
  { id: 'negocio', label: 'Para tu negocio' },
  { id: 'casa', label: 'Para la casa' },
  { id: 'navidad', label: 'Navidad' },
] as const;

/** Category ids are free text now (they come from the database). */
export type CategoryId = string;

/** The id the Christmas season section and its home block depend on. */
export const CHRISTMAS_CATEGORY = 'navidad';

/** A category as the site and the panel read it. */
export interface CategoryView {
  id: CategoryId;
  label: string;
}
