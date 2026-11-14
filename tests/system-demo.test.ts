/**
 * The sample data of the system screens agree between them (docs/25 §12): the weeks add up to the
 * sales, the channels to the gross profit, «De cada $100» to 100.00, the piece costs what the
 * formula of Aprende says, stock = reserved + available, and the purchases add up to their total.
 */
import { describe, expect, it } from 'vitest';
import { computeCost } from '@/lib/learn/cost';
import {
  demoChannels,
  demoOrder3,
  demoPer100,
  demoPiece,
  demoPurchases,
  demoPurchasesTotal,
  demoSales,
  demoStock,
  demoWeeks,
} from '@/config/system-demo';

const cents = (n: number) => Math.round(n * 100);
const sum = (xs: readonly number[]) => xs.reduce((s, x) => s + cents(x), 0) / 100;

describe('sample data of the system screens', () => {
  it('the 30 days: weeks add up to the sales and the gross profit; net = gross − expenses', () => {
    expect(sum(demoWeeks.map((w) => w.sales))).toBe(demoSales.total);
    expect(sum(demoWeeks.map((w) => w.gross))).toBe(demoSales.gross);
    expect(demoSales.gross - demoSales.expenses).toBe(demoSales.net);
  });

  it('the channels add up to the sales, the count and the gross profit', () => {
    expect(sum(demoChannels.map((c) => c.total))).toBe(demoSales.total);
    expect(demoChannels.reduce((s, c) => s + c.count, 0)).toBe(demoSales.count);
    expect(sum(demoChannels.map((c) => c.gross))).toBe(demoSales.gross);
  });

  it('«De cada $100» adds up to 100.00', () => {
    expect(sum(demoPer100.map((p) => p.amount))).toBe(100);
  });

  it('the piece costs what the formula of Aprende says', () => {
    const r = computeCost({
      grams: demoPiece.grams,
      rollPrice: demoPiece.perGram * 1000,
      rollGrams: 1000,
      purgePct: demoPiece.purgePct,
      hours: demoPiece.hours,
      watts: demoPiece.kw * 1000,
      kwhPrice: demoPiece.kwhPrice,
      printerPrice: 0,
      lifeHours: 1,
      maintenancePerHour: demoPiece.machinePerHour,
      extras: demoPiece.extras,
      failPct: demoPiece.failPct,
    });
    expect(r.material).toBe(demoPiece.material);
    expect(r.electricity).toBe(demoPiece.power);
    expect(r.machine).toBe(demoPiece.machine);
    expect(r.cost).toBe(demoPiece.cost);
    expect(Math.round((demoPiece.price - demoPiece.cost) * 100) / 100).toBe(demoPiece.profit);
    expect(Math.round((demoPiece.profit / demoPiece.price) * 1000) / 10).toBe(demoPiece.marginPct);
    expect(Math.round((demoPiece.price / demoPiece.cost) * 10) / 10).toBe(demoPiece.times);
  });

  it('order #3: paid + balance = total', () => {
    expect(demoOrder3.paid + demoOrder3.balance).toBe(demoOrder3.total);
  });

  it('stock = reserved + available', () => {
    expect(demoStock.reserved + demoStock.available).toBe(demoStock.pieces);
  });

  it('the purchases add up to their total', () => {
    expect(sum(demoPurchases.flatMap((p) => p.items.map((i) => i.amount)))).toBe(
      demoPurchasesTotal,
    );
  });
});
