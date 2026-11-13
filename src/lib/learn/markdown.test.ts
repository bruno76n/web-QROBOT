import { describe, expect, it } from 'vitest';
import { findMarks, linkKind, parseMarkdown, type LearnNode } from './markdown';

const first = (md: string): LearnNode => parseMarkdown(md).ast[0] as LearnNode;

describe('headings', () => {
  it('gets an id from the text and never repeats it', () => {
    const { ast, toc } = parseMarkdown('## Datos\n\n## Datos\n\n### Más cosas\n');
    expect(ast.map((n) => (n.t === 'h' ? n.id : ''))).toEqual(['datos', 'datos-2', 'mas-cosas']);
    expect(toc).toEqual([
      { id: 'datos', text: 'Datos' },
      { id: 'datos-2', text: 'Datos' },
    ]);
  });
  it('# goes down to h2 and #### or deeper to h3', () => {
    const levels = parseMarkdown('# A\n\n#### B\n\n###### C').ast.map((n) =>
      n.t === 'h' ? n.level : 0,
    );
    expect(levels).toEqual([2, 3, 3]);
  });
});

describe('inline and blocks', () => {
  it('bold, italics, code and lists', () => {
    expect(first('Un **fuerte** y *suave* con `código`')).toMatchObject({
      t: 'p',
      c: [{ t: 'text' }, { t: 'strong' }, { t: 'text' }, { t: 'em' }, { t: 'text' }, { t: 'code' }],
    });
    expect(first('- a\n- b')).toMatchObject({ t: 'ul', items: [[{ t: 'p' }], [{ t: 'p' }]] });
    expect(first('1. a\n2. b')).toMatchObject({ t: 'ol' });
  });
  it('a GFM table keeps the first row as the head', () => {
    const t = first('| A | B |\n|---|---|\n| 1 | 2 |\n| 3 | 4 |');
    expect(t).toMatchObject({ t: 'table' });
    if (t.t === 'table') {
      expect(t.head).toHaveLength(2);
      expect(t.rows).toHaveLength(2);
    }
  });
  it('a code block keeps its text', () => {
    expect(first('```\nG28\n```')).toEqual({ t: 'pre', v: 'G28' });
  });
});

describe('callouts', () => {
  it.each([
    ['Dato curioso', 'fact'],
    ['Truco', 'tip'],
    ['Cuidado', 'careful'],
  ])('> **%s.** becomes %s', (label, kind) => {
    const n = first(`> **${label}.** Texto de prueba.`);
    expect(n).toMatchObject({ t: 'callout', kind });
    if (n.t === 'callout') {
      expect(n.c[0]).toEqual({ t: 'p', c: [{ t: 'text', v: 'Texto de prueba.' }] });
    }
  });
  it('another quote stays a quote', () => {
    expect(first('> Algo que dijo alguien')).toMatchObject({ t: 'quote' });
  });
});

describe('marks', () => {
  it('a mark alone in its paragraph', () => {
    expect(first('[[tabla:filamentos]]')).toEqual({ t: 'mark', name: 'tabla:filamentos' });
    expect(first('[[cabe-mi-pieza]]')).toEqual({ t: 'mark', name: 'cabe-mi-pieza' });
  });
  it('with more text it is text; an unknown one is text', () => {
    expect(first('Mira [[cabe-mi-pieza]] aquí').t).toBe('p');
    expect(first('[[no-existe]]').t).toBe('p');
  });
  it('findMarks lists every mark paragraph, known or not', () => {
    expect(findMarks('a\n\n[[tabla:impresoras]]\n\n[[raro]]\n\nMira [[cabe-mi-pieza]]')).toEqual([
      'tabla:impresoras',
      'raro',
    ]);
  });
});

describe('links', () => {
  it.each([
    ['/aprende/filamentos/pla', 'internal'],
    ['/aprende', 'internal'],
    ['/catalogo', 'internal'],
    ['/catalogo/navidad', 'internal'],
    ['/producto/llaveros', 'internal'],
    ['#datos', 'internal'],
    ['https://wiki.bambulab.com', 'external'],
    ['http://x.mx', null],
    ['javascript:alert(1)', null],
    ['data:text/html,<b>', null],
    ['//evil.com', null],
    ['/admin', null],
  ])('%s → %s', (href, kind) => {
    expect(linkKind(href)).toBe(kind);
  });
  it('a forbidden link is plain text; an external one opens apart', () => {
    expect(first('[x](javascript:alert(1))')).toEqual({ t: 'p', c: [{ t: 'text', v: 'x' }] });
    expect(first('[ver](https://a.mx)')).toMatchObject({
      c: [{ t: 'a', href: 'https://a.mx', external: true }],
    });
  });
});

describe('safety', () => {
  it('HTML stays as text and images disappear', () => {
    const { ast } = parseMarkdown(
      '<script>alert(1)</script>\n\nHola <img src=x onerror=alert(1)> ![a](/x.png)\n',
    );
    expect(JSON.stringify(ast)).not.toContain('"t":"html"');
    expect(ast[0]).toEqual({ t: 'p', c: [{ t: 'text', v: '<script>alert(1)</script>' }] });
    expect(JSON.stringify(ast)).toContain('<img src=x onerror=alert(1)>');
    expect(JSON.stringify(ast)).not.toContain('/x.png');
  });
  it('a body with every attack never makes a link to them', () => {
    const { ast } = parseMarkdown(
      '[a](javascript:alert(1)) [b](data:text/html,x) [c](http://x.mx) [d](/admin)',
    );
    expect(JSON.stringify(ast)).not.toContain('"t":"a"');
  });
});

describe('toc and plain text', () => {
  it('plain text joins everything without marks', () => {
    const { text } = parseMarkdown(
      '## Hola\n\nUn **dato** aquí.\n\n[[cabe-mi-pieza]]\n\n- uno\n- dos',
    );
    expect(text).toBe('Hola Un dato aquí. uno dos');
  });
});
