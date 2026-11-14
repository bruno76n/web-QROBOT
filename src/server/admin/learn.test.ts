/**
 * Panel services of Aprende over the local D1 (docs/21 §8, docs/22 §6, §10): admin reads, saving a
 * page with each of its errors, the publish switch, the searches without results and the index,
 * with Meilisearch simulated through `fetch`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { env } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { fixtureFiles } from '../../../tests/fixtures/learn/load';
import { buildImportPlan } from '@/lib/learn/import';
import type { LearnPageInput } from '@/lib/schemas';
import { getDb, schema } from '../db/client';
import { applyImport } from '../learn-import';
import {
  getLearnIndexState,
  getLearnPage,
  getLearnPageForAdmin,
  listLearnPagesForAdmin,
  searchLearnD1,
} from '../queries/learn';
import type { MeiliConfig } from '../search-index';
import {
  learnSearchReport,
  saveLearnPage,
  setLearnPublished,
  syncLearnIndexNow,
  type LearnDeps,
} from './learn';
import { resetAll } from './test-utils';

const db = () => getDb(env.DB);
const NOW = 1_800_000_000_000;
const TZ = 'America/Mexico_City';
const meili: MeiliConfig = { host: 'https://meili.test', searchKey: 's', writeKey: 'w' };
const PLA = 'learn-filamentos-pla';

/** Learning dependencies over the test D1, a fixed clock and the given Meilisearch. */
const deps = (m: MeiliConfig | null = null, now = NOW): LearnDeps => ({
  db: db(),
  now: () => now,
  meili: m,
});

const row = async (id: string) =>
  (await db().select().from(schema.learnPages).where(eq(schema.learnPages.id, id)))[0];
const faqRows = async (pageId: string) =>
  db()
    .select()
    .from(schema.learnFaqs)
    .where(eq(schema.learnFaqs.pageId, pageId))
    .orderBy(schema.learnFaqs.position);

/** The PLA page as the editor would send it; override only what a test cares about. */
function plaInput(overrides: Partial<LearnPageInput> = {}): LearnPageInput {
  return {
    id: PLA,
    title: 'PLA',
    subtitle: 'El más usado.',
    summary: 'Para figuras y decoración.',
    bodyMd: '## Datos\n\nTexto.',
    tags: ['pla'],
    related: ['filamentos/petg'],
    sources: ['bambu-tabla'],
    faqs: [{ q: '¿El PLA es biodegradable?', a: 'Solo en composta industrial.' }],
    published: true,
    cta: 'whatsapp',
    ctaText: '',
    ...overrides,
  };
}

/**
 * A fake Meilisearch: every write is a task that ends with `taskStatus`; a GET of an index that is
 * not `learn` answers 404. Records each call with its body.
 */
function fakeMeili(taskStatus: 'succeeded' | 'failed' = 'succeeded') {
  const calls: { method: string; path: string; body: unknown }[] = [];
  let task = 0;
  const reply = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  const fn = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const u = new URL(
      typeof input === 'string' ? input : input instanceof URL ? input.href : input.url,
    );
    const method = (init?.method ?? 'GET').toUpperCase();
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    calls.push({ method, path: u.pathname, body });
    if (u.pathname.startsWith('/tasks/'))
      return reply(200, {
        uid: Number(u.pathname.split('/')[2]),
        status: taskStatus,
        type: 'x',
        indexUid: 'learn',
      });
    if (method === 'GET' && u.pathname.startsWith('/indexes/'))
      return reply(404, { code: 'index_not_found', message: 'nope' });
    return reply(202, {
      taskUid: ++task,
      indexUid: 'learn',
      status: 'enqueued',
      type: 'x',
      enqueuedAt: new Date().toISOString(),
    });
  });
  vi.stubGlobal('fetch', fn);
  return calls;
}

beforeEach(async () => {
  await resetAll();
  await applyImport(db(), buildImportPlan(fixtureFiles()), { now: NOW - 1000 });
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('listLearnPagesForAdmin', () => {
  it('lists every page, hidden ones too, by slug, with its state', async () => {
    const pages = await listLearnPagesForAdmin(db());
    expect(pages.map((p) => p.slug)).toEqual([
      '',
      'filamentos',
      'filamentos/oculta',
      'filamentos/petg',
      'filamentos/pla',
    ]);
    expect(pages.find((p) => p.slug === 'filamentos/oculta')).toEqual({
      id: 'learn-filamentos-oculta',
      slug: 'filamentos/oculta',
      title: 'Oculta',
      topic: 'filamentos',
      kind: 'article',
      published: false,
      editedInPanel: false,
      updatedAt: NOW - 1000,
    });
  });
});

describe('getLearnPageForAdmin', () => {
  it('gives the editor the Markdown, the lists, the questions and the source options', async () => {
    const page = await getLearnPageForAdmin(PLA, db());
    expect(page).toMatchObject({
      id: PLA,
      slug: 'filamentos/pla',
      kind: 'sheet',
      topic: 'filamentos',
      tags: ['pla', 'acido polilactico'],
      related: ['filamentos/petg'],
      sources: ['bambu-tabla'],
      cta: 'whatsapp',
      reviewed: '2026-11',
      faqs: [
        { q: '¿El PLA es biodegradable?', a: 'Solo en composta industrial.' },
        { q: '¿PLA o PLA+?', a: 'Cada marca le pone ese nombre a su fórmula.' },
      ],
      sourceOptions: [
        { id: 'bambu-tabla', name: 'Bambu Lab · Tabla de materiales', url: expect.any(String) },
      ],
    });
    expect(page?.bodyMd).toContain('## Datos');
  });

  it('reads hidden pages too, and null for an unknown id', async () => {
    expect((await getLearnPageForAdmin('learn-filamentos-oculta', db()))?.published).toBe(false);
    expect(await getLearnPageForAdmin('learn-nope', db())).toBeNull();
  });
});

describe('saveLearnPage', () => {
  it('writes the page, converts the body, rebuilds search_text and marks it edited in the panel', async () => {
    const res = await saveLearnPage(
      deps(),
      plaInput({
        title: 'PLA nuevo',
        bodyMd: '## Temperaturas\n\nImprime a 210 °C.\n\n[[tabla:filamentos]]',
        tags: ['pla', 'almidon'],
        ctaText: 'Pídelo en PLA',
      }),
    );
    expect(res).toEqual({
      ok: true,
      data: {
        id: PLA,
        slug: 'filamentos/pla',
        published: true,
        updatedAt: NOW,
        search: 'skipped',
      },
    });
    const r = await row(PLA);
    expect(r).toMatchObject({
      title: 'PLA nuevo',
      slug: 'filamentos/pla',
      topic: 'filamentos',
      kind: 'sheet',
      ctaText: 'Pídelo en PLA',
      editedInPanel: true,
    });
    expect(r?.updatedAt.getTime()).toBe(NOW);
    expect(JSON.parse(r?.toc ?? '[]')).toEqual([{ id: 'temperaturas', text: 'Temperaturas' }]);
    expect(JSON.parse(r?.bodyAst ?? '[]')).toContainEqual({ t: 'mark', name: 'tabla:filamentos' });
    expect(r?.searchText.split('\n')).toEqual([
      'pla nuevo',
      'pla almidon',
      'el mas usado. para figuras y decoracion. ¿el pla es biodegradable?',
    ]);
    // The public page and the D1 search see the change at once.
    const view = await getLearnPage('filamentos/pla', db());
    expect(view?.title).toBe('PLA nuevo');
    expect(view?.data.filamentos).toBeDefined();
    expect((await searchLearnD1('almidon', undefined, db())).hits[0]?.url).toBe(
      '/aprende/filamentos/pla',
    );
  });

  it('replaces the questions in the order sent', async () => {
    await saveLearnPage(
      deps(),
      plaInput({
        faqs: [
          { q: 'Tercera', a: 'C' },
          { q: 'Primera', a: 'A' },
          { q: 'Segunda', a: 'B' },
        ],
      }),
    );
    expect((await faqRows(PLA)).map((f) => [f.id, f.position, f.question, f.answer])).toEqual([
      [`${PLA}-q1`, 1, 'Tercera', 'C'],
      [`${PLA}-q2`, 2, 'Primera', 'A'],
      [`${PLA}-q3`, 3, 'Segunda', 'B'],
    ]);
    await saveLearnPage(deps(), plaInput({ faqs: [] }));
    expect(await faqRows(PLA)).toEqual([]);
  });

  it('can hide the page and empty its lists; repeated slugs and sources are stored once', async () => {
    const res = await saveLearnPage(
      deps(),
      plaInput({
        published: false,
        related: ['filamentos/petg', 'filamentos/petg'],
        sources: [],
        cta: 'none',
      }),
    );
    expect(res).toMatchObject({ ok: true, data: { published: false } });
    const r = await row(PLA);
    expect(r).toMatchObject({ published: false, cta: 'none', sources: '[]' });
    expect(JSON.parse(r?.related ?? '')).toEqual(['filamentos/petg']);
    expect(await getLearnPage('filamentos/pla', db())).toBeNull();
  });

  it('the importer leaves a page saved in the panel alone', async () => {
    await saveLearnPage(deps(), plaInput({ title: 'Mío' }));
    const r = await applyImport(db(), buildImportPlan(fixtureFiles()), { now: NOW + 1 });
    expect(r.untouched).toEqual(['filamentos/pla']);
    expect((await row(PLA))?.title).toBe('Mío');
  });

  it('NOT_FOUND for an id that does not exist, writing nothing', async () => {
    expect(await saveLearnPage(deps(), plaInput({ id: 'learn-nope' }))).toEqual({
      ok: false,
      code: 'NOT_FOUND',
    });
  });

  it('UNKNOWN_BLOCK names the unknown [[marks]] and writes nothing', async () => {
    const res = await saveLearnPage(
      deps(),
      plaInput({ title: 'X', bodyMd: '[[tabla:filamentos]]\n\n[[tabla:nada]]\n\n[[tabla:nada]]' }),
    );
    expect(res).toEqual({ ok: false, code: 'UNKNOWN_BLOCK', details: { marks: ['tabla:nada'] } });
    expect((await row(PLA))?.title).toBe('PLA');
    expect((await row(PLA))?.editedInPanel).toBe(false);
  });

  it('UNKNOWN_RELATED lists the related slugs that do not exist', async () => {
    const res = await saveLearnPage(
      deps(),
      plaInput({ related: ['filamentos/petg', 'filamentos/nylon', 'maquinas/x'] }),
    );
    expect(res).toEqual({
      ok: false,
      code: 'UNKNOWN_RELATED',
      details: { slugs: ['filamentos/nylon', 'maquinas/x'] },
    });
  });

  it('VALIDATION on sources when a source does not exist', async () => {
    const res = await saveLearnPage(deps(), plaInput({ sources: ['bambu-tabla', 'inventada'] }));
    expect(res).toEqual({
      ok: false,
      code: 'VALIDATION',
      details: { fields: { sources: ['unknown source'] }, ids: ['inventada'] },
    });
  });

  it('with Meilisearch: replaces the documents of that page only, without a swap', async () => {
    const calls = fakeMeili();
    const res = await saveLearnPage(deps(meili), plaInput({ title: 'PLA editado' }));
    expect(res).toMatchObject({ ok: true, data: { search: 'updated' } });
    const del = calls.find((c) => c.path === '/indexes/learn/documents/delete');
    expect(del?.body).toEqual({ filter: `pageId = "${PLA}"` });
    const add = calls.find((c) => c.method === 'POST' && c.path === '/indexes/learn/documents');
    const docs = add?.body as { id: string; pageId: string; title: string }[];
    expect(docs.map((d) => d.id)).toEqual([`p_${PLA}`, `f_${PLA}-q1`]);
    expect(docs.every((d) => d.pageId === PLA)).toBe(true);
    expect(docs[0]?.title).toBe('PLA editado');
    expect(calls.some((c) => c.path.includes('swap'))).toBe(false);
  });

  it('with Meilisearch and a hidden page: only deletes its documents', async () => {
    const calls = fakeMeili();
    await saveLearnPage(deps(meili), plaInput({ published: false }));
    expect(calls.some((c) => c.path === '/indexes/learn/documents/delete')).toBe(true);
    expect(calls.some((c) => c.method === 'POST' && c.path === '/indexes/learn/documents')).toBe(
      false,
    );
  });

  it('when Meilisearch fails the page stays saved and the result says search: failed', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.reject(new TypeError('network down'))),
    );
    const res = await saveLearnPage(deps(meili), plaInput({ title: 'Guardado igual' }));
    expect(res).toMatchObject({ ok: true, data: { search: 'failed' } });
    expect((await row(PLA))?.title).toBe('Guardado igual');
  });

  it('a Meilisearch task that ends failed also gives search: failed', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    fakeMeili('failed');
    const res = await saveLearnPage(deps(meili), plaInput());
    expect(res).toMatchObject({ ok: true, data: { search: 'failed' } });
  });
});

describe('setLearnPublished', () => {
  it('hides and shows a page without marking it edited in the panel', async () => {
    const res = await setLearnPublished(deps(), { id: PLA, published: false });
    expect(res).toEqual({
      ok: true,
      data: {
        id: PLA,
        slug: 'filamentos/pla',
        published: false,
        updatedAt: NOW,
        search: 'skipped',
      },
    });
    expect(await getLearnPage('filamentos/pla', db())).toBeNull();
    expect((await row(PLA))?.editedInPanel).toBe(false);
    await setLearnPublished(deps(), { id: PLA, published: true });
    expect((await getLearnPage('filamentos/pla', db()))?.title).toBe('PLA');
  });

  it('NOT_FOUND for an id that does not exist', async () => {
    expect(await setLearnPublished(deps(), { id: 'learn-nope', published: true })).toEqual({
      ok: false,
      code: 'NOT_FOUND',
    });
  });

  it('with Meilisearch: publishing a hidden page adds its documents', async () => {
    const calls = fakeMeili();
    const res = await setLearnPublished(deps(meili), {
      id: 'learn-filamentos-oculta',
      published: true,
    });
    expect(res).toMatchObject({ ok: true, data: { search: 'updated' } });
    const add = calls.find((c) => c.method === 'POST' && c.path === '/indexes/learn/documents');
    expect((add?.body as { id: string }[]).map((d) => d.id)).toEqual(['p_learn-filamentos-oculta']);
  });
});

describe('learnSearchReport', () => {
  /** Adds a miss row for a day. */
  const miss = (day: string, query: string, count: number) =>
    db().insert(schema.learnSearchMisses).values({ day, query, count });

  it('adds up the misses of the window, most repeated first, and ignores older days', async () => {
    // NOW is 2027-01-15 in Mexico City.
    await miss('2027-01-15', 'nylon', 2);
    await miss('2027-01-10', 'nylon', 3);
    await miss('2027-01-14', 'resina', 5);
    await miss('2026-12-17', 'acetona', 1); // 30th day back: inside
    await miss('2026-12-16', 'acetona', 9); // 31st day back: outside
    await miss('2027-01-15', 'brillo', 1);
    const r = await learnSearchReport(deps(), 30, TZ);
    expect(r.days).toBe(30);
    expect(r.misses).toEqual([
      { query: 'nylon', count: 5 },
      { query: 'resina', count: 5 },
      { query: 'acetona', count: 1 },
      { query: 'brillo', count: 1 },
    ]);
    expect((await learnSearchReport(deps(), 1, TZ)).misses).toEqual([
      { query: 'nylon', count: 2 },
      { query: 'brillo', count: 1 },
    ]);
  });

  it('says whether Meilisearch is configured and what the last sync left', async () => {
    expect((await learnSearchReport(deps(), 30, TZ)).index).toEqual({
      configured: false,
      syncedAt: null,
      docs: null,
    });
    await db()
      .insert(schema.settings)
      .values([
        { key: 'learn_index_synced_at', value: '2027-01-01T00:00:00.000Z' },
        { key: 'learn_index_docs', value: '42' },
      ]);
    expect((await learnSearchReport(deps(meili), 30, TZ)).index).toEqual({
      configured: true,
      syncedAt: '2027-01-01T00:00:00.000Z',
      docs: 42,
    });
  });
});

describe('syncLearnIndexNow', () => {
  it('without Meilisearch it does nothing and says skipped', async () => {
    expect(await syncLearnIndexNow(deps())).toEqual({ ok: true, data: { skipped: true } });
    expect(await getLearnIndexState(db())).toEqual({ syncedAt: null, docs: null });
  });

  it('rebuilds the index and stores the date and the count', async () => {
    const calls = fakeMeili();
    const res = await syncLearnIndexNow(deps(meili));
    const syncedAt = new Date(NOW).toISOString();
    expect(res).toEqual({ ok: true, data: { skipped: false, docs: expect.any(Number), syncedAt } });
    expect(calls.some((c) => c.path === '/swap-indexes')).toBe(true);
    const state = await getLearnIndexState(db());
    expect(state.syncedAt).toBe(syncedAt);
    expect(state.docs).toBe(res.ok && !res.data.skipped ? res.data.docs : -1);
  });

  it('SEARCH_UNAVAILABLE when Meilisearch fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.reject(new TypeError('network down'))),
    );
    expect(await syncLearnIndexNow(deps(meili))).toEqual({
      ok: false,
      code: 'SEARCH_UNAVAILABLE',
    });
  });
});
