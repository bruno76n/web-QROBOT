/**
 * Closing call of Aprende (docs/21 §4.6): the `system` call shows the page's text and the black
 * button to `/talleres` only while the page for workshops is visible (docs/25 §2); hidden, it paints
 * nothing. The WhatsApp call and `none` are checked alongside.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';

// The switch is read on every render, so each test sets it before painting.
const state = vi.hoisted(() => ({ visible: false }));
vi.mock('@/config/system', () => ({
  get systemVisible() {
    return state.visible;
  },
}));

const { default: Cta } = await import('../src/components/learn/Cta.astro');
const { es } = await import('../src/i18n/es');
const { site } = await import('../src/config/site');

const text = 'Quick Cerebro hace este cálculo solo, con tus precios.';

async function render(cta: 'whatsapp' | 'system' | 'none', ctaText = text): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(Cta, { props: { cta, ctaText, title: 'Costo de una pieza' } });
}

describe('Aprende call', () => {
  beforeEach(() => {
    state.visible = false;
  });

  it('system, visible: the page text and a black button to /talleres', async () => {
    state.visible = true;
    const html = await render('system');
    expect(html).toContain('class="ap-cta"');
    expect(html).toContain(`<p>${text}</p>`);
    expect(html).toMatch(/<a class="btn" href="\/talleres">/);
    expect(html).toContain(es.learn.cta.system(site.system.name));
    expect(html).not.toContain('btn wa');
    expect(html).not.toContain('wa.me');
  });

  it('system, visible, without ctaText: only the button', async () => {
    state.visible = true;
    const html = await render('system', '');
    expect(html).toContain('href="/talleres"');
    expect(html).not.toContain('<p>');
  });

  it('system, hidden: nothing at all', async () => {
    const html = await render('system');
    expect(html.trim()).toBe('');
    expect(html).not.toContain('/talleres');
  });

  it('whatsapp: the green button, whatever the switch', async () => {
    for (const visible of [false, true]) {
      state.visible = visible;
      const html = await render('whatsapp', '');
      expect(html).toContain(es.learn.cta.text);
      expect(html).toContain('class="btn wa"');
      expect(html).not.toContain('/talleres');
    }
  });

  it('none: nothing', async () => {
    state.visible = true;
    expect((await render('none')).trim()).toBe('');
  });
});
