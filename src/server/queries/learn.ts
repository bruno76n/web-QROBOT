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
import { wordMatches, words as fuzzyWords } from '@/lib/learn/fuzzy';
import { getDb, schema, type Db } from '../db/client';

/** Reading Aprende (docs/21 §9). Only published pages ever leave this file. */

/** Link to a related page. */
export interface LearnTopicLink {
  slug: string;
  title: string;
  topic: string;
}

/** A cited source. */
export interface LearnSource {
  id: string;
  name: string;
  url: string | null;
}

/** Data tables a page may need, loaded only when its body places the matching mark. */
export interface LearnData {
  filamentos?: FilamentsData;
  impresoras?: PrintersData;
  mantenimiento?: MaintenanceData;
}

/** A published page with everything it renders, already parsed from the JSON columns. */
export interface LearnPageView {
  id: string;
  slug: string;
  kind: (typeof schema.learnKindValues)[number];
  topic: string;
  title: string;
  subtitle: string;
  summary: string;
  /** Body as a block tree. */
  ast: LearnNode[];
  /** The `h2` of the body. */
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
  /** Highlighted links (home and topic pages). */
  featured: { label: string; href: string }[];
  /** Example searches. */
  suggestions: string[];
  /** Glossary entries (glossary page). */
  terms: { term: string; en: string | null; definition: string; href?: string }[];
  /** Questions in order; `position` is the number of `#pregunta-N`. */
  faqs: { position: number; question: string; answer: string }[];
  /** Published related pages, in the order the page lists them. */
  related: LearnTopicLink[];
  sources: LearnSource[];
  /** The tables the `[[…]]` marks of the body ask for. */
  data: LearnData;
}

/** A page in a topic's list. */
export interface LearnListItem {
  slug: string;
  title: string;
  summary: string;
  filters: string[];
}

/** A row of `learn_pages`. */
type PageRow = typeof schema.learnPages.$inferSelect;

/** Parses a JSON column, returning `fallback` when it is not valid. */
const json = <T>(text: string, fallback: T): T => {
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
};

/** Which data table each interactive mark needs. */
const dataKeyOfMark: Partial<Record<MarkName, keyof LearnData>> = {
  'tabla:filamentos': 'filamentos',
  'tabla:impresoras': 'impresoras',
  'cabe-mi-pieza': 'impresoras',
  'tabla:mantenimiento': 'mantenimiento',
};

/** Data tables needed by the marks of a body, including those inside callouts and quotes. */
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

/**
 * Everything a page needs besides its own row: questions, related, sources and tables, in ONE batch.
 * Empty lists are replaced by a value that matches nothing so the `IN (...)` stays valid.
 */
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

/** A topic page plus the published pages listed under it. */
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

/** The learning home: its page, the topics with page counts, a glance at filaments and a fact. */
export interface LearnHomeView {
  page: LearnPageView;
  /** `count` excludes the topic's own section page. */
  /** Topics in order with their published answers (the glossary: its terms). */
  topics: { id: LearnTopicId; name: string; blurb: string; count: number }[];
  /** Rows of the filaments table for the "de un vistazo" block, with the levels of heat. */
  glance: { rows: FilamentsData['rows']; heatLevels: FilamentsData['heatLevels'] };
  /** Fact of the day; null when there are none. */
  fact: FunFactsData['rows'][number] | null;
}

/** Filament pages whose rows appear in the home's glance table. */
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

/** The learning home, or null when it is not published. `now` picks the fact of the day. */
export async function getLearnHome(
  now: Date = new Date(),
  db: Db = getDb(),
): Promise<LearnHomeView | null> {
  const [pages, counts, datasets, glossary] = await db.batch([
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
    db
      .select({ extra: schema.learnPages.extra })
      .from(schema.learnPages)
      .where(and(eq(schema.learnPages.slug, 'glosario'), eq(schema.learnPages.published, true))),
  ]);
  const row = pages[0];
  if (!row) return null;
  const counted = new Map(counts.map((c) => [c.topic, Number(c.n)]));
  // The glossary counts its terms, not its pages.
  const terms = json<{ terms?: unknown[] }>(glossary[0]?.extra ?? '{}', {}).terms;
  if (terms) counted.set('glosario', terms.length);
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

/** One search result. */
export interface LearnSearchHit {
  type: 'page';
  url: string;
  topic: string;
  topicLabel: string;
  title: string;
  text: string;
}

export interface LearnD1Search {
  hits: LearnSearchHit[];
  /** How many pages matched, before the limit. */
  total: number;
  /** The words looked for (query without stop words, plus synonyms), for highlighting. */
  words: string[];
}

/** Maximum results of a search. */
export const searchLimit = 8;

type PageRowLite = Pick<
  PageRow,
  'slug' | 'topic' | 'title' | 'summary' | 'searchText' | 'sortOrder' | 'kind'
>;

/** A word in the title scores 3, in the tags 2 and in the rest 1 (`search_text` has those three lines). */
function score(
  row: PageRowLite,
  words: readonly string[],
  match: (w: string, line: string) => boolean,
): number {
  const [title = '', tags = '', rest = ''] = row.searchText.split('\n');
  let total = 0;
  for (const w of words) total += match(w, title) ? 3 : match(w, tags) ? 2 : match(w, rest) ? 1 : 0;
  return total;
}

/**
 * Search without Meilisearch (docs/22 §8). First the words and their synonyms, looked for inside the
 * normalized text of each published page. When that finds nothing, the same words are compared
 * with typo tolerance (src/lib/learn/fuzzy.ts) against the titles and tags of every published page,
 * so «petj» still finds PETG. A word in the title ranks above one in the tags, above the rest;
 * ties go by `sort_order`. Returns at most 8 pages.
 */
export async function searchLearnD1(
  query: string,
  topic: string | undefined,
  db: Db = getDb(),
): Promise<LearnD1Search> {
  const [settings] = await db
    .select()
    .from(schema.learnDatasets)
    .where(eq(schema.learnDatasets.key, 'buscador'));
  const config = json<SearchConfig>(settings?.data ?? '', { synonyms: {}, stopWords: [] });
  const words = expandSynonyms(normalizeQuery(query), config);
  if (words.length === 0) return { hits: [], total: 0, words };

  const base = and(
    eq(schema.learnPages.published, true),
    ne(schema.learnPages.kind, 'home'),
    topic ? eq(schema.learnPages.topic, topic) : undefined,
  );
  // A page matches when its search text contains any of the words. `instr` takes the word as is:
  // no wildcards to escape and no length limit (D1 caps `LIKE` patterns at 50 bytes).
  const contains = or(...words.map((w) => sql`instr(${schema.learnPages.searchText}, ${w}) > 0`));
  let rows: PageRowLite[] = await db.select().from(schema.learnPages).where(and(base, contains));
  let scored = rows.map((r) => ({ r, s: score(r, words, (w, line) => line.includes(w)) }));

  if (scored.length === 0) {
    // Typo-tolerant pass: only titles and tags, word by word.
    const typed = words.flatMap((w) => w.split(' ')).filter((w) => w.length >= 4);
    if (typed.length > 0) {
      rows = await db.select().from(schema.learnPages).where(base);
      const near = (w: string, line: string) => fuzzyWords(line).some((x) => wordMatches(w, x));
      scored = rows
        .map((r) => {
          const [title = '', tags = ''] = r.searchText.split('\n');
          const lines = `${title}\n${tags}\n`;
          return { r, s: score({ ...r, searchText: lines }, typed, near) };
        })
        .filter((x) => x.s > 0);
      words.push(...typed.filter((w) => !words.includes(w)));
    }
  }

  scored.sort(
    (a, b) => b.s - a.s || a.r.sortOrder - b.r.sortOrder || a.r.title.localeCompare(b.r.title),
  );
  return {
    total: scored.length,
    words,
    hits: scored.slice(0, searchLimit).map(({ r }) => ({
      type: 'page' as const,
      url: learnUrl(r.slug),
      topic: r.topic,
      topicLabel: learnTopicName(r.topic),
      title: r.title,
      text: r.summary,
    })),
  };
}
