import { describe, expect, it } from 'vitest';
import { fixtureFiles, withFile } from '../../../tests/fixtures/learn/load';
import {
  buildImportPlan,
  faqRecords,
  ImportError,
  pageIdFor,
  pageSearchText,
  slugFromPath,
  unknownMarks,
} from './import';

const fail = (files: ReturnType<typeof fixtureFiles>): ImportError => {
  try {
    buildImportPlan(files);
  } catch (e) {
    return e as ImportError;
  }
  throw new Error('should have failed');
};

describe('buildImportPlan', () => {
  it('turns the fixtures into rows', () => {
    const plan = buildImportPlan(fixtureFiles());
    expect(plan.pages.map((p) => p.slug).sort()).toEqual([
      '',
      'filamentos',
      'filamentos/oculta',
      'filamentos/petg',
      'filamentos/pla',
    ]);
    expect(plan.faqs).toHaveLength(2);
    expect(plan.faqs[0]).toMatchObject({
      id: 'learn-filamentos-pla-q1',
      pageId: 'learn-filamentos-pla',
      position: 1,
    });
    expect(plan.datasets.map((d) => d.key).sort()).toEqual(['buscador', 'filamentos']);
    expect(plan.sources).toEqual([
      {
        id: 'bambu-tabla',
        name: 'Bambu Lab · Tabla de materiales',
        url: 'https://wiki.bambulab.com/',
      },
    ]);
    expect(plan.warnings).toEqual([]);
  });

  it('converts the body once: tree, toc and normalized search text', () => {
    const plan = buildImportPlan(fixtureFiles());
    const pla = plan.pages.find((p) => p.slug === 'filamentos/pla')!;
    expect(JSON.parse(pla.bodyAst)[0]).toMatchObject({ t: 'h', id: 'datos' });
    expect(JSON.parse(pla.toc)).toEqual([{ id: 'datos', text: 'Datos' }]);
    const [title, tags, rest] = pla.searchText.split('\n');
    expect(title).toBe('pla');
    expect(tags).toBe('pla acido polilactico');
    expect(rest).toContain(
      '¿el pla es biodegradable?'.normalize('NFD').replace(/\p{Diacritic}/gu, ''),
    );
  });

  it('hidden pages are loaded but stay hidden', () => {
    const plan = buildImportPlan(fixtureFiles());
    expect(plan.pages.find((p) => p.slug === 'filamentos/oculta')?.published).toBe(false);
  });

  it('the home page keeps what only it has', () => {
    const home = buildImportPlan(fixtureFiles()).pages.find((p) => p.slug === '')!;
    expect(JSON.parse(home.extra)).toMatchObject({ suggestions: ['PETG'] });
    expect(pageIdFor('')).toBe('learn-home');
  });

  it('an unknown topic stops everything and says file and field', () => {
    const e = fail(
      withFile('paginas/filamentos/pla.md', (r) => r.replace('topic: filamentos', 'topic: cocina')),
    );
    expect(e).toBeInstanceOf(ImportError);
    expect(e.file).toBe('paginas/filamentos/pla.md');
    expect(e.field).toBe('topic');
  });
  it('a related page that does not exist is an error', () => {
    const e = fail(
      withFile('paginas/filamentos/pla.md', (r) =>
        r.replace('[filamentos/petg]', '[filamentos/nada]'),
      ),
    );
    expect(e).toMatchObject({ file: 'paginas/filamentos/pla.md', field: 'related' });
  });
  it('a source that does not exist is an error', () => {
    const e = fail(
      withFile('paginas/filamentos/pla.md', (r) => r.replace('[bambu-tabla]', '[nadie]')),
    );
    expect(e).toMatchObject({ field: 'sources' });
  });
  it('an unknown [[mark]] is an error', () => {
    const e = fail(
      withFile('paginas/filamentos.md', (r) => r.replace('[[tabla:filamentos]]', '[[tabla:nada]]')),
    );
    expect(e).toMatchObject({ file: 'paginas/filamentos.md', field: 'cuerpo' });
  });
  it('a slug that does not match the file is an error', () => {
    const e = fail(
      withFile('paginas/filamentos/pla.md', (r) =>
        r.replace('slug: filamentos/pla', 'slug: filamentos/otro'),
      ),
    );
    expect(e).toMatchObject({ field: 'slug' });
  });
  it('a file without frontmatter is an error', () => {
    const e = fail(withFile('paginas/filamentos/pla.md', () => 'Solo texto'));
    expect(e).toMatchObject({ field: 'frontmatter' });
  });
  it('a broken internal link is only a warning', () => {
    const plan = buildImportPlan(
      withFile('paginas/filamentos/petg.md', (r) =>
        r.replace('/aprende/filamentos/pla', '/aprende/filamentos/nada'),
      ),
    );
    expect(plan.warnings).toEqual([
      'paginas/filamentos/petg.md › cuerpo: la liga /aprende/filamentos/nada no existe',
    ]);
  });
  it('a table with a wrong value says the file and the row', () => {
    const e = fail(
      withFile('datos/filamentos.json', (r) => r.replace('"printer": "any"', '"printer": "raro"')),
    );
    expect(e).toMatchObject({ file: 'datos/filamentos.json' });
    expect(e.field).toContain('printer');
  });
});

describe('slugFromPath', () => {
  it('maps files to slugs', () => {
    expect(slugFromPath('paginas/index.md')).toBe('');
    expect(slugFromPath('paginas/filamentos.md')).toBe('filamentos');
    expect(slugFromPath('paginas/filamentos/pla.md')).toBe('filamentos/pla');
  });
});

describe('helpers shared with the panel', () => {
  it('pageSearchText: title, tags and the rest, normalized, one line each', () => {
    expect(
      pageSearchText({
        title: 'Ácido',
        tags: ['PLA', 'almidón'],
        subtitle: 'Uno.',
        summary: 'Dos.',
        faqs: [{ q: '¿Tres?' }],
      }),
    ).toBe('acido\npla almidon\nuno. dos. ¿tres?');
  });
  it('faqRecords: ids and positions from 1, in order', () => {
    expect(
      faqRecords('learn-x', [
        { q: 'A', a: '1' },
        { q: 'B', a: '2' },
      ]),
    ).toEqual([
      { id: 'learn-x-q1', pageId: 'learn-x', position: 1, question: 'A', answer: '1' },
      { id: 'learn-x-q2', pageId: 'learn-x', position: 2, question: 'B', answer: '2' },
    ]);
    expect(faqRecords('learn-x', [])).toEqual([]);
  });
  it('unknownMarks: only the unknown ones, once', () => {
    expect(unknownMarks('[[cabe-mi-pieza]]\n\n[[x]]\n\ntexto [[y]] no\n\n[[x]]')).toEqual(['x']);
    expect(unknownMarks('Sin marcas.')).toEqual([]);
  });
});
