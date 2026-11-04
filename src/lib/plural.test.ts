import { describe, expect, it } from 'vitest';
import { normalizeQuantity, unitFor } from './plural';

describe('unitFor', () => {
  const unit = { singular: 'llavero', plural: 'llaveros' };
  it('uses singular for 1 and plural for everything else', () => {
    expect(unitFor(1, unit, 'Llaveros con nombre')).toBe('llavero');
    expect(unitFor(2, unit, 'x')).toBe('llaveros');
    expect(unitFor(50, unit, 'x')).toBe('llaveros');
  });
  it('falls back to the product name when units are missing', () => {
    expect(unitFor(1, { singular: '', plural: '' }, 'Búho')).toBe('Búho');
    expect(unitFor(3, { singular: '', plural: '' }, 'Búho')).toBe('Búho');
    expect(unitFor(3, { singular: 'búho', plural: ' ' }, 'x')).toBe('búho');
  });
});

describe('normalizeQuantity', () => {
  it('turns empty, zero and nonsense into 1', () => {
    for (const v of ['', '0', '-3', 'abc', NaN]) expect(normalizeQuantity(v as string)).toBe(1);
    expect(normalizeQuantity('12')).toBe(12);
    expect(normalizeQuantity(3.9)).toBe(3);
    expect(normalizeQuantity('999999')).toBe(9999);
  });
});
