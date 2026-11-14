/** Numbers typed by people in the forms of the site (calculator, ¿Cabe mi pieza?). Pure. */

/**
 * A typed measure or amount: accepts comma or point as decimal mark («24,7» = 24.7, the iPhone in
 * Spanish shows a comma) and spaces. `NaN` when it is not a number (docs/24 §2).
 */
export function parseAmount(value: string): number {
  const n = Number.parseFloat(value.replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : Number.NaN;
}
