/** Picks the singular or plural unit for a quantity (docs/09 › unit_singular, unit_plural). */
export function unitFor(
  quantity: number,
  unit: { singular: string; plural: string },
  fallbackName: string,
): string {
  const singular = unit.singular.trim() || fallbackName;
  const plural = unit.plural.trim() || singular;
  return quantity === 1 ? singular : plural;
}

/** Quantity typed by a person → a whole number ≥ 1 (empty or nonsense becomes 1). */
export function normalizeQuantity(input: string | number): number {
  const n = typeof input === 'number' ? Math.trunc(input) : parseInt(input, 10);
  return Number.isFinite(n) && n >= 1 ? Math.min(n, 9999) : 1;
}
