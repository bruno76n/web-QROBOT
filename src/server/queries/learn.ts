import { and, asc, eq, inArray, ne, or, sql } from 'drizzle-orm';
import { isLearnTopic, learnTopics, learnTopicName, type LearnTopicId } from '@/config/learn';
import {
  expandSynonyms,
  learnUrl,
  normalizeQuery,
  type FilamentsData,
  type FunFactsData,
  type MaintenanceData,
  type PrintersData,
  type SearchConfig,
} from '@/lib/learn/content';
import type { LearnNode, MarkName } from '@/lib/learn/markdown';
import { getDb, schema, type Db } from '../db/client';

/** Reading Aprende (docs/21 §9). Only published pages ever leave this file. */

export interface LearnTopicLink {
  slug: string;
  title: string;
  topic: string;
}

export interface LearnSource {
  id: string;
  name: string;
  url: string | null;
}

export interface LearnData {
  filamentos?: FilamentsData;
  impresoras?: PrintersData;
  mantenimiento?: MaintenanceData;
}

export interface LearnPageView {
  id: string;
  slug: string;
  kind: (typeof schema.learnKindValues)[number];
  topic: string;
  title: string;
  subtitle: string;
  summary: string;
  ast: LearnNode[];
  toc: { id: string; text: string }[];
  chips: { id: string; label: string }[];
  filters: string[];
  tags: string[];
  audience: string;
  cta: (typeof schema.learnCtaValues)[number];
  ctaText: string;
  /** `YYYY-MM`. */
  reviewed: string;
  updatedAt: Date;
  featured: { label: string; href: string }[];
  suggestions: string[];
  terms: { term: string; en: string | null; definition: string; href?: string }[];
  faqs: { position: number; question: string; answer: string }[];
  related: LearnTopicLink[];
  sources: LearnSource[];
  /** The tables the `[[…]]` marks of the body ask for. */
  data: LearnData;
}

export interface LearnListItem {
  slug: string;
  title: string;
  summary: string;
  filters: string[];
}

type PageRow = typeof schema.learnPages.$inferSelect;

const json = <T>(text: string, fallback: T): T => {
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
};

const dataKeyOfMark: Partial<Record<MarkName, keyof LearnData>> = {
  'tabla:filamentos': 'filamentos',
  'tabla:impresoras': 'impresoras',
  'cabe-mi-pieza': 'impresoras',
  'tabla:mantenimiento': 'mantenimiento',
};

function marksIn(ast: readonly LearnNode[]): Set<keyof LearnData> {
  const keys = new Set<keyof LearnData>();
  for (const n of ast) {
    if (n.t === 'mark') {
      const k = dataKeyOfMark[n.name];
      if (k) keys.add(k);
    } else if (n.t === 'callout' || n.t === 'quote') for (const k of marksIn(n.c)) keys.add(k);
  }
  return keys;
}

/** Everything a page needs besides its own row: questions, related, sources and tables, in ONE batch. */
async function loadPage(db: Db, row: PageRow): Promise<LearnPageView> {
  const ast = json<LearnNode[]>(row.bodyAst, []);
  const relatedSlugs = json<string[]>(row.related, []);
  const sourceIds = json<string[]>(row.sources, []);
  const dataKeys = [...marksIn(ast)];
  const [faqs, related, sources, datasets] = await db.batch([
    db
      .select()
      .from(schema.learnFaqs)
      .where(eq(schema.learnFaqs.pageId, row.id))
      .orderBy(asc(schema.learnFaqs.position)),
    db
      .select({
        slug: schema.learnPages.slug,
        title: schema.learnPages.title,
        topic: schema.learnPages.topic,
      })
      .from(schema.learnPages)
      .where(
        and(
          eq(schema.learnPages.published, true),
          inArray(schema.learnPages.slug, relatedSlugs.length > 0 ? relatedSlugs : ['\u0000']),
        ),
      ),
    db
      .select()
      .from(schema.learnSources)
      .where(inArray(schema.learnSources.id, sourceIds.length > 0 ? sourceIds : ['\u0000'])),
    db
      .select()
      .from(schema.learnDatasets)
      .where(inArray(schema.learnDatasets.key, dataKeys.length > 0 ? dataKeys : ['\u0000'])),
  ]);
  const extra = json<Partial<Pick<LearnPageView, 'featured' | 'suggestions' | 'terms'>>>(
    row.extra,
    {},
  );
  const data: LearnData = {};
  for (const d of datasets) (data as Record<string, unknown>)[d.key] = json(d.data, null);
  return {
    id: row.id,
    slug: row.slug,
    kind: row.kind,
    topic: row.topic,
    title: row.title,
    subtitle: row.subtitle,
    summary: row.summary,
    ast,
    toc: json(row.toc, []),
    chips: json(row.chips, []),
    filters: json(row.filters, []),
    tags: json(row.tags, []),
    audience: row.audience,
    cta: row.cta,
    ctaText: row.ctaText,
    reviewed: row.reviewed,
    updatedAt: row.updatedAt,
    featured: extra.featured ?? [],
    suggestions: extra.suggestions ?? [],
    terms: extra.terms ?? [],
    faqs: faqs.map((f) => ({ position: f.position, question: f.question, answer: f.answer })),
    // Keep the order the page wrote them in.
    related: relatedSlugs
      .map((s) => related.find((r) => r.slug === s))
      .filter((r): r is LearnTopicLink => r !== undefined),
    sources: sourceIds
      .map((id) => sources.find((s) => s.id === id))
      .filter((s): s is LearnSource => s !== undefined),
    data,
  };
}

/** A published page with what it asks for; `null` when it does not exist or is hidden. Two round trips. */
export async function getLearnPage(slug: string, db: Db = getDb()): Promise<LearnPageView | null> {
  const [row] = await db
    .select()
    .from(schema.learnPages)
    .where(and(eq(schema.learnPages.slug, slug), eq(schema.learnPages.published, true)));
  return row ? loadPage(db, row) : null;
}

export interface LearnTopicView {
  page: LearnPageView;
  pages: LearnListItem[];
}

/** A topic page and its published pages in order. `null` for an unknown topic or a hidden page. */
export async function getLearnTopic(
  topic: string,
  db: Db = getDb(),
): Promise<LearnTopicView | null> {
  if (!isLearnTopic(topic) || topic === 'glosario') return null;
  const [pages, list] = await db.batch([
    db
      .select()
      .from(schema.learnPages)
      .where(and(eq(schema.learnPages.slug, topic), eq(schema.learnPages.published, true))),
    db
      .select()
      .from(schema.learnPages)
      .where(
        and(
          eq(schema.learnPages.topic, topic),
          eq(schema.learnPages.published, true),
          ne(schema.learnPages.slug, topic),
        ),
      )
      .orderBy(asc(schema.learnPages.sortOrder), asc(schema.learnPages.title)),
  ]);
  const row = pages[0];
  if (!row) return null;
  return {
    page: await loadPage(db, row),
    pages: list.map((p) => ({
      slug: p.slug,
      title: p.title,
      summary: p.summary,
      filters: json<string[]>(p.filters, []),
    })),
  };
}

export interface LearnHomeView {
  page: LearnPageView;
  topics: { id: LearnTopicId; name: string; blurb: string; count: number }[];
  /** Rows of the filaments table for the "de un vistazo" block, with the levels of heat. */
  glance: { rows: FilamentsData['rows']; heatLevels: FilamentsData['heatLevels'] };
  fact: FunFactsData['rows'][number] | null;
}

export const glanceSlugs = [
  'filamentos/pla',
  'filamentos/petg',
  'filamentos/abs',
  'filamentos/asa',
  'filamentos/tpu',
  'filamentos/pc',
] as const;

/** Day of the year (1–366) in UTC from a date; picks the fact of the day. */
export function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  return Math.floor((date.getTime() - start) / 86_400_000);
}

export async function getLearnHome(
  now: Date = new Date(),
  db: Db = getDb(),
): Promise<LearnHomeView | null> {
  const [pages, counts, datasets] = await db.batch([
    db
      .select()
      .from(schema.learnPages)
      .where(and(eq(schema.learnPages.slug, ''), eq(schema.learnPages.published, true))),
    db
      .select({ topic: schema.learnPages.topic, n: sql<number>`count(*)` })
      .from(schema.learnPages)
      .where(and(eq(schema.learnPages.published, true), ne(schema.learnPages.kind, 'section')))
      .groupBy(schema.learnPages.topic),
    db
      .select()
      .from(schema.learnDatasets)
      .where(inArray(schema.learnDatasets.key, ['filamentos', 'datos-curiosos'])),
  ]);
  const row = pages[0];
  if (!row) return null;
  const counted = new Map(counts.map((c) => [c.topic, Number(c.n)]));
  const filaments = datasets.find((d) => d.key === 'filamentos');
  const facts = datasets.find((d) => d.key === 'datos-curiosos');
  const fil = filaments ? json<FilamentsData | null>(filaments.data, null) : null;
  const factRows = facts ? (json<FunFactsData | null>(facts.data, null)?.rows ?? []) : [];
  return {
    page: await loadPage(db, row),
    topics: learnTopics.map((t) => ({
      id: t.id,
      name: t.name,
      blurb: t.blurb,
      count: counted.get(t.id) ?? 0,
    })),
    glance: {
      rows: (fil?.rows ?? []).filter((r) => (glanceSlugs as readonly string[]).includes(r.slug)),
      heatLevels: fil?.heatLevels ?? [],
    },
    fact: factRows.length > 0 ? (factRows[dayOfYear(now) % factRows.length] ?? null) : null,
  };
}

/** Slug and last change of every published page, for the sitemap. */
export async function listLearnSitemap(
  db: Db = getDb(),
): Promise<{ slug: string; updatedAt: Date }[]> {
  return db
    .select({ slug: schema.learnPages.slug, updatedAt: schema.learnPages.updatedAt })
    .from(schema.learnPages)
    .where(eq(schema.learnPages.published, true))
    .orderBy(asc(schema.learnPages.slug));
}

export interface LearnSearchHit {
  type: 'page';
  url: string;
  topic: string;
  topicLabel: string;
  title: string;
  text: string;
}

export const searchLimit = 8;

const escapeLike = (w: string) => w.replace(/[\\%_]/g, (c) => `\\${c}`);

/**
 * Search without Meilisearch (docs/22 §8): the words and their synonyms, as `LIKE` over the
 * normalized text of each page. A word in the title ranks above one in the tags, above the rest.
 * It does not forgive typos.
 */
export async function searchLearnD1(
  query: string,
  topic: string | undefined,
  db: Db = getDb(),
): Promise<LearnSearchHit[]> {
  const [settings] = await db
    .select()
    .from(schema.learnDatasets)
    .where(eq(schema.learnDatasets.key, 'buscador'));
  const config = json<SearchConfig>(settings?.data ?? '', { synonyms: {}, stopWords: [] });
  const words = expandSynonyms(normalizeQuery(query), config);
  if (words.length === 0) return [];

  const match = or(
    ...words.map(
      (w) => sql`${schema.learnPages.searchText} LIKE ${`%${escapeLike(w)}%`} ESCAPE '\\'`,
    ),
  );
  const rows = await db
    .select()
    .from(schema.learnPages)
    .where(
      and(
        eq(schema.learnPages.published, true),
        ne(schema.learnPages.kind, 'home'),
        topic ? eq(schema.learnPages.topic, topic) : undefined,
        match,
      ),
    );
  const scored = rows.map((r) => {
    const [title = '', tags = '', rest = ''] = r.searchText.split('\n');
    let score = 0;
    for (const w of words)
      score += title.includes(w) ? 3 : tags.includes(w) ? 2 : rest.includes(w) ? 1 : 0;
    return { r, score };
  });
  scored.sort(
    (a, b) =>
      b.score - a.score || a.r.sortOrder - b.r.sortOrder || a.r.title.localeCompare(b.r.title),
  );
  return scored.slice(0, searchLimit).map(({ r }) => ({
    type: 'page' as const,
    url: learnUrl(r.slug),
    topic: r.topic,
    topicLabel: learnTopicName(r.topic),
    title: r.title,
    text: r.summary,
  }));
}
