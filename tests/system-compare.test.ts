/**
 * The plan comparison of the pricing page (docs/25 §7.2, §12): every limit row reads a limit the
 * plans have, every row and group has its text, the support row names every plan, and a row with
 * roles is only checked where a plan has roles.
 */
import { describe, expect, it } from 'vitest';
import { site } from '@/config/site';
import { compareGroups } from '@/config/system';
import { es } from '@/i18n/es';
import { dataProblems } from '@/lib/system/guard';

const rows = compareGroups.flatMap((g) => g.rows);
const t = es.system.pricing.compare;

describe('the plan comparison', () => {
  it('reads only limits the plans have', () => {
    const limitRows = rows.flatMap((r) => (r.kind === 'limit' ? [r.id] : []));
    expect(limitRows).toEqual(['users', 'printers', 'orders']);
    expect(dataProblems({ plans: site.system.plans, limitRows, money: [{ amount: 100 }] })).toEqual(
      [],
    );
  });

  it('has a text for every group and row, and no row twice', () => {
    for (const g of compareGroups) expect(t.groups[g.id]).toBeTruthy();
    for (const r of rows) expect(t.rows[r.id]).toBeTruthy();
    expect(new Set(rows.map((r) => r.id)).size).toBe(rows.length);
  });

  it('gives support to every plan of site.system and no other', () => {
    const ids = site.system.plans.map((p) => p.id).sort();
    for (const r of rows) {
      if (r.kind === 'support') expect(Object.keys(r.plans).sort()).toEqual(ids);
    }
  });

  it('has at least one plan with roles for the rows that need them', () => {
    expect(rows.some((r) => r.kind === 'check' && r.in === 'roles')).toBe(true);
    expect(site.system.plans.some((p) => p.roles)).toBe(true);
  });

  it('names the plans in the caption', () => {
    expect(t.caption(['Gratis', 'Taller', 'Negocio'])).toBe(
      'Comparación de los planes Gratis, Taller y Negocio',
    );
  });
});
