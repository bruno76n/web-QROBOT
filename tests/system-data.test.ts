/**
 * The data of the page for workshops as they are in the repository (docs/25 §12): the invariants
 * always, and the switch guard, which fails while the page is on with provisional addresses.
 */
import { describe, expect, it } from 'vitest';
import { site } from '@/config/site';
import { es } from '@/i18n/es';
import { dataProblems, switchProblems } from '@/lib/system/guard';
import { compareGroups, moneyExample, platforms, roles, tour } from '@/config/system';

const limitRows = compareGroups.flatMap((g) =>
  g.rows.flatMap((r) => ('limit' in r ? [r.limit] : [])),
);

describe('site.system and the page structure', () => {
  it('keep the invariants', () => {
    expect(dataProblems({ plans: site.system.plans, limitRows, money: moneyExample })).toEqual([]);
  });

  it('pass the switch guard (only checked with the page on)', () => {
    expect(switchProblems(site.system)).toEqual([]);
  });

  it('with the page on, the provisional addresses fail the guard', () => {
    expect(switchProblems({ ...site.system, enabled: true })).toEqual([
      'appUrl',
      'download:mac',
      'download:windows',
    ]);
  });

  it('stays hidden in the repository', () => {
    expect(site.system.enabled).toBe(false);
  });

  it('has a text for every row, part, role and platform', () => {
    for (const g of compareGroups) {
      expect(es.system.pricing.compare.groups[g.id]).toBeTruthy();
      for (const r of g.rows) expect(es.system.pricing.compare.rows[r.id]).toBeTruthy();
    }
    for (const t of tour) expect(es.system.home.tour.items[t.id].title).toBeTruthy();
    for (const m of moneyExample) expect(es.system.home.money.parts[m.id]).toBeTruthy();
    for (const r of roles.rows) {
      expect(es.system.home.team.rows[r.id]).toBeTruthy();
      for (const who of r.sees) expect(roles.columns).toContain(who);
    }
    for (const p of platforms) expect(es.system.download.platforms[p.id].name).toBeTruthy();
  });
});
