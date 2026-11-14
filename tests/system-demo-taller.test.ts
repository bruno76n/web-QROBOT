/**
 * The sample data of the workshop screens agree between them and with the rest (docs/25 §12):
 * the filaments add up to their header and their states follow the limits, the purchases match the
 * filaments, the stock rows add up to `demoStock`, the production adds up, and the printers agree
 * with order #3 and with the nozzle rule.
 */
import { describe, expect, it } from 'vitest';
import {
  demoFilamentLimits,
  demoFilamentTotals,
  demoFilaments,
  demoNozzleEvery,
  demoOrder3,
  demoPiece,
  demoPrinters,
  demoProduction,
  demoPurchaseNotes,
  demoPurchases,
  demoSet,
  demoStock,
  demoStockRows,
} from '@/config/system-demo';

describe('sample data of the workshop screens', () => {
  it('the filaments add up to their header: filaments, rolls and kilos', () => {
    expect(demoFilaments.length).toBe(demoFilamentTotals.filaments);
    expect(demoFilaments.reduce((n, f) => n + f.rolls, 0)).toBe(demoFilamentTotals.rolls);
    const grams = demoFilaments.reduce((n, f) => n + f.grams, 0);
    expect(Math.round(grams / 100) / 10).toBe(demoFilamentTotals.kg);
  });

  it('each filament has the state of its grams and fits in its rolls', () => {
    for (const f of demoFilaments) {
      const state =
        f.grams <= demoFilamentLimits.critical
          ? 'critical'
          : f.grams <= demoFilamentLimits.low
            ? 'lowStock'
            : 'normal';
      expect(f.state, f.name).toBe(state);
      expect(f.grams, f.name).toBeLessThanOrEqual(f.rolls * f.rollGrams);
    }
  });

  it('the filament of the piece costs the same per gram on both screens', () => {
    const f = demoFilaments.find((x) => x.name === demoPiece.filament);
    expect(f?.perGram).toBe(demoPiece.perGram);
  });

  it('every purchase has its note; filaments exist, and the urgent one needs more than there is', () => {
    for (const item of demoPurchases.flatMap((p) => p.items)) {
      const note = demoPurchaseNotes[item.name];
      expect(note, item.name).toBeDefined();
      if (note?.kind === 'filament') {
        const f = demoFilaments.find((x) => x.name === item.name);
        expect(f, item.name).toBeDefined();
        if (note.urgent) expect(note.urgent.needs).toBeGreaterThan(f?.grams ?? 0);
        else expect(f?.state).not.toBe('normal');
      } else if (note) {
        expect(note.stock).toBeLessThan(note.min);
      }
    }
    expect(Object.keys(demoPurchaseNotes)).toHaveLength(
      demoPurchases.flatMap((p) => p.items).length,
    );
  });

  it('the stock rows add up to the header; a piece with variants is their sum', () => {
    const sum = (key: 'stock' | 'reserved') => demoStockRows.reduce((n, r) => n + r[key], 0);
    expect(sum('stock')).toBe(demoStock.pieces);
    expect(sum('reserved')).toBe(demoStock.reserved);
    expect(sum('stock') - sum('reserved')).toBe(demoStock.available);
    for (const r of demoStockRows) {
      expect(r.reserved).toBeLessThanOrEqual(r.stock);
      if (!r.variants) continue;
      expect(r.variants.reduce((n, v) => n + v.stock, 0)).toBe(r.stock);
      expect(r.variants.reduce((n, v) => n + v.reserved, 0)).toBe(r.reserved);
    }
  });

  it('the set cannot be put together while its missing piece has none available', () => {
    const missing = demoStockRows.find((r) => r.name === demoSet.missing);
    expect(missing && missing.stock - missing.reserved).toBe(0);
    expect(demoSet.buildable).toBe(0);
  });

  it('production: good + failed = prints', () => {
    expect(demoProduction.good + demoProduction.failed).toBe(demoProduction.prints);
  });

  it('the printers: the P1S prints order #3 and its nozzle is due by the rule', () => {
    expect(demoPrinters[0]?.current?.order).toBe(demoOrder3.number);
    for (const p of demoPrinters) {
      if (p.maintenance?.part === 'nozzle') {
        expect(p.maintenance.inHours).toBe(demoNozzleEvery - (p.hours % demoNozzleEvery));
      }
      if (p.current) expect(p.current.progress).toBeLessThan(100);
    }
  });
});
