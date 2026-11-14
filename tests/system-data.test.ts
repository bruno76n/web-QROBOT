/**
 * The data of the page for workshops as they are in the repository (docs/25 §12): the plan
 * invariants always, and the switch guard, which fails while the page is on with provisional
 * addresses.
 */
import { describe, expect, it } from 'vitest';
import { site } from '@/config/site';
import { modules, moduleGroups } from '@/config/system';
import { es } from '@/i18n/es';
import { dataProblems, switchProblems } from '@/lib/system/guard';

describe('site.system and the page structure', () => {
  it('keep the plan invariants', () => {
    expect(
      dataProblems({
        plans: site.system.plans,
        limitRows: ['users', 'printers', 'orders'],
        money: [{ amount: 100 }],
      }),
    ).toEqual([]);
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

  it('has 13 modules in the 3 groups of the menu, each with its texts', () => {
    expect(modules).toHaveLength(13);
    for (const g of moduleGroups) expect(es.system.groups[g]).toBeTruthy();
    for (const m of modules) {
      expect(moduleGroups).toContain(m.group);
      expect(es.system.modules[m.id].name).toBeTruthy();
      expect(es.system.modules[m.id].text).toBeTruthy();
    }
  });
});
