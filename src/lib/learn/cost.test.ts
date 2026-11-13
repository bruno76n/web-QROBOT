import { describe, expect, it } from 'vitest';
import { computeCost, costDefaults, formatPesos, maxFailPct, round2 } from './cost';

describe('computeCost', () => {
  it('the example of negocio/costo gives $21.04 exactly', () => {
    expect(computeCost(costDefaults)).toEqual({
      material: 11.81,
      electricity: 0.68,
      machine: 7.5,
      extras: 0,
      subtotal: 19.99,
      cost: 21.04,
    });
  });
  it('0 % of failures: the cost is the subtotal', () => {
    const r = computeCost({ ...costDefaults, failPct: 0 });
    expect(r.cost).toBe(r.subtotal);
  });
  it('99 % of failures is capped at 90 % and does not divide by zero', () => {
    const r = computeCost({ ...costDefaults, failPct: 99 });
    expect(Number.isFinite(r.cost)).toBe(true);
    expect(r.cost).toBe(round2(r.subtotal / (1 - maxFailPct / 100)));
  });
  it('empty or negative values count as zero, never NaN', () => {
    const r = computeCost({
      ...costDefaults,
      grams: Number.NaN,
      rollGrams: 0,
      lifeHours: 0,
      hours: -3,
      extras: -1,
    });
    expect(Object.values(r).every((n) => Number.isFinite(n) && n >= 0)).toBe(true);
  });
  it('extras add up', () => {
    expect(computeCost({ ...costDefaults, extras: 10, failPct: 0 }).subtotal).toBe(29.99);
  });
});

describe('formatPesos', () => {
  it('shows cents and thousands', () => {
    expect(formatPesos(21.04)).toBe('$21.04');
    expect(formatPesos(1234.5)).toBe('$1,234.50');
  });
});
