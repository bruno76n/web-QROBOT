import { describe, expect, it } from 'vitest';
import { buildImportPlan } from '../src/lib/learn/import';
import { loadLearnFiles } from '../scripts/learn-files';

// The real files of `content/aprende/` must always pass the validation (docs/21 §8).
describe('content/aprende', () => {
  const plan = buildImportPlan(
    loadLearnFiles(new URL('../content/aprende', import.meta.url).pathname),
  );

  it('loads the 118 pages, 2 of them hidden', () => {
    expect(plan.pages).toHaveLength(118);
    expect(
      plan.pages
        .filter((p) => !p.published)
        .map((p) => p.slug)
        .sort(),
    ).toEqual(['encargar/pago', 'encargar/personajes']);
  });
  it('has its tables, sources and search settings', () => {
    expect(plan.datasets.map((d) => d.key).sort()).toEqual([
      'buscador',
      'datos-curiosos',
      'filamentos',
      'impresoras',
      'mantenimiento',
    ]);
    expect(plan.sources.length).toBeGreaterThan(10);
    expect(plan.faqs.length).toBeGreaterThan(20);
  });
  it('has no warnings (every internal link exists)', () => {
    expect(plan.warnings).toEqual([]);
  });
});
