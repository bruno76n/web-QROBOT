/** Tests of the plan prices and limits of the page for workshops (docs/25 §5). */
import { describe, expect, it } from 'vitest';
import { limitLabel, planPrice, yearlyPerMonth, type Plan } from './plans';

const free: Plan = { id: 'free', monthly: 0, yearly: 0, users: 1, printers: 2, orders: 15 };
const shop: Plan = {
  id: 'shop',
  monthly: 149,
  yearly: 1490,
  users: 2,
  printers: null,
  orders: null,
  recommended: true,
};
const business: Plan = {
  id: 'business',
  monthly: 299,
  yearly: 2990,
  users: 8,
  printers: null,
  orders: null,
  roles: true,
};

describe('planPrice and yearlyPerMonth', () => {
  it('Taller: $149 a month, $1,490 a year, $124 a month paid yearly', () => {
    expect(planPrice(shop, 'monthly')).toBe(149);
    expect(planPrice(shop, 'yearly')).toBe(1490);
    expect(yearlyPerMonth(shop)).toBe(124);
  });
  it('Negocio: $2,990 a year and $249 a month', () => {
    expect(planPrice(business, 'yearly')).toBe(2990);
    expect(yearlyPerMonth(business)).toBe(249);
  });
  it('Gratis: $0 in both periods', () => {
    expect(planPrice(free, 'monthly')).toBe(0);
    expect(planPrice(free, 'yearly')).toBe(0);
    expect(yearlyPerMonth(free)).toBe(0);
  });
});

describe('limitLabel', () => {
  it('writes the number, or the word of the row when there is no limit', () => {
    expect(limitLabel(2, 'Ilimitadas')).toBe('2');
    expect(limitLabel(0, 'Ilimitados')).toBe('0');
    expect(limitLabel(null, 'Ilimitadas')).toBe('Ilimitadas');
    expect(limitLabel(null, 'Ilimitados')).toBe('Ilimitados');
  });
});
