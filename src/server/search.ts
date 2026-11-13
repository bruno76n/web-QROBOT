/**
 * Search of Aprende on the server (docs/22): Meilisearch when it is configured, D1 when it is not
 * or does not answer in time, and the count of searches without results (the index itself is in
 * search-index.ts). The browser never talks to Meilisearch: only this file does, with
 * keys that live as Worker secrets (docs/22 §1, §3).
 */
import { Meilisearch } from 'meilisearch';
import { sql } from 'drizzle-orm';
import { normalizeQuery } from '@/lib/learn/content';
import { highlightWords } from '@/lib/learn/fuzzy';
import {
  markEnd,
  markStart,
  splitHighlight,
  type HighlightPart,
  type SearchDoc,
  type SearchDocType,
} from '@/lib/learn/search-docs';
import { getDb, type Db } from './db/client';
import * as schema from './db/schema';
import { searchLearnD1, searchLimit } from './queries/learn';
import { indexName, meiliTimeoutMs, type MeiliConfig } from './search-index';

export { meiliConfig, syncLearnIndex, type MeiliConfig } from './search-index';

/** One result as the browser gets it: highlighting already split into parts (docs/22 §7.5). */
export interface SearchHit {
  type: SearchDocType;
  url: string;
  topic: string;
  topicLabel: string;
  title: HighlightPart[];
  text: HighlightPart[];
}

export interface SearchResult {
  query: string;
  total: number;
  source: 'meili' | 'd1';
  hits: SearchHit[];
}

/** Results from Meilisearch, with its highlight marks turned into parts. Throws on error or timeout. */
async function searchMeili(
  meili: MeiliConfig,
  query: string,
  topic: string | undefined,
): Promise<SearchResult> {
  const client = new Meilisearch({
    host: meili.host,
    apiKey: meili.searchKey,
    timeout: meiliTimeoutMs,
  });
  const res = await client.index<SearchDoc>(indexName).search(query, {
    limit: searchLimit,
    ...(topic ? { filter: `topic = "${topic}"` } : {}),
    attributesToHighlight: ['title', 'text'],
    attributesToCrop: ['text'],
    cropLength: 24,
    highlightPreTag: markStart,
    highlightPostTag: markEnd,
  });
  return {
    query,
    total: res.estimatedTotalHits ?? res.hits.length,
    source: 'meili',
    hits: res.hits.map((h) => {
      const f = (h._formatted ?? h) as Partial<SearchDoc>;
      return {
        type: h.type,
        url: h.url,
        topic: h.topic,
        topicLabel: h.topicLabel,
        title: splitHighlight(String(f.title ?? h.title)),
        text: splitHighlight(String(f.text ?? h.text)),
      };
    }),
  };
}

/** Results from D1 (no Meilisearch, or it failed), highlighted with the same words it searched. */
async function searchD1(db: Db, query: string, topic: string | undefined): Promise<SearchResult> {
  const r = await searchLearnD1(query, topic, db);
  const words = r.words.flatMap((w) => w.split(' '));
  return {
    query,
    total: r.total,
    source: 'd1',
    hits: r.hits.map((h) => ({
      type: h.type,
      url: h.url,
      topic: h.topic,
      topicLabel: h.topicLabel,
      title: highlightWords(h.title, words),
      text: highlightWords(h.text, words),
    })),
  };
}

/**
 * Searches Aprende: Meilisearch when configured, D1 otherwise or when Meilisearch fails or takes
 * longer than 1.5 s. A failure is logged with the length of the search only, never the search itself.
 */
export async function searchLearn(
  query: string,
  topic: string | undefined,
  meili: MeiliConfig | null,
  db: Db = getDb(),
): Promise<SearchResult> {
  if (meili) {
    try {
      return await searchMeili(meili, query, topic);
    } catch (e) {
      console.warn('learn search: meilisearch failed, using D1', {
        length: query.length,
        error: (e as Error).name,
      });
    }
  }
  return searchD1(db, query, topic);
}

/**
 * Adds one to today's count of a search without results (docs/22 §7.6), only for searches of 3
 * characters or more. Stores the normalized search and the day: nothing about the person.
 */
export async function recordSearchMiss(
  query: string,
  day: string,
  db: Db = getDb(),
): Promise<boolean> {
  const q = normalizeQuery(query);
  if (q.length < 3) return false;
  await db
    .insert(schema.learnSearchMisses)
    .values({ day, query: q, count: 1 })
    .onConflictDoUpdate({
      target: [schema.learnSearchMisses.day, schema.learnSearchMisses.query],
      set: { count: sql`${schema.learnSearchMisses.count} + 1` },
    });
  return true;
}
