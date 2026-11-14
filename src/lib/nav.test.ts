import { describe, expect, it } from 'vitest';
import { siteNav } from './nav';

describe('siteNav', () => {
  it('hidden: Catálogo and Aprende only, nothing points to /talleres', () => {
    const items = siteNav(false);
    expect(items.map((i) => i.href)).toEqual(['/catalogo', '/aprende']);
    expect(JSON.stringify(items)).not.toContain('/talleres');
  });
  it('visible: adds «Para talleres» with its short name', () => {
    expect(siteNav(true)[2]).toEqual({
      label: 'Para talleres',
      short: 'Talleres',
      href: '/talleres',
    });
  });
});
