import { describe, expect, it } from 'vitest';
import { planPrice, planReasons, recommendPlan, yearlyPerMonth, type Plan } from './plans';

const plans: Plan[] = [
  { id: 'free', monthly: 0, yearly: 0, people: 1, printers: 2, orders: 15, workshops: 1 },
  {
    id: 'shop',
    monthly: 149,
    yearly: 1490,
    people: 2,
    printers: null,
    orders: null,
    workshops: 1,
    recommended: true,
  },
  {
    id: 'business',
    monthly: 299,
    yearly: 2990,
    people: 8,
    printers: null,
    orders: null,
    workshops: 3,
  },
];
const rec = (printers: number, people: number, orders: number) =>
  recommendPlan({ printers, people, orders }, plans);

describe('recommendPlan', () => {
  it('1 printer, 1 person, 10 → Gratis', () => {
    expect(rec(1, 1, 10)).toEqual({ plan: plans[0], contact: false });
  });
  it('12, 2, 30 → Taller', () => {
    expect(rec(12, 2, 30).plan.id).toBe('shop');
  });
  it('3 people → Negocio', () => {
    expect(rec(1, 3, 0).plan.id).toBe('business');
  });
  it('10 people → Negocio and write to us', () => {
    expect(rec(1, 10, 0)).toEqual({ plan: plans[2], contact: true });
  });
  it('limits are «up to»: 2, 1, 15 → Gratis', () => {
    expect(rec(2, 1, 15).plan.id).toBe('free');
  });
  it('3, 1, 0 → Taller', () => {
    expect(rec(3, 1, 0).plan.id).toBe('shop');
  });
});

describe('planReasons', () => {
  it('Gratis says its limits', () => {
    expect(planReasons({ printers: 1, people: 1, orders: 10 }, plans)).toEqual([
      { key: 'freeLimits', printers: 2, people: 1, orders: 15 },
    ]);
  });
  it('12, 2, 30 → printers 12, two people and orders over 15', () => {
    expect(planReasons({ printers: 12, people: 2, orders: 30 }, plans)).toEqual([
      { key: 'printers', n: 12, orMore: false },
      { key: 'twoPeople' },
      { key: 'orders', n: 15 },
    ]);
  });
  it('3 people → roles', () => {
    expect(planReasons({ printers: 1, people: 3, orders: 0 }, plans)).toEqual([{ key: 'roles' }]);
  });
  it('10 people → roles and contact with the top of the last plan', () => {
    expect(planReasons({ printers: 1, people: 10, orders: 0 }, plans)).toEqual([
      { key: 'roles' },
      { key: 'contact', n: 8 },
    ]);
  });
  it('the top of the slider reads «or more»', () => {
    expect(planReasons({ printers: 20, people: 1, orders: 0 }, plans, 20)[0]).toEqual({
      key: 'printers',
      n: 20,
      orMore: true,
    });
  });
  it('no plans, no reasons', () => {
    expect(planReasons({ printers: 1, people: 1, orders: 1 }, [])).toEqual([]);
  });
});

describe('prices', () => {
  it('yearly Taller = $1,490, $124 a month', () => {
    const shop = plans[1]!;
    expect(planPrice(shop, 'yearly')).toBe(1490);
    expect(planPrice(shop, 'monthly')).toBe(149);
    expect(yearlyPerMonth(shop)).toBe(124);
  });
});

describe('recommendPlan without plans', () => {
  it('throws', () => {
    expect(() => recommendPlan({ printers: 1, people: 1, orders: 1 }, [])).toThrow();
  });
});
