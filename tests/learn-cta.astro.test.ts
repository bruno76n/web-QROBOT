/**
 * Closing call of Aprende (docs/21 §4.6): with `cta: system` it shows the page's `ctaText` and a
 * black button to `/talleres` only while the page for workshops is visible; hidden, nothing. The
 * WhatsApp call is unchanged. `systemVisible` is mocked to test both states.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';

const state = vi.hoisted(() => ({ visible: false }));

vi.mock('@/config/system', () => ({
  get systemVisible() {
    return state.visible;
  },
}));

const { default: Cta } = await import('../src/components/learn/Cta.astro');
const { es } = await import('../src/i18n/es');
const { site } = await import('../src/config/site');

const ctaText = 'Quick Cerebro lleva las horas de cada impresora.';

async function render(cta: 'whatsapp' | 'system' | 'none', text = ctaText): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(Cta, { props: { cta, ctaText: text, title: 'Costo' } });
}

describe('Aprende closing call', () => {
  beforeEach(() => {
    state.visible = false;
  });

  it('system, hidden: shows nothing and never links to /talleres', async () => {
    const html = await render('system');
    expect(html).not.toContain('ap-cta');
    expect(html).not.toContain('/talleres');
    expect(html).not.toContain(ctaText);
  });

  it('system, visible: the page text and a black button to /talleres', async () => {
    state.visible = true;
    const html = await render('system');
    expect(html).toContain('class="ap-cta"');
    expect(html).toContain(ctaText);
    expect(html).toMatch(/<a class="btn" href="\/talleres">/);
    expect(html).not.toContain('btn wa');
    expect(html).toContain(es.learn.cta.system.button(site.system.name));
  });

  it('system, visible, without ctaText: the default sentence', async () => {
    state.visible = true;
    const html = await render('system', '');
    expect(html).toContain(es.learn.cta.system.text(site.system.name));
  });

  it('whatsapp and none do not depend on the switch', async () => {
    state.visible = true;
    const wa = await render('whatsapp', '');
    expect(wa).toContain('btn wa');
    expect(wa).toContain(es.learn.cta.text);
    expect(wa).not.toContain('/talleres');
    expect(await render('none')).not.toContain('ap-cta');
  });
});
