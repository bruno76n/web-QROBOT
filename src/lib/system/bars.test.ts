/** Tests of the bar and column sizes of the system screens (docs/25 §5). */
import { describe, expect, it } from 'vitest';
import { columns, pct } from './bars';

describe('pct', () => {
  it('is the share of the max, from 0 to 100, with 2 decimals', () => {
    expect(pct(43, 43)).toBe(100);
    expect(pct(1, 3)).toBe(33.33);
    expect(pct(62, 100)).toBe(62);
    expect(pct(150, 100)).toBe(100);
  });
  it('never goes negative and a max of 0 gives 0', () => {
    expect(pct(-1, 10)).toBe(0);
    expect(pct(5, 0)).toBe(0);
    expect(pct(5, -2)).toBe(0);
    expect(pct(Number.NaN, 10)).toBe(0);
  });
});

describe('columns', () => {
  it('stands each column on the base line', () => {
    expect(columns([{ v: 1690 }], 2000)).toEqual([{ y: 15.5, h: 84.5 }]);
    expect(columns([{ v: 0 }, { v: 2000 }], 2000)).toEqual([
      { y: 100, h: 0 },
      { y: 0, h: 100 },
    ]);
  });
});
