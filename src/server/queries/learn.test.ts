import { beforeEach, describe, expect, it } from 'vitest';
import { env } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { realFiles } from '../../../tests/fixtures/learn/real';
import { fixtureFiles } from '../../../tests/fixtures/learn/load';
import { buildImportPlan } from '@/lib/learn/import';
import { getDb, schema, type Db } from '../db/client';
import { resetAll } from '../admin/test-utils';
import { applyImport } from '../learn-import';
import {
  dayOfYear,
  getLearnHome,
  getLearnPage,
  getLearnTopic,
  listLearnSitemap,
  searchLearnD1,
} from './learn';

const db = () => getDb(env.DB);
const NOW = 1_800_000_000_000;

/** A Db that counts round trips to D1 (each statement or batch). */
function counting(): { db: Db; trips: () => number } {
  let trips = 0;
  const wrapStatement = (st: D1PreparedStatement): D1PreparedStatement =>
    new Proxy(st, {
      get(target, prop) {
        const value = Reflect.get(target, prop) as unknown;
        if (prop === 'bind')
          return (...args: unknown[]) =>
            wrapStatement((value as (...a: unknown[]) => D1PreparedStatement).apply(target, args));
        if (prop === 'all' || prop === 'run' || prop === 'first' || prop === 'raw')
          return (...args: unknown[]) => {
            trips++;
            return (value as (...a: unknown[]) => unknown).apply(target, args);
          };
        return typeof value === 'function'
          ? (value as (...a: unknown[]) => unknown).bind(target)
          : value;
      },
    });
  const wrapped = new Proxy(env.DB, {
    get(target, prop) {
      const value = Reflect.get(target, prop) as unknown;
      if (prop === 'prepare') return (sql: string) => wrapStatement(target.prepare(sql));
      if (prop === 'batch')
        return (list: D1PreparedStatement[]) => {
          trips++;
          return target.batch(list);
        };
      return typeof value === 'function'
        ? (value as (...a: unknown[]) => unknown).bind(target)
        : value;
    },
  });
  return { db: getDb(wrapped as D1Database), trips: () => trips };
}

beforeEach(async () => {
  await resetAll();
});

describe('with the fixtures', () => {
  beforeEach(async () => {
    await applyImport(db(), buildImportPlan(fixtureFiles()), { now: NOW });
  });

  it('getLearnPage: a published page with questions, related, sources and tables', async () => {
    const page = await getLearnPage('filamentos/pla');
    expect(page).toMatchObject({
      slug: 'filamentos/pla',
      title: 'PLA',
      kind: 'sheet',
      reviewed: '2026-11',
    });
    expect(page?.faqs.map((f) => f.position)).toEqual([1, 2]);
    expect(page?.related).toEqual([
      { slug: 'filamentos/petg', title: 'PETG', topic: 'filamentos' },
    ]);
    expect(page?.sources).toEqual([
      {
        id: 'bambu-tabla',
        name: 'Bambu Lab · Tabla de materiales',
        url: 'https://wiki.bambulab.com/',
      },
    ]);
    expect(page?.toc).toEqual([{ id: 'datos', text: 'Datos' }]);
    expect(page?.data).toEqual({});
  });

  it('a hidden page and a page that does not exist are null', async () => {
    expect(await getLearnPage('filamentos/oculta')).toBeNull();
    expect(await getLearnPage('filamentos/nada')).toBeNull();
    await db()
      .update(schema.learnPages)
      .set({ published: false })
      .where(eq(schema.learnPages.slug, 'filamentos/pla'));
    expect(await getLearnPage('filamentos/pla')).toBeNull();
  });

  it('a related page that is hidden does not show up', async () => {
    await db()
      .update(schema.learnPages)
      .set({ published: false })
      .where(eq(schema.learnPages.slug, 'filamentos/petg'));
    expect((await getLearnPage('filamentos/pla'))?.related).toEqual([]);
  });

  it('a [[tabla:…]] mark brings its data', async () => {
    const topic = await getLearnTopic('filamentos');
    expect(topic?.page.data.filamentos?.rows).toHaveLength(1);
  });

  it('getLearnTopic: its published pages in order, without itself or the hidden ones', async () => {
    const topic = await getLearnTopic('filamentos');
    expect(topic?.pages.map((p) => p.slug)).toEqual(['filamentos/pla', 'filamentos/petg']);
    expect(topic?.pages[0]).toMatchObject({ title: 'PLA', filters: ['decoracion'] });
  });

  it('a topic with no pages gives an empty list; an unknown topic or buscar gives null', async () => {
    await db()
      .update(schema.learnPages)
      .set({ published: false })
      .where(eq(schema.learnPages.topic, 'filamentos'));
    await db()
      .update(schema.learnPages)
      .set({ published: true })
      .where(eq(schema.learnPages.slug, 'filamentos'));
    expect((await getLearnTopic('filamentos'))?.pages).toEqual([]);
    expect(await getLearnTopic('cocina')).toBeNull();
    expect(await getLearnTopic('buscar')).toBeNull();
    expect(await getLearnTopic('glosario')).toBeNull();
  });

  it('getLearnHome: the home page and the count of each topic', async () => {
    const home = await getLearnHome(new Date('2026-11-13T12:00:00Z'));
    expect(home?.page.suggestions).toEqual(['PETG']);
    expect(home?.topics).toHaveLength(11);
    expect(home?.topics.find((t) => t.id === 'filamentos')?.count).toBe(2);
    expect(home?.topics.find((t) => t.id === 'seguridad')?.count).toBe(0);
    expect(home?.glance.rows.map((r) => r.slug)).toEqual(['filamentos/pla']);
    expect(home?.fact).toBeNull();
  });

  it('listLearnSitemap: only published, with their date', async () => {
    const list = await listLearnSitemap();
    expect(list.map((p) => p.slug)).toEqual([
      '',
      'filamentos',
      'filamentos/petg',
      'filamentos/pla',
    ]);
    expect(list[0]?.updatedAt.getTime()).toBe(NOW);
  });

  it('a hidden home page is null', async () => {
    await db()
      .update(schema.learnPages)
      .set({ published: false })
      .where(eq(schema.learnPages.slug, ''));
    expect(await getLearnHome()).toBeNull();
  });
});

describe('with the real content', () => {
  beforeEach(async () => {
    const r = await applyImport(db(), buildImportPlan(realFiles()), { now: NOW });
    expect(r.created).toHaveLength(118);
  });

  it('every published page loads in 3 round trips or fewer', async () => {
    const pages = (await listLearnSitemap()).filter((p) => p.slug !== '');
    expect(pages).toHaveLength(115);
    const worst = { slug: '', trips: 0 };
    for (const { slug } of pages) {
      const c = counting();
      const view = await getLearnPage(slug, c.db);
      expect(view, slug).not.toBeNull();
      if (c.trips() > worst.trips) Object.assign(worst, { slug, trips: c.trips() });
    }
    expect(worst.trips, worst.slug).toBeLessThanOrEqual(3);
  });

  it('the home page, a topic and the glossary also take 3 trips or fewer', async () => {
    for (const run of [
      (d: Db) => getLearnHome(new Date(), d),
      (d: Db) => getLearnTopic('filamentos', d),
      (d: Db) => getLearnPage('glosario', d),
    ]) {
      const c = counting();
      expect(await run(c.db)).not.toBeNull();
      expect(c.trips()).toBeLessThanOrEqual(3);
    }
  });

  it('the 2 pages waiting for the owner are hidden', async () => {
    expect(await getLearnPage('encargar/pago')).toBeNull();
    expect(await getLearnPage('encargar/personajes')).toBeNull();
  });

  it('the home page brings the featured links, 11 topics and the glance at filaments', async () => {
    const home = await getLearnHome(new Date('2026-11-13T12:00:00Z'));
    expect(home?.page.featured).toHaveLength(6);
    expect(home?.topics).toHaveLength(11);
    expect(home?.glance.rows.map((r) => r.slug)).toEqual([
      'filamentos/pla',
      'filamentos/petg',
      'filamentos/abs',
      'filamentos/asa',
      'filamentos/tpu',
      'filamentos/pc',
    ]);
    expect(home?.fact?.text.length).toBeGreaterThan(10);
    // Same day, same fact: the HTML does not change during the day.
    const again = await getLearnHome(new Date('2026-11-13T23:00:00Z'));
    expect(again?.fact).toEqual(home?.fact);
  });

  it('the pages that ask for tables bring their data', async () => {
    expect((await getLearnTopic('filamentos'))?.page.data.filamentos?.rows.length).toBeGreaterThan(
      5,
    );
    const volume = await getLearnPage('maquinas/volumen-de-impresion');
    expect(volume?.data.impresoras?.rows).toHaveLength(30);
    expect(volume?.data.impresoras?.fitMarginMm).toBe(5);
    expect(
      (await getLearnTopic('mantenimiento'))?.page.data.mantenimiento?.rows.length,
    ).toBeGreaterThan(3);
  });

  it('the glossary brings its terms', async () => {
    const glossary = await getLearnPage('glosario');
    expect(glossary?.terms.length).toBeGreaterThan(30);
  });

  it('search: “se despega” finds the first layer through its synonym', async () => {
    const { hits } = await searchLearnD1('se despega', undefined);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.length).toBeLessThanOrEqual(8);
    expect(hits.map((h) => h.url)).toContain('/aprende/problemas/primera-capa');
  });

  it('search: a word in the title ranks first', async () => {
    const { hits } = await searchLearnD1('petg', undefined);
    expect(hits[0]?.url).toBe('/aprende/filamentos/petg');
  });

  it('search: with a topic filter only that topic comes back', async () => {
    const all = (await searchLearnD1('boquilla', undefined)).hits;
    const only = (await searchLearnD1('boquilla', 'mantenimiento')).hits;
    expect(all.some((h) => h.topic !== 'mantenimiento')).toBe(true);
    expect(only.length).toBeGreaterThan(0);
    expect(only.every((h) => h.topic === 'mantenimiento')).toBe(true);
    expect(only[0]).toMatchObject({ topicLabel: 'Mantenimiento' });
  });

  it('search: accents and capitals do not matter; hidden pages and the home never show', async () => {
    const a = await searchLearnD1('TELARAÑA', undefined);
    const b = await searchLearnD1('telarana', undefined);
    expect(a).toEqual(b);
    const { hits } = await searchLearnD1('pago anticipo', undefined);
    expect(hits.map((h) => h.url)).not.toContain('/aprende/encargar/pago');
    expect((await searchLearnD1('aprende', undefined)).hits.map((h) => h.url)).not.toContain(
      '/aprende',
    );
  });

  it('search: nothing, only stop words, or % and _ do not break it', async () => {
    expect((await searchLearnD1('zzzxqj', undefined)).hits).toEqual([]);
    expect((await searchLearnD1('   ', undefined)).hits).toEqual([]);
    expect((await searchLearnD1('de la', undefined)).hits).toEqual([]);
    expect((await searchLearnD1('100%_', undefined)).hits).toEqual([]);
  });

  it('search: a typo still finds the page («petj» → PETG) and says which words to mark', async () => {
    const r = await searchLearnD1('petj', undefined);
    expect(r.hits[0]?.url).toBe('/aprende/filamentos/petg');
    expect(r.words).toContain('petj');
    expect(r.total).toBeGreaterThanOrEqual(r.hits.length);
  });
});

describe('dayOfYear', () => {
  it('counts from 1', () => {
    expect(dayOfYear(new Date('2026-01-01T00:00:00Z'))).toBe(1);
    expect(dayOfYear(new Date('2026-12-31T23:00:00Z'))).toBe(365);
  });
});
