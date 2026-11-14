/** Tests of the invariants and the switch guard of the page for workshops. */
import { describe, expect, it } from 'vitest';
import { dataProblems, switchProblems } from './guard';
import type { Plan } from './plans';

const [free, shop, business]: Plan[] = [
  { id: 'free', monthly: 0, yearly: 0, users: 1, printers: 2, orders: 15 },
  {
    id: 'shop',
    monthly: 149,
    yearly: 1490,
    users: 2,
    printers: null,
    orders: null,

    recommended: true,
  },
  {
    id: 'business',
    monthly: 299,
    yearly: 2990,
    users: 8,
    printers: null,
    orders: null,
  },
];
const plans = [free!, shop!, business!];
const money = [{ amount: 8.7 }, { amount: 5.4 }, { amount: 0.9 }, { amount: 85 }];

describe('dataProblems', () => {
  it('accepts consistent data', () => {
    expect(dataProblems({ plans, limitRows: ['users', 'printers'], money })).toEqual([]);
  });
  it('finds a yearly price that is not 10 months', () => {
    const bad = plans.map((p) => (p.id === 'shop' ? { ...p, yearly: 1500 } : p));
    expect(dataProblems({ plans: bad, limitRows: [], money })).toEqual(['yearly:shop']);
  });
  it('needs exactly one recommended plan', () => {
    const none = plans.map((p) => ({ ...p, recommended: false }));
    const two = plans.map((p) => ({ ...p, recommended: true }));
    expect(dataProblems({ plans: none, limitRows: [], money })).toEqual(['recommended']);
    expect(dataProblems({ plans: two, limitRows: [], money })).toEqual(['recommended']);
  });
  it('needs the cheapest plan first', () => {
    expect(dataProblems({ plans: [shop!, free!, business!], limitRows: [], money })).toEqual([
      'order:free',
    ]);
  });
  it('finds a limit row the plans do not have', () => {
    expect(dataProblems({ plans, limitRows: ['storage'], money })).toEqual(['limit:storage']);
  });
  it('needs the money example to add up to 100.00', () => {
    expect(dataProblems({ plans, limitRows: [], money: [{ amount: 99.99 }] })).toEqual(['money']);
  });
});

describe('switchProblems', () => {
  const on = {
    enabled: true,
    name: 'Sistema',
    appUrl: 'https://sistema.example.com',
    downloads: {
      mac: { url: 'https://dl.example.com/a.dmg' },
      windows: { url: 'https://dl.example.com/a.exe' },
    },
  };
  it('says nothing while the page is off', () => {
    expect(switchProblems({ ...on, enabled: false, name: '', appUrl: '' })).toEqual([]);
  });
  it('accepts real https addresses', () => {
    expect(switchProblems(on)).toEqual([]);
  });
  it('rejects a reserved example domain', () => {
    expect(switchProblems({ ...on, appUrl: 'https://sistema.quickrobot.example' })).toEqual([
      'appUrl',
    ]);
  });
  it('rejects an empty name, http and empty installers', () => {
    expect(
      switchProblems({
        ...on,
        name: ' ',
        appUrl: 'http://sistema.example.com',
        downloads: { mac: { url: '' }, windows: { url: 'nada' } },
      }),
    ).toEqual(['name', 'appUrl', 'download:mac', 'download:windows']);
  });
});
