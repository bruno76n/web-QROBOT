/**
 * Search of Aprende on the server (docs/22 §13): the endpoint (happy path with a simulated
 * Meilisearch, Meilisearch down → D1, bad input → 400, rate limit → 429, misses counted without
 * the IP) and `syncLearnIndex` (builds, loads and swaps; without MEILI_HOST it skips).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { env } from 'cloudflare:workers';
import { getDb, schema } from '../../src/server/db/client';
import { resetAll } from '../../src/server/admin/test-utils';
import { applyImport } from '../../src/server/learn-import';
import { buildImportPlan } from '../../src/lib/learn/import';
import { fixtureFiles } from '../fixtures/learn/load';
import {
  recordSearchMiss,
  searchLearn,
  syncLearnIndex,
  type MeiliConfig,
} from '../../src/server/search';
import { GET } from '../../src/pages/api/aprende/buscar';

const db = () => getDb(env.DB);
const meili: MeiliConfig = { host: 'https://meili.test', searchKey: 's', writeKey: 'w' };
const mutableEnv = env as unknown as Record<string, unknown>;

/** Calls the endpoint as Astro would, with a query string. */
async function call(qs: string, headers: Record<string, string> = {}) {
  const url = new URL(`https://quickrobot.test/api/aprende/buscar?${qs}`);
  const request = new Request(url, { headers });
  const res = await (GET as unknown as (c: object) => Promise<Response>)({
    request,
    url,
    clientAddress: '203.0.113.9',
    locals: {},
  });
  return { status: res.status, body: (await res.json()) as Record<string, unknown>, res };
}

/** A tiny fake Meilisearch: answers searches and task-based writes, and records each call. */
function fakeMeili(search: (body: Record<string, unknown>) => unknown) {
  const calls: { method: string; path: string; body: unknown }[] = [];
  let task = 0;
  const reply = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  const enqueued = () =>
    reply(202, {
      taskUid: ++task,
      indexUid: 'x',
      status: 'enqueued',
      type: 'x',
      enqueuedAt: new Date().toISOString(),
    });
  const fn = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const u = new URL(
      typeof input === 'string' ? input : input instanceof URL ? input.href : input.url,
    );
    const method = (init?.method ?? 'GET').toUpperCase();
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    calls.push({ method, path: u.pathname, body });
    if (u.pathname.endsWith('/search')) return reply(200, search(body as Record<string, unknown>));
    if (u.pathname.startsWith('/tasks/'))
      return reply(200, {
        uid: Number(u.pathname.split('/')[2]),
        status: 'succeeded',
        type: 'x',
        indexUid: 'x',
      });
    if (method === 'GET' && u.pathname === '/indexes/learn')
      return reply(404, { code: 'index_not_found', message: 'nope' });
    return enqueued();
  });
  return { fn, calls };
}

beforeEach(async () => {
  await resetAll();
  await applyImport(db(), buildImportPlan(fixtureFiles()), { now: 1_800_000_000_000 });
});
afterEach(() => {
  vi.unstubAllGlobals();
  delete mutableEnv.SEARCH_LIMITER;
  delete mutableEnv.MEILI_HOST;
});

describe('searchLearn', () => {
  it('without Meilisearch it answers from D1, with the searched words marked', async () => {
    const r = await searchLearn('petg', undefined, null, db());
    expect(r.source).toBe('d1');
    expect(r.hits[0]).toMatchObject({ url: '/aprende/filamentos/petg', topicLabel: 'Filamentos' });
    expect(r.hits[0]?.title).toEqual([{ t: 'PETG', m: true }]);
  });

  it('with Meilisearch: its results, the marks split into parts and the topic filter', async () => {
    const fake = fakeMeili(() => ({
      hits: [
        {
          type: 'page',
          url: '/aprende/filamentos/petg',
          topic: 'filamentos',
          topicLabel: 'Filamentos',
          title: 'PETG',
          text: 'Aguanta más golpes.',
          _formatted: { title: '\u0001PETG\u0002', text: 'Aguanta más golpes.' },
        },
      ],
      estimatedTotalHits: 1,
    }));
    vi.stubGlobal('fetch', fake.fn);
    const r = await searchLearn('petj', 'filamentos', meili, db());
    expect(r).toMatchObject({ source: 'meili', total: 1 });
    expect(r.hits[0]?.title).toEqual([{ t: 'PETG', m: true }]);
    const search = fake.calls.find((c) => c.path === '/indexes/learn/search');
    expect(search?.body).toMatchObject({
      q: 'petj',
      limit: 8,
      filter: 'topic = "filamentos"',
      cropLength: 24,
    });
  });

  it('when Meilisearch fails it answers from D1', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('down');
      }),
    );
    const r = await searchLearn('petg', undefined, meili, db());
    expect(r.source).toBe('d1');
    expect(r.hits.length).toBeGreaterThan(0);
  });

  it('a text with <script> comes back as text parts', async () => {
    vi.stubGlobal(
      'fetch',
      fakeMeili(() => ({
        hits: [
          {
            type: 'page',
            url: '/aprende/x',
            topic: 'filamentos',
            topicLabel: 'Filamentos',
            title: 'x',
            text: 'y',
            _formatted: { title: '<script>alert(1)</script>', text: 'y' },
          },
        ],
        estimatedTotalHits: 1,
      })).fn,
    );
    const r = await searchLearn('x', undefined, meili, db());
    expect(r.hits[0]?.title).toEqual([{ t: '<script>alert(1)</script>', m: false }]);
  });
});

describe('GET /api/aprende/buscar', () => {
  it('answers JSON with the results and caches it a minute', async () => {
    const { status, body, res } = await call('q=petg');
    expect(status).toBe(200);
    expect(body).toMatchObject({ query: 'petg', source: 'd1' });
    expect(res.headers.get('cache-control')).toBe('public, max-age=60');
  });

  it('empty q, 81 characters or an unknown topic → 400 with a code only', async () => {
    for (const qs of ['q=', 'q=%20%20', `q=${'a'.repeat(81)}`, 'q=pla&tema=cocina']) {
      const { status, body } = await call(qs);
      expect(status, qs).toBe(400);
      expect(body).toEqual({ ok: false, code: 'BAD_INPUT' });
    }
    expect((await call(`q=${'a'.repeat(80)}`)).status).toBe(200);
    expect((await call('q=pla&tema=filamentos')).status).toBe(200);
  });

  it('a search without results is counted for the day, normalized and without the IP', async () => {
    await call('q=Boquilla%20Rara', { 'cf-connecting-ip': '198.51.100.7' });
    await call('q=boquilla%20rara');
    await call('q=zz'); // under 3 characters: not counted
    const rows = await db().select().from(schema.learnSearchMisses);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ query: 'boquilla rara', count: 2 });
    expect(Object.keys(rows[0] ?? {}).sort()).toEqual(['count', 'day', 'query']);
    expect(JSON.stringify(rows)).not.toContain('198.51.100.7');
  });

  it('a search with results is not counted', async () => {
    await call('q=petg');
    expect(await db().select().from(schema.learnSearchMisses)).toEqual([]);
  });

  it('429 when the limiter says no, keyed by the IP', async () => {
    const limit = vi.fn(async () => ({ success: false }));
    mutableEnv.SEARCH_LIMITER = { limit };
    const { status, body } = await call('q=petg', { 'cf-connecting-ip': '198.51.100.7' });
    expect(status).toBe(429);
    expect(body).toEqual({ ok: false, code: 'RATE_LIMITED' });
    expect(limit).toHaveBeenCalledWith({ key: '198.51.100.7' });
  });
});

describe('recordSearchMiss', () => {
  it('adds up per day', async () => {
    expect(await recordSearchMiss('xyz', '2026-11-13', db())).toBe(true);
    await recordSearchMiss('XYZ', '2026-11-13', db());
    await recordSearchMiss('xyz', '2026-11-14', db());
    const rows = await db().select().from(schema.learnSearchMisses);
    expect(rows.map((r) => [r.day, r.count])).toEqual([
      ['2026-11-13', 2],
      ['2026-11-14', 1],
    ]);
  });
});

describe('syncLearnIndex', () => {
  it('without MEILI_HOST it does nothing and says so', async () => {
    expect(await syncLearnIndex(db(), null, new Date())).toEqual({ ok: true, skipped: true });
  });

  it('fills learn_tmp, swaps it with learn, deletes the old one and saves date and count', async () => {
    const fake = fakeMeili(() => ({ hits: [] }));
    vi.stubGlobal('fetch', fake.fn);
    const r = await syncLearnIndex(db(), meili, new Date('2026-11-13T12:00:00Z'));
    expect(r).toMatchObject({ ok: true, skipped: false, syncedAt: '2026-11-13T12:00:00.000Z' });
    const steps = fake.calls
      .filter((c) => !c.path.startsWith('/tasks/'))
      .map((c) => `${c.method} ${c.path}`);
    expect(steps).toEqual([
      'DELETE /indexes/learn_tmp',
      'POST /indexes',
      'GET /indexes/learn',
      'POST /indexes',
      'PATCH /indexes/learn_tmp/settings',
      'POST /indexes/learn_tmp/documents',
      'POST /swap-indexes',
      'DELETE /indexes/learn_tmp',
    ]);
    const docs = fake.calls.find((c) => c.path === '/indexes/learn_tmp/documents')?.body as {
      id: string;
    }[];
    // 4 published pages + 2 questions; the hidden page does not get in.
    expect(docs.map((d) => d.id).sort()).toEqual(
      [
        'f_learn-filamentos-pla-q1',
        'f_learn-filamentos-pla-q2',
        'p_learn-filamentos',
        'p_learn-filamentos-petg',
        'p_learn-filamentos-pla',
        'p_learn-home',
      ].sort(),
    );
    const settings = await db().select().from(schema.settings);
    expect(Object.fromEntries(settings.map((s) => [s.key, s.value]))).toMatchObject({
      learn_index_synced_at: '2026-11-13T12:00:00.000Z',
      learn_index_docs: '6',
    });
  });

  it('a Meilisearch error is a SYNC_FAILED, not an exception', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('down');
      }),
    );
    expect(await syncLearnIndex(db(), meili, new Date())).toEqual({
      ok: false,
      code: 'SYNC_FAILED',
    });
  });
});
