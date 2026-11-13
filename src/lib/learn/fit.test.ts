import { describe, expect, it } from 'vitest';
import { fitAll, fitPiece, toMm, validPiece, type Dims } from './fit';

const bed: Dims = { widthMm: 256, depthMm: 256, heightMm: 256 };
const piece = (w: number, d: number, h: number): Dims => ({ widthMm: w, depthMm: d, heightMm: h });

describe('fitPiece on 256 × 256 × 256 with a 5 mm margin', () => {
  it('200 × 100 × 50 fits standing', () => {
    expect(fitPiece(piece(200, 100, 50), bed, 5)).toBe('standing');
  });
  it('100 × 200 × 50 fits standing (turned on the bed)', () => {
    expect(fitPiece(piece(100, 200, 50), bed, 5)).toBe('standing');
  });
  it('246 × 100 × 50 fits standing (256 − 2 × 5 = 246)', () => {
    expect(fitPiece(piece(246, 100, 50), bed, 5)).toBe('standing');
  });
  it('247 × 100 × 50 fits lying: the 247 ends up as the height', () => {
    expect(fitPiece(piece(247, 100, 50), bed, 5)).toBe('lying');
  });
  it('300 × 20 × 20 does not fit', () => {
    expect(fitPiece(piece(300, 20, 20), bed, 5)).toBe('no');
  });
  it('the height has no margin', () => {
    expect(fitPiece(piece(50, 50, 256), bed, 5)).toBe('standing');
    expect(fitPiece(piece(50, 50, 257), bed, 5)).toBe('no');
  });
  it('0 or negative is not a valid piece', () => {
    expect(validPiece(piece(0, 10, 10))).toBe(false);
    expect(validPiece(piece(10, -1, 10))).toBe(false);
    expect(validPiece(piece(10, 10, Number.NaN))).toBe(false);
    expect(fitPiece(piece(0, 10, 10), bed, 5)).toBe('no');
  });
});

describe('fitAll and toMm', () => {
  it('counts the printers where it fits', () => {
    const small: Dims = { widthMm: 180, depthMm: 180, heightMm: 180 };
    const r = fitAll(piece(200, 100, 50), [bed, small], 5);
    expect(r).toMatchObject({ valid: true, fitting: 1, total: 2 });
    expect(r.results).toEqual(['standing', 'no']);
  });
  it('an invalid piece fits in none and says so', () => {
    expect(fitAll(piece(0, 0, 0), [bed], 5)).toMatchObject({ valid: false, fitting: 0, total: 1 });
  });
  it('cm to mm', () => {
    expect(toMm(30, 'cm')).toBe(300);
    expect(toMm(30, 'mm')).toBe(30);
  });
});
