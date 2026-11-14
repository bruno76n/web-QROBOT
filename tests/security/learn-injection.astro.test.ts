/**
 * Injection in Aprende (docs/21 §14): a body with `<script>`, `<img onerror>`, `javascript:` and
 * `data:` links is saved through the Markdown allow-list and painted with the page components. The
 * HTML must come out as text and the forbidden links without `href`.
 */
import { describe, expect, it } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Content from '../../src/components/learn/Content.astro';
import { parseMarkdown } from '../../src/lib/learn/markdown';

const attack = [
  '<script>alert(1)</script>',
  '',
  'Hola <img src=x onerror=alert(2)> y <b>negrita</b>.',
  '',
  '[uno](javascript:alert(3)) [dos](data:text/html,<script>alert(4)</script>) [tres](http://x.mx) [cuatro](/aprende/filamentos/pla)',
  '',
  '> **Dato curioso.** <iframe src="https://evil.example"></iframe>',
  '',
  '| A | B |',
  '|---|---|',
  '| <svg onload=alert(5)> | [x](javascript:void(0)) |',
].join('\n');

async function render(markdown: string): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(Content, {
    props: { ast: parseMarkdown(markdown).ast, data: {} },
  });
}

describe('Aprende content is painted as text', () => {
  it('no tag from the body becomes markup', async () => {
    const html = await render(attack);
    expect(html).not.toMatch(/<script[\s>]/i);
    expect(html).not.toMatch(/<img[^>]*onerror/i);
    expect(html).not.toMatch(/<iframe/i);
    expect(html).not.toMatch(/<svg[^>]*onload/i);
    expect(html).not.toMatch(/<b>negrita/);
    // …it is there, escaped, as text
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('&lt;img src=x onerror=alert(2)&gt;');
  });

  it('forbidden links have no href; allowed ones keep theirs', async () => {
    const html = await render(attack);
    expect(html).not.toMatch(/href="javascript:/i);
    expect(html).not.toMatch(/href="data:/i);
    expect(html).not.toMatch(/href="http:/i);
    expect(html).toContain('href="/aprende/filamentos/pla"');
    expect(html).toContain('uno');
    expect(html).toContain('dos');
  });

  it('external links open apart with rel="noopener"', async () => {
    const html = await render('[Bambu](https://wiki.bambulab.com)');
    expect(html).toMatch(
      /<a href="https:\/\/wiki\.bambulab\.com" target="_blank" rel="noopener">Bambu<\/a>/,
    );
  });
});
