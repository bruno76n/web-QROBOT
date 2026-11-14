/**
 * Sizes of the bars and columns drawn in the system screens (docs/25 §5, §6.3), as percentages for
 * SVG attributes (`width="62%"`, `y`, `height`), never `style`. Pure.
 */

/** `value` as a share of `max`, from 0 to 100, rounded to 2 decimals; negative or no max → 0. */
export function pct(value: number, max: number): number {
  if (!(max > 0) || !(value > 0)) return 0;
  return Math.round(Math.min(value / max, 1) * 10000) / 100;
}

/** One column of a chart: its value. */
export interface ColumnPoint {
  v: number;
}

/**
 * Each column as `{ y, h }` in % of the chart height, against the top value `cap`: `h` is its
 * height and `y` where it starts from the top (`100 − h`), so it stands on the base line.
 */
export function columns(points: readonly ColumnPoint[], cap: number): { y: number; h: number }[] {
  return points.map((p) => {
    const h = pct(p.v, cap);
    return { y: Math.round((100 - h) * 100) / 100, h };
  });
}
