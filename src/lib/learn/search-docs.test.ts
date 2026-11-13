import { describe, expect, it } from 'vitest';
import {
  buildSearchDocs,
  splitHighlight,
  volumeSlug,
  type SearchFaqRow,
  type SearchPageRow,
} from './search-docs';

const page = (over: Partial<SearchPageRow>): SearchPageRow => ({
  id: 'pg1',
  slug: 'filamentos/pla',
  topic: 'filamentos',
  title: 'PLA',
  summary: 'Para figuras.',
  bodyText: 'cuerpo',
  tags: ['pla'],
  audience: 'all',
  published: true,
  sortOrder: 1,
  ...over,
});
const faq = (over: Partial<SearchFaqRow>): SearchFaqRow => ({
  id: 'fq1',
  pageId: 'pg1',
  position: 2,
  question: '¿Es biodegradable?',
  answer: 'Solo en composta.',
  ...over,
});

describe('buildSearchDocs', () => {
  it('a hidden page and its questions do not get in', () => {
    const docs = buildSearchDocs({
      pages: [page({}), page({ id: 'pg2', slug: 'x/y', published: false })],
      faqs: [faq({}), faq({ id: 'fq2', pageId: 'pg2' })],
      printers: null,
    });
    expect(docs.map((d) => d.id)).toEqual(['p_pg1', 'f_fq1']);
  });
  it('one document per question, with its anchor', () => {
    const docs = buildSearchDocs({ pages: [page({})], faqs: [faq({})], printers: null });
    expect(docs[1]).toMatchObject({
      type: 'faq',
      title: '¿Es biodegradable?',
      text: 'Solo en composta.',
      url: '/aprende/filamentos/pla#pregunta-2',
      topicLabel: 'Filamentos',
    });
  });
  it('the body is cut to 2,000 characters; only pages have it', () => {
    const docs = buildSearchDocs({
      pages: [page({ bodyText: 'a'.repeat(5000) })],
      faqs: [faq({})],
      printers: null,
    });
    expect(docs[0]?.body).toHaveLength(2000);
    expect(docs[1]?.body).toBe('');
  });
  it('the home page has /aprende as its url', () => {
    const docs = buildSearchDocs({
      pages: [page({ slug: '', topic: '' })],
      faqs: [],
      printers: null,
    });
    expect(docs[0]?.url).toBe('/aprende');
  });
  it('glossary terms and printers have their url', () => {
    const docs = buildSearchDocs({
      pages: [
        page({
          id: 'gl',
          slug: 'glosario',
          topic: 'glosario',
          terms: [
            { term: 'Altura de capa', en: 'layer height', definition: 'grosor de cada capa.' },
          ],
        }),
        page({ id: 'vol', slug: volumeSlug, topic: 'maquinas' }),
      ],
      faqs: [],
      printers: {
        rows: [
          {
            brand: 'Bambu Lab',
            model: 'P1S',
            widthMm: 256,
            depthMm: 256,
            heightMm: 256,
            liters: 16.8,
            enclosed: true,
            motion: 'bed-slinger',
            size: 'mediana',
            note: '',
            sources: [],
          },
        ],
      },
    });
    expect(docs.find((d) => d.type === 'term')).toMatchObject({
      id: 't_altura-de-capa',
      title: 'Altura de capa (layer height)',
      url: '/aprende/glosario#altura-de-capa',
    });
    expect(docs.find((d) => d.type === 'printer')).toMatchObject({
      id: 'i_bambu-lab-p1s',
      title: 'Bambu Lab P1S',
      text: '256 × 256 × 256 mm · cerrada',
      url: `/aprende/${volumeSlug}#bambu-lab-p1s`,
    });
  });
});

describe('splitHighlight', () => {
  it('no marks', () => {
    expect(splitHighlight('hola')).toEqual([{ t: 'hola', m: false }]);
  });
  it('one mark, and marks at the start and the end', () => {
    expect(splitHighlight('a\u0001b\u0002c')).toEqual([
      { t: 'a', m: false },
      { t: 'b', m: true },
      { t: 'c', m: false },
    ]);
    expect(splitHighlight('\u0001ab\u0002')).toEqual([{ t: 'ab', m: true }]);
  });
  it('several marks', () => {
    expect(splitHighlight('\u0001a\u0002 y \u0001b\u0002')).toEqual([
      { t: 'a', m: true },
      { t: ' y ', m: false },
      { t: 'b', m: true },
    ]);
  });
  it('a <script> comes out as text', () => {
    expect(splitHighlight('<script>x</script>\u0001y\u0002')).toEqual([
      { t: '<script>x</script>', m: false },
      { t: 'y', m: true },
    ]);
  });
  it('empty text gives no parts', () => {
    expect(splitHighlight('')).toEqual([]);
  });
});
