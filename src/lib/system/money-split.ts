/**
 * Segments of the «De cada $100» bar (docs/25 §7.1): where each part starts and how wide it is,
 * as a percentage of the total, for the SVG attributes. Pure.
 */

export interface MoneyItem {
  id: string;
  amount: number;
}

export interface MoneySegment extends MoneyItem {
  /** Start and width in % of the bar. */
  start: number;
  width: number;
}

/** Each part with its start and width; widths add up to 100. Parts of 0 get width 0. */
export function splitSegments(items: readonly MoneyItem[]): MoneySegment[] {
  const total = items.reduce((s, i) => s + Math.max(0, i.amount), 0);
  let start = 0;
  return items.map((i) => {
    const width = total > 0 ? (Math.max(0, i.amount) / total) * 100 : 0;
    const seg = { ...i, start, width };
    start += width;
    return seg;
  });
}

/** A percentage as the SVG attribute needs it: `8.70%`. */
export function pct(n: number): string {
  return `${(Math.round(n * 100) / 100).toFixed(2)}%`;
}
