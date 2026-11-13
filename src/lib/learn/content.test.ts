import { describe, expect, it } from 'vitest';
import {
  expandSynonyms,
  learnUrl,
  normalizeQuery,
  pageFrontmatter,
  printersData,
  sourcesFile,
} from './content';

const page = {
  slug: 'filamentos/pla',
  kind: 'sheet',
  topic: 'filamentos',
  title: 'PLA',
  subtitle: 'El más usado.',
  summary: 'Para figuras.',
  filters: [],
  tags: ['pla'],
  related: ['filamentos/petg'],
  sources: ['bambu-tabla'],
  audience: 'all',
  published: true,
  order: 1,
  reviewed: '2026-11',
  cta: 'whatsapp',
};

describe('pageFrontmatter', () => {
  it('accepts a valid file', () => {
    expect(pageFrontmatter.safeParse(page).success).toBe(true);
  });
  it('accepts the home page (slug and topic empty)', () => {
    expect(pageFrontmatter.safeParse({ ...page, slug: '', topic: '', kind: 'home' }).success).toBe(
      true,
    );
  });
  it('rejects an unknown topic and says which field', () => {
    const r = pageFrontmatter.safeParse({ ...page, topic: 'cocina' });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.path).toEqual(['topic']);
  });
  it('rejects a bad slug, a bad date and a missing field', () => {
    expect(pageFrontmatter.safeParse({ ...page, slug: 'Con Espacios' }).success).toBe(false);
    expect(pageFrontmatter.safeParse({ ...page, reviewed: 'noviembre' }).success).toBe(false);
    const { title: _title, ...noTitle } = page;
    expect(pageFrontmatter.safeParse(noTitle).success).toBe(false);
  });
});

describe('other files', () => {
  it('a source may have no link', () => {
    expect(
      sourcesFile.safeParse([{ id: 'calculo-propio', name: 'Cálculo propio', url: null }]).success,
    ).toBe(true);
  });
  it('a printer needs sizes above zero', () => {
    const base = {
      key: 'impresoras',
      chips: [],
      brands: [],
      toggles: [],
      fitMarginMm: 5,
      notes: [],
    };
    const row = {
      brand: 'A',
      model: 'B',
      widthMm: 0,
      depthMm: 1,
      heightMm: 1,
      liters: 1,
      enclosed: true,
      motion: 'x',
      size: 'y',
      note: '',
      sources: [],
    };
    expect(printersData.safeParse({ ...base, rows: [row] }).success).toBe(false);
    expect(printersData.safeParse({ ...base, rows: [{ ...row, widthMm: 100 }] }).success).toBe(
      true,
    );
  });
});

describe('learnUrl', () => {
  it('home and pages', () => {
    expect(learnUrl('')).toBe('/aprende');
    expect(learnUrl('filamentos/pla')).toBe('/aprende/filamentos/pla');
  });
});

describe('normalizeQuery', () => {
  it('lowercase, no accents, single spaces, 80 characters', () => {
    expect(normalizeQuery('  ¿Cómo   SECAR   el Filamento?  ')).toBe('¿como secar el filamento?');
    expect(normalizeQuery('ñandú')).toBe('nandu');
    expect(normalizeQuery('a'.repeat(120))).toHaveLength(80);
  });
});

describe('expandSynonyms', () => {
  const config = {
    synonyms: { 'se despega': ['adhesion', 'primera capa'], hilos: ['stringing'] },
    stopWords: ['se', 'el', 'de'],
  };
  it('“se despega” adds adhesion and the first layer', () => {
    const r = expandSynonyms('Se despega', config);
    expect(r).toEqual(expect.arrayContaining(['despega', 'adhesion', 'primera capa']));
    expect(r).not.toContain('se');
  });
  it('a word with a synonym adds it; one without stays alone', () => {
    expect(expandSynonyms('hilos', config)).toEqual(['hilos', 'stringing']);
    expect(expandSynonyms('petg', config)).toEqual(['petg']);
  });
  it('an empty search gives nothing', () => {
    expect(expandSynonyms('   ', config)).toEqual([]);
  });
});
