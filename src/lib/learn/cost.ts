/** Cost of a piece (docs/21 §6.4, formula of docs/23 › negocio/costo). Money in pesos. */

/** Values the cost calculator reads. Prices in pesos, time in hours, percentages as 0-100. */
export interface CostInput {
  /** Weight of the piece. */
  grams: number;
  rollPrice: number;
  rollGrams: number;
  /** Extra material lost purging the nozzle, as a percentage of the piece weight. */
  purgePct: number;
  hours: number;
  /** Average power draw of the printer while printing. */
  watts: number;
  kwhPrice: number;
  printerPrice: number;
  /** Hours of use over which the printer price is spread. */
  lifeHours: number;
  maintenancePerHour: number;
  /** Fixed extras (packaging, hardware...). */
  extras: number;
  /** Share of prints that fail, as a percentage of the final cost. */
  failPct: number;
}

/** Breakdown of the cost; every amount is rounded to cents. */
export interface CostResult {
  material: number;
  electricity: number;
  machine: number;
  extras: number;
  subtotal: number;
  /** Subtotal plus the share that covers failed prints. */
  cost: number;
}

/** Starting values shown in the calculator. */
export const costDefaults: CostInput = {
  grams: 25,
  rollPrice: 450,
  rollGrams: 1000,
  purgePct: 5,
  hours: 1.5,
  watts: 150,
  kwhPrice: 3,
  printerPrice: 20000,
  lifeHours: 5000,
  maintenancePerHour: 1,
  extras: 0,
  failPct: 5,
};

/** Ceiling for the failure percentage, so the final division never reaches zero. */
export const maxFailPct = 90;

/** To cents, half up. */
export function round2(n: number): number {
  return Math.round(n * 100 + 1e-9) / 100;
}

/** Negative, NaN and infinite values count as zero. */
const positive = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

/**
 * Cost of one piece: material (with purge), electricity, machine wear plus maintenance, and extras.
 * Each part is rounded to cents, like the table of the example; the failures go over the subtotal
 * (`subtotal / (1 - failPct)`), with `failPct` capped at `maxFailPct`.
 */
export function computeCost(input: CostInput): CostResult {
  const grams = positive(input.grams);
  const perGram = input.rollGrams > 0 ? positive(input.rollPrice) / input.rollGrams : 0;
  const material = round2(grams * perGram * (1 + positive(input.purgePct) / 100));
  const electricity = round2(
    positive(input.hours) * (positive(input.watts) / 1000) * positive(input.kwhPrice),
  );
  const wear = input.lifeHours > 0 ? positive(input.printerPrice) / input.lifeHours : 0;
  const machine = round2(positive(input.hours) * (wear + positive(input.maintenancePerHour)));
  const extras = round2(positive(input.extras));
  const subtotal = round2(material + electricity + machine + extras);
  const fail = Math.min(positive(input.failPct), maxFailPct);
  const cost = round2(subtotal / (1 - fail / 100));
  return { material, electricity, machine, extras, subtotal, cost };
}

/** Formats pesos as `$21.04`, with thousands separators and two decimals. */
export function formatPesos(n: number): string {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
