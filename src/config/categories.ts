/** Fixed categories (docs/05 §4). The order here decides the "main" category (breadcrumbs). */
export const categories = [
  { id: 'negocio', label: 'Para tu negocio' },
  { id: 'casa', label: 'Para la casa' },
  { id: 'navidad', label: 'Navidad' },
] as const;

export type CategoryId = (typeof categories)[number]['id'];

export const categoryIds = categories.map((c) => c.id) as [CategoryId, ...CategoryId[]];

export function isCategoryId(value: string): value is CategoryId {
  return categories.some((c) => c.id === value);
}
