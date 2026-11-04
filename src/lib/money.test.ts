import { describe, expect, it } from 'vitest';
import { centsToInput, formatMoney, parsePesos } from './money';

describe('formatMoney', () => {
  it('shows whole pesos with thousands separator', () => {
    expect(formatMoney(5000)).toBe('$50');
    expect(formatMoney(125000)).toBe('$1,250');
    expect(formatMoney(0)).toBe('$0');
  });
  it('keeps cents only when there are some', () => {
    expect(formatMoney(12550)).toBe('$125.50');
  });
});

describe('parsePesos', () => {
  it('reads what people type', () => {
    expect(parsePesos('50')).toBe(5000);
    expect(parsePesos('$1,250')).toBe(125000);
    expect(parsePesos(' 1250.5 ')).toBe(125050);
    expect(parsePesos('99.99')).toBe(9999);
  });
  it('rejects empty and nonsense', () => {
    for (const bad of ['', '  ', 'abc', '-5', '1.234', '1e3', '12,34,5x']) {
      expect(parsePesos(bad), bad).toBeNull();
    }
  });
  it('round-trips through the field', () => {
    expect(centsToInput(125000)).toBe('1250');
    expect(centsToInput(12550)).toBe('125.50');
    expect(centsToInput(null)).toBe('');
    expect(parsePesos(centsToInput(12550))).toBe(12550);
  });
});
