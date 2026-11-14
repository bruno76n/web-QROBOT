/**
 * Panel services of Aprende (docs/21 §8, docs/22 §6, §10): save a page, switch it on or off, list
 * the searches without results and rebuild the search index. D1 is written first, in one batch;
 * Meilisearch is updated after it and never undoes a save.
 */

import { eq, inArray } from 'drizzle-orm';
import { faqRecords, pageSearchText, unknownMarks } from '@/lib/learn/import';
import { parseMarkdown } from '@/lib/learn/markdown';
import { fail, ok, type Result } from '@/lib/result';
import type { LearnPageInput } from '@/lib/schemas';
import { dayKey } from '../clicks';
import { getDb, type Db } from '../db/client';
import * as schema from '../db/schema';
import { getEnv } from '../env';
import {
  getLearnIndexState,
  listSearchMisses,
  type LearnIndexState,
  type LearnSearchMiss,
} from '../queries/learn';
import {
  meiliConfig,
  syncLearnIndex,
  updateLearnPageIndex,
  type MeiliConfig,
  type PageIndexOutcome,
} from '../search-index';
import { runBatch } from './context';

/** What the learning services need, injected so tests control the clock and Meilisearch. */
export interface LearnDeps {
  db: Db;
  /** Current time in unix ms. */
  now: () => number;
  /** Where Meilisearch is; `null` when `MEILI_HOST` is empty. */
  meili: MeiliConfig | null;
}

/** Dependencies wired to the real database, clock and Meilisearch settings of the Worker. */
export function realLearnDeps(): LearnDeps {
  return { db: getDb(), now: () => Date.now(), meili: meiliConfig(getEnv()) };
}

/**
 * How the search index took a change: `updated`, `skipped` (no Meilisearch: the search reads D1,
 * which is already up to date) or `failed` (the page is saved; the panel says to sync the index).
 */
export type SearchOutcome = PageIndexOutcome;

/** What a save or a publish switch returns. */
export interface LearnPageSaved {
  id: string;
  slug: string;
  published: boolean;
  /** Unix ms of the write. */
  updatedAt: number;
  search: SearchOutcome;
}

/**
 * Saves a page from the editor (docs/21 §8). Checks, in order: the page exists (`NOT_FOUND`), every
 * `[[mark]]` of the body is known (`UNKNOWN_BLOCK`, `details.marks`), every related slug exists
 * (`UNKNOWN_RELATED`, `details.slugs`) and every source exists (`VALIDATION` on `sources`). Then,
 * in one batch: the page with its converted body, `search_text` and `edited_in_panel = true`, and
 * its questions replaced in order. After the batch, the page is updated in Meilisearch.
 * Slug, topic, kind, audience, order and the rest of what the files decide are left as they are.
 */
export async function saveLearnPage(
  deps: LearnDeps,
  input: LearnPageInput,
): Promise<Result<LearnPageSaved>> {
  const { db } = deps;
  const [current] = await db
    .select({ id: schema.learnPages.id, slug: schema.learnPages.slug })
    .from(schema.learnPages)
    .where(eq(schema.learnPages.id, input.id));
  if (!current) return fail('NOT_FOUND');

  const marks = unknownMarks(input.bodyMd);
  if (marks.length > 0) return fail('UNKNOWN_BLOCK', { marks });

  const related = [...new Set(input.related)];
  const sources = [...new Set(input.sources)];
  const [pages, known] = await db.batch([
    db
      .select({ slug: schema.learnPages.slug })
      .from(schema.learnPages)
      .where(inArray(schema.learnPages.slug, related.length > 0 ? related : ['\u0000'])),
    db
      .select({ id: schema.learnSources.id })
      .from(schema.learnSources)
      .where(inArray(schema.learnSources.id, sources.length > 0 ? sources : ['\u0000'])),
  ]);
  const missingPages = related.filter((s) => !pages.some((p) => p.slug === s));
  if (missingPages.length > 0) return fail('UNKNOWN_RELATED', { slugs: missingPages });
  const missingSources = sources.filter((id) => !known.some((k) => k.id === id));
  if (missingSources.length > 0)
    return fail('VALIDATION', { fields: { sources: ['unknown source'] }, ids: missingSources });

  const parsed = parseMarkdown(input.bodyMd);
  const when = new Date(deps.now());
  const faqs = faqRecords(input.id, input.faqs);
  await runBatch(db, [
    db
      .update(schema.learnPages)
      .set({
        title: input.title,
        subtitle: input.subtitle,
        summary: input.summary,
        bodyMd: input.bodyMd,
        bodyAst: JSON.stringify(parsed.ast),
        toc: JSON.stringify(parsed.toc),
        searchText: pageSearchText(input),
        tags: JSON.stringify(input.tags),
        related: JSON.stringify(related),
        sources: JSON.stringify(sources),
        cta: input.cta,
        ctaText: input.ctaText,
        published: input.published,
        editedInPanel: true,
        updatedAt: when,
      })
      .where(eq(schema.learnPages.id, input.id)),
    db.delete(schema.learnFaqs).where(eq(schema.learnFaqs.pageId, input.id)),
    ...(faqs.length > 0 ? [db.insert(schema.learnFaqs).values(faqs)] : []),
  ]);
  const search = await updateLearnPageIndex(db, deps.meili, input.id);
  return ok({
    id: input.id,
    slug: current.slug,
    published: input.published,
    updatedAt: when.getTime(),
    search,
  });
}

/**
 * Quick publish switch of the list. Only `published` and `updated_at` change: the page does not
 * count as edited in the panel. The page is updated in Meilisearch afterwards, like a save.
 */
export async function setLearnPublished(
  deps: LearnDeps,
  input: { id: string; published: boolean },
): Promise<Result<LearnPageSaved>> {
  const { db } = deps;
  const when = new Date(deps.now());
  const [row] = await db
    .update(schema.learnPages)
    .set({ published: input.published, updatedAt: when })
    .where(eq(schema.learnPages.id, input.id))
    .returning({ slug: schema.learnPages.slug });
  if (!row) return fail('NOT_FOUND');
  const search = await updateLearnPageIndex(db, deps.meili, input.id);
  return ok({
    id: input.id,
    slug: row.slug,
    published: input.published,
    updatedAt: when.getTime(),
    search,
  });
}

/** Searches without results of a window, plus the state of the index, for the panel's search block. */
export interface LearnSearchReport {
  days: number;
  misses: LearnSearchMiss[];
  index: LearnIndexState & {
    /** False without `MEILI_HOST`: the search reads D1 and there is nothing to sync. */
    configured: boolean;
  };
}

/**
 * The searches without results of the last `days` days (today included, in the business time
 * zone), added up and ordered from the most repeated, and the state of the search index.
 */
export async function learnSearchReport(
  deps: LearnDeps,
  days: number,
  timeZone: string,
): Promise<LearnSearchReport> {
  const since = dayKey(new Date(deps.now() - (days - 1) * 86_400_000), timeZone);
  const [misses, state] = await Promise.all([
    listSearchMisses(since, deps.db),
    getLearnIndexState(deps.db),
  ]);
  return { days, misses, index: { ...state, configured: deps.meili !== null } };
}

/** What a full rebuild returns: skipped without Meilisearch, or the documents and the date. */
export type LearnIndexSynced =
  { skipped: true } | { skipped: false; docs: number; syncedAt: string };

/**
 * Rebuilds the whole index from D1 (docs/22 §6). Without `MEILI_HOST` it does nothing and says so;
 * when Meilisearch fails it answers `SEARCH_UNAVAILABLE` and the live index stays as it was.
 */
export async function syncLearnIndexNow(deps: LearnDeps): Promise<Result<LearnIndexSynced>> {
  const r = await syncLearnIndex(deps.db, deps.meili, new Date(deps.now()));
  if (!r.ok) return fail('SEARCH_UNAVAILABLE');
  return ok(r.skipped ? { skipped: true } : { skipped: false, docs: r.docs, syncedAt: r.syncedAt });
}
