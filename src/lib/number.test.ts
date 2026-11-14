import { describe, expect, it } from 'vitest';
import { parseAmount } from './number';

describe('parseAmount', () => {
  it('comma or point, spaces, and junk', () => {
    expect(parseAmount('24,7')).toBe(24.7);
    expect(parseAmount(' 1 000.5 ')).toBe(1000.5);
    expect(parseAmount('25')).toBe(25);
    expect(parseAmount('')).toBeNaN();
    expect(parseAmount('abc')).toBeNaN();
  });
});

