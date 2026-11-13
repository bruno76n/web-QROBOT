/** ¿Cabe mi pieza? (docs/21 §6.2). Millimetres everywhere; `toMm` converts the typed values. */

export type FitUnit = 'mm' | 'cm';
export type FitResult = 'standing' | 'lying' | 'no';

export interface Dims {
  widthMm: number;
  depthMm: number;
  heightMm: number;
}

export function toMm(value: number, unit: FitUnit): number {
  return unit === 'cm' ? value * 10 : value;
}

/** Every side has to be a number above zero. */
export function validPiece(piece: Dims): boolean {
  return [piece.widthMm, piece.depthMm, piece.heightMm].every((n) => Number.isFinite(n) && n > 0);
}

/**
 * Standing: the piece keeps the height that was typed (turning it 90° on the bed still counts).
 * Lying: another side ends up as the height. The width and depth of the bed lose `marginMm` on each
 * side; the height does not. The diagonal is not used.
 */
export function fitPiece(piece: Dims, printer: Dims, marginMm: number): FitResult {
  if (!validPiece(piece)) return 'no';
  const w = printer.widthMm - 2 * marginMm;
  const d = printer.depthMm - 2 * marginMm;
  const h = printer.heightMm;
  const sides = [piece.widthMm, piece.depthMm, piece.heightMm] as const;
  const fits = (x: number, y: number, z: number) =>
    (x <= w && y <= d && z <= h) || (y <= w && x <= d && z <= h);
  if (fits(sides[0], sides[1], sides[2])) return 'standing';
  if (fits(sides[0], sides[2], sides[1]) || fits(sides[1], sides[2], sides[0])) return 'lying';
  return 'no';
}

export interface FitSummary {
  valid: boolean;
  fitting: number;
  total: number;
  results: FitResult[];
}

export function fitAll(piece: Dims, printers: readonly Dims[], marginMm: number): FitSummary {
  if (!validPiece(piece))
    return { valid: false, fitting: 0, total: printers.length, results: printers.map(() => 'no') };
  const results = printers.map((p) => fitPiece(piece, p, marginMm));
  return {
    valid: true,
    fitting: results.filter((r) => r !== 'no').length,
    total: printers.length,
    results,
  };
}
