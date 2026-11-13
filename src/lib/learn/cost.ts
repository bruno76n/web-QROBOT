/** Cost of a piece (docs/21 §6.4, formula of docs/23 › negocio/costo). Money in pesos. */

export interface CostInput {
  grams: number;
  rollPrice: number;
  rollGrams: number;
  purgePct: number;
  hours: number;
  watts: number;
  kwhPrice: number;
  printerPrice: number;
  lifeHours: number;
  maintenancePerHour: number;
  extras: number;
  failPct: number;
}

export interface CostResult {
  material: number;
  electricity: number;
  machine: number;
  extras: number;
  subtotal: number;
  cost: number;
}

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

export const maxFailPct = 90;

/** To cents, half up. */
export function round2(n: number): number {
  return Math.round(n * 100 + 1e-9) / 100;
}

const positive = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

/** Each part is rounded to cents, like the table of the example; the failures go over the subtotal. */
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

/** `$21.04`, with thousands separators. */
export function formatPesos(n: number): string {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
