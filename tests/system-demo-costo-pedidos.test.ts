/**
 * The sample data of the screens «Costo de una pieza» and «Pedido» agree (docs/25 §4, §12): the
 * breakdown of the napkin holder adds up to its cost with the shares of the screen, the profit by
 * channel follows the fee, and order #3 in detail adds up to its total, its paid amount and its
 * pieces.
 */
import { describe, expect, it } from 'vitest';
import { round2 } from '@/lib/learn/cost';
import { demoChannels, demoOrder3, demoOrder3Detail, demoPiece } from '@/config/system-demo';

const cents = (n: number) => Math.round(n * 100);
const sum = (xs: readonly number[]) => xs.reduce((s, x) => s + cents(x), 0) / 100;

describe('sample data of the cost and order screens', () => {
  it('the breakdown adds up to the cost and gives the shares of the screen', () => {
    const p = demoPiece;
    const failures = round2(p.cost - (p.material + p.machine + p.power + p.extras));
    expect(failures).toBe(1.34);
    expect(sum([p.material, p.machine, failures, p.power, p.extras])).toBe(p.cost);
    const shares = [p.material, p.machine, failures, p.power, p.extras].map((a) =>
      ((a / p.cost) * 100).toFixed(1),
    );
    expect(shares).toEqual(['63.6', '28.0', '5.0', '3.4', '0.0']);
  });

  it('the profit by channel is the price less the fee, less the cost', () => {
    const profits = demoChannels.map((c) =>
      round2(demoPiece.price * (1 - c.feePct / 100) - demoPiece.cost),
    );
    expect(profits).toEqual([93.25, 93.25, 72.85]);
  });

  it('order #3: the items add up to the total, the payments to the paid amount', () => {
    expect(sum(demoOrder3Detail.items.map((i) => i.amount))).toBe(demoOrder3.total);
    expect(sum(demoOrder3Detail.payments.map((p) => p.amount))).toBe(demoOrder3.paid);
  });

  it('order #3: each item comes from stock or is printed; 13 pieces in all', () => {
    for (const i of demoOrder3Detail.items) expect(i.fromStock + i.toPrint).toBe(i.qty);
    expect(demoOrder3Detail.items.reduce((s, i) => s + i.qty, 0)).toBe(13);
  });

  it('order #3: the current state is one of its states', () => {
    expect(demoOrder3Detail.steps.map((s) => s.id)).toContain(demoOrder3Detail.current);
  });
});
