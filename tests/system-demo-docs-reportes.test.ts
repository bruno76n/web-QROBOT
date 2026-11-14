/**
 * The sample data of the quote and reports screens agree (docs/25 §12): the quote items add up to
 * its total, the period of the reports is the last 30 days up to today and the 30 before, and the
 * products with the most gross profit are sorted and fit in the gross profit of the period.
 */
import { describe, expect, it } from 'vitest';
import {
  demoBusiness,
  demoPer100,
  demoQuote,
  demoQuoteAmounts,
  demoQuoteTotal,
  demoReportPeriod,
  demoReportRanges,
  demoSales,
  demoTopProducts,
} from '@/config/system-demo';

describe('sample data of the quote and reports screens', () => {
  it('the quote: each amount is quantity × price and they add up to $2,010.00', () => {
    expect(demoQuoteAmounts).toEqual([1350, 660]);
    expect(demoQuote.items.map((i) => i.qty * i.price)).toEqual(demoQuoteAmounts);
    expect(demoQuoteTotal).toBe(2010);
    expect(demoQuote.date).toBe(demoBusiness.today);
  });

  it('the period: 15 oct – 13 nov 2026, compared with 15 sep – 14 oct', () => {
    expect(demoReportPeriod).toEqual({
      from: '2026-10-15',
      to: '2026-11-13',
      prevFrom: '2026-09-15',
      prevTo: '2026-10-14',
    });
    expect(demoReportRanges).toContain(demoSales.days);
  });

  it('net margin 37.8 % and «De cada $100»: costs and expenses $62.10, net profit $37.90', () => {
    expect(((demoSales.net / demoSales.total) * 100).toFixed(1)).toBe('37.8');
    const costs = demoPer100.filter((p) => p.id !== 'net');
    expect(costs.reduce((s, p) => s + Math.round(p.amount * 100), 0) / 100).toBe(62.1);
    expect(demoPer100.find((p) => p.id === 'net')?.amount).toBe(37.9);
  });

  it('the products with the most gross profit: largest first and within the gross profit', () => {
    const gross = demoTopProducts.map((p) => p.gross);
    expect([...gross].sort((a, b) => b - a)).toEqual(gross);
    expect(gross.reduce((s, g) => s + g, 0)).toBeLessThanOrEqual(demoSales.gross);
  });
});
