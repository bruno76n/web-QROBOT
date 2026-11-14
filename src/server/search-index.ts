/**
 * The Meilisearch index of Aprende (docs/22 §4–6): where Meilisearch is, the index settings, the
 * documents built from D1 and the full rebuild with no moment of empty index. Uses only the
 * database schema (no Worker runtime), so the terminal scripts can run it against the local D1.
 */
import { Meilisearch } from 'meilisearch';
import { asc } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import type { PrintersData, SearchConfig } from '@/lib/learn/content';
import { bodyTextOf } from '@/lib/learn/import';
import { buildSearchDocs, type SearchDoc } from '@/lib/learn/search-docs';
import * as schema from './db/schema';

/** Any Drizzle client over D1 with this schema: the Worker's or a script's. */
type AnyDb = DrizzleD1Database<typeof schema>;

/** Where Meilisearch is and the keys to use; `null` when `MEILI_HOST` is empty. */
export interface MeiliConfig {
  host: string;
  searchKey: string;
  writeKey: string;
}

export const indexName = 'learn';
export const tempIndexName = 'learn_tmp';
/** Longest wait for Meilisearch before answering from D1 (docs/22 §7.4). */
export const meiliTimeoutMs = 1500;

/** Reads the Meilisearch settings of the Worker's environment. */
export function meiliConfig(env: {
  MEILI_HOST?: string;
  MEILI_SEARCH_KEY?: string;
  MEILI_WRITE_KEY?: string;
}): MeiliConfig | null {
  const host = (env.MEILI_HOST ?? '').trim();
  if (!host) return null;
  return { host, searchKey: env.MEILI_SEARCH_KEY ?? '', writeKey: env.MEILI_WRITE_KEY ?? '' };
}

/** The settings of the index (docs/22 §5), with the synonyms and stop words of `buscador.json`. */
export function indexSettings(config: SearchConfig) {
  return {
    searchableAttributes: ['title', 'tags', 'text', 'body'],
    filterableAttributes: ['topic', 'type', 'audience', 'pageId'],
    sortableAttributes: ['order'],
    displayedAttributes: ['id', 'type', 'title', 'text', 'url', 'topic', 'topicLabel'],
    localizedAttributes: [{ attributePatterns: ['*'], locales: ['spa' as const] }],
    synonyms: config.synonyms,
    stopWords: config.stopWords,
    typoTolerance: { enabled: true, minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 } },
    pagination: { maxTotalHits: 50 },
  };
}

/** The search documents built from what D1 has now (published pages, questions, glossary, printers). */
export async function loadSearchDocs(
  db: AnyDb,
): Promise<{ docs: SearchDoc[]; config: SearchConfig }> {
  const [pages, faqs, datasets] = await db.batch([
    db.select().from(schema.learnPages).orderBy(asc(schema.learnPages.slug)),
    db.select().from(schema.learnFaqs).orderBy(asc(schema.learnFaqs.position)),
    db.select().from(schema.learnDatasets),
  ]);
  const parse = <T>(key: string, fallback: T): T => {
    const row = datasets.find((d) => d.key === key);
    try {
      return row ? (JSON.parse(row.data) as T) : fallback;
    } catch {
      return fallback;
    }
  };
  const docs = buildSearchDocs({
    pages: pages.map((p) => {
      const extra = JSON.parse(p.extra || '{}') as {
        terms?: { term: string; en: string | null; definition: string }[];
      };
      return {
        id: p.id,
        slug: p.slug,
        topic: p.topic,
        title: p.title,
        summary: p.summary,
        bodyText: bodyTextOf(p.bodyAst),
        tags: JSON.parse(p.tags || '[]') as string[],
        audience: p.audience,
        published: p.published,
        sortOrder: p.sortOrder,
        ...(extra.terms ? { terms: extra.terms } : {}),
      };
    }),
    faqs,
    printers: parse<PrintersData | null>('impresoras', null),
  });
  return { docs, config: parse<SearchConfig>('buscador', { synonyms: {}, stopWords: [] }) };
}

export type SyncResult =
  | { ok: true; skipped: true }
  | { ok: true; skipped: false; docs: number; syncedAt: string }
  | { ok: false; code: 'SYNC_FAILED' };

/**
 * Rebuilds the Meilisearch index from D1 with no moment of empty index (docs/22 §6): fills
 * `learn_tmp` with the settings and documents, swaps it with `learn`, deletes the old one, and
 * saves the date and count in `settings`. Without `MEILI_HOST` it does nothing and says so.
 */
export async function syncLearnIndex(
  db: AnyDb,
  meili: MeiliConfig | null,
  now: Date,
): Promise<SyncResult> {
  if (!meili) return { ok: true, skipped: true };
  try {
    const { docs, config } = await loadSearchDocs(db);
    const client = new Meilisearch({ host: meili.host, apiKey: meili.writeKey });
    await client.deleteIndexIfExists(tempIndexName);
    await client.createIndex(tempIndexName, { primaryKey: 'id' }).waitTask();
    // The live index may not exist yet the first time; swapping needs both.
    if (
      !(await client.getIndex(indexName).then(
        () => true,
        () => false,
      ))
    )
      await client.createIndex(indexName, { primaryKey: 'id' }).waitTask();
    const tmp = client.index(tempIndexName);
    await tmp.updateSettings(indexSettings(config)).waitTask();
    if (docs.length > 0) await tmp.addDocuments(docs).waitTask();
    await client.swapIndexes([{ indexes: [indexName, tempIndexName], rename: false }]).waitTask();
    await client.deleteIndex(tempIndexName).waitTask();
    const syncedAt = now.toISOString();
    await db.batch([
      db
        .insert(schema.settings)
        .values({ key: 'learn_index_synced_at', value: syncedAt })
        .onConflictDoUpdate({ target: schema.settings.key, set: { value: syncedAt } }),
      db
        .insert(schema.settings)
        .values({ key: 'learn_index_docs', value: String(docs.length) })
        .onConflictDoUpdate({ target: schema.settings.key, set: { value: String(docs.length) } }),
    ]);
    return { ok: true, skipped: false, docs: docs.length, syncedAt };
  } catch (e) {
    console.error('learn index sync failed', { error: (e as Error).name });
    return { ok: false, code: 'SYNC_FAILED' };
  }
}
