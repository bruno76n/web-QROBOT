import type { FilamentsData, PrintersData } from './content';

/** Pure helpers of the data tables of Aprende (docs/21 §6): names, filters and number parsing. */

export type FilamentRow = FilamentsData['rows'][number];
export type PrinterRow = PrintersData['rows'][number];

/**
 * «PLA (Basic, Mate, Seda, Tough)» → name «PLA», note «Basic, Mate, Seda, Tough»: the first word is
 * the link to its sheet and the rest goes small below it. A note wrapped in parentheses loses them.
 */
export function splitMaterial(material: string): { name: string; note: string } {
  const text = material.trim();
  const space = text.indexOf(' ');
  if (space < 0) return { name: text, note: '' };
  const rest = text.slice(space + 1).trim();
  const wrapped = /^\(([^()]*)\)$/.exec(rest);
  return { name: text.slice(0, space), note: wrapped ? (wrapped[1] ?? '') : rest };
}

export interface FilamentFilter {
  /** Chip id; `todos` shows every use. */
  chip: string;
  /** Ids of the switches that are on (`open`, `ams`, `brass`). */
  toggles: string[];
}

/**
 * Whether a filament row shows with the chosen chip and switches. Each switch of the data file says
 * which rows it hides (`hideWhen`: field → value), e.g. «Mi impresora es abierta» hides
 * `printer = enclosed` and keeps `enclosed-better`.
 */
export function filamentVisible(
  row: FilamentRow,
  filter: FilamentFilter,
  toggles: FilamentsData['toggles'],
): boolean {
  if (filter.chip !== 'todos' && !row.filters.includes(filter.chip)) return false;
  for (const t of toggles) {
    if (!filter.toggles.includes(t.id)) continue;
    for (const [field, value] of Object.entries(t.hideWhen))
      if (String((row as Record<string, unknown>)[field]) === value) return false;
  }
  return true;
}

/**
 * A typed measure or amount: accepts comma or point as decimal mark («24,7» = 24.7, the iPhone in
 * Spanish shows a comma) and spaces. `NaN` when it is not a number (docs/24 §2).
 */
export function parseAmount(value: string): number {
  const n = Number.parseFloat(value.replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : Number.NaN;
}

/** Volume of a printer in liters, used to sort by size. */
export function printerLiters(p: Pick<PrinterRow, 'widthMm' | 'depthMm' | 'heightMm'>): number {
  return (p.widthMm * p.depthMm * p.heightMm) / 1_000_000;
}

/** Count text from es.ts forms: `{ one: '1 material', many: '{n} materiales' }`. */
export function countText(n: number, forms: { one: string; many: string }): string {
  return n === 1 ? forms.one : fillText(forms.many, { n });
}

/** Replaces `{name}` placeholders of a text with values. */
export function fillText(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in values ? String(values[k]) : m));
}
