import { describe, expect, it } from 'vitest';
import { pct, splitSegments } from './money-split';

const example = [
  { id: 'mat', amount: 8.7 },
  { id: 'maq', amount: 5.4 },
  { id: 'fail', amount: 0.9 },
  { id: 'luz', amount: 0.7 },
  { id: 'ext', amount: 2 },
  { id: 'com', amount: 1.4 },
  { id: 'gas', amount: 43 },
  { id: 'gan', amount: 37.9 },
];

describe('splitSegments', () => {
  it('the example gives the same widths and starts as the mockup', () => {
    const s = splitSegments(example);
    expect(s.map((x) => pct(x.width))).toEqual([
      '8.70%',
      '5.40%',
      '0.90%',
      '0.70%',
      '2.00%',
      '1.40%',
      '43.00%',
      '37.90%',
    ]);
    expect(s.map((x) => pct(x.start))).toEqual([
      '0.00%',
      '8.70%',
      '14.10%',
      '15.00%',
      '15.70%',
      '17.70%',
      '19.10%',
      '62.10%',
    ]);
  });
  it('widths add up to 100', () => {
    const total = splitSegments([
      { id: 'a', amount: 1 },
      { id: 'b', amount: 2 },
    ]).reduce((s, x) => s + x.width, 0);
    expect(total).toBeCloseTo(100, 10);
  });
  it('parts of 0 do not break it; nothing at all gives zeros', () => {
    const s = splitSegments([
      { id: 'a', amount: 0 },
      { id: 'b', amount: 5 },
    ]);
    expect(s.map((x) => x.width)).toEqual([0, 100]);
    expect(splitSegments([{ id: 'a', amount: 0 }])[0]?.width).toBe(0);
  });
});
