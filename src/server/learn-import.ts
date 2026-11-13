import { eq, inArray, notInArray } from 'drizzle-orm';
import type { Db } from './db/client';
import * as schema from './db/schema';
import type { FaqRecord, ImportPlan, PageRecord } from '@/lib/learn/import';

/** Writes an import plan into D1 (docs/21 §8). Only src/server/ touches the database. */

export interface ApplyOptions {
  /** Replace pages edited in the panel too. */
  overwrite?: boolean;
  /** Delete the pages that are not in the files. */
  prune?: boolean;
  /** Do nothing when the database already has pages (used by `pnpm dev`). */
  ifEmpty?: boolean;
  now: number;
}

export interface ImportSummary {
  skipped: boolean;
  created: string[];
  updated: string[];
  unchanged: string[];
  /** Edited in the panel: not touched. */
  untouched: string[];
  pruned: string[];
  faqs: number;
  warnings: string[];
}

export interface ExistingPage {
  id: string;
  slug: string;
  editedInPanel: boolean;
  /** Present when the content could be compared (local); absent from a remote listing. */
  record?: PageRecord;
}

const recordKeys = [
  'kind',
  'topic',
  'title',
  'subtitle',
  'summary',
  'bodyMd',
  'bodyAst',
  'toc',
  'searchText',
  'filters',
  'chips',
  'tags',
  'related',
  'sources',
  'extra',
  'audience',
  'cta',
  'ctaText',
  'published',
  'sortOrder',
  'reviewed',
] as const satisfies readonly (keyof PageRecord)[];

function sameContent(a: PageRecord, b: PageRecord): boolean {
  return recordKeys.every((k) => a[k] === b[k]);
}

/** Decides what happens to each page of the plan. Pure. */
export function classify(
  plan: ImportPlan,
  existing: readonly ExistingPage[],
  overwrite: boolean,
): Pick<ImportSummary, 'created' | 'updated' | 'unchanged' | 'untouched'> & {
  /** Page of the plan → id of the row it writes to. */
  writes: { page: PageRecord; id: string; isNew: boolean }[];
} {
  const bySlug = new Map(existing.map((e) => [e.slug, e]));
  const out = {
    created: [] as string[],
    updated: [] as string[],
    unchanged: [] as string[],
    untouched: [] as string[],
    writes: [] as { page: PageRecord; id: string; isNew: boolean }[],
  };
  for (const page of plan.pages) {
    const row = bySlug.get(page.slug);
    if (!row) {
      out.created.push(page.slug);
      out.writes.push({ page, id: page.id, isNew: true });
    } else if (row.editedInPanel && !overwrite) {
      out.untouched.push(page.slug);
    } else if (row.record && sameContent(row.record, page) && !row.editedInPanel) {
      out.unchanged.push(page.slug);
    } else {
      out.updated.push(page.slug);
      out.writes.push({ page, id: row.id, isNew: false });
    }
  }
  return out;
}

const chunk = <T>(list: readonly T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
};

export async function applyImport(
  db: Db,
  plan: ImportPlan,
  opts: ApplyOptions,
): Promise<ImportSummary> {
  const empty: ImportSummary = {
    skipped: false,
    created: [],
    updated: [],
    unchanged: [],
    untouched: [],
    pruned: [],
    faqs: 0,
    warnings: plan.warnings,
  };
  const rows = await db.select().from(schema.learnPages);
  if (opts.ifEmpty && rows.length > 0) return { ...empty, skipped: true };

  const existing: ExistingPage[] = rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    editedInPanel: r.editedInPanel,
    record: Object.fromEntries([
      ['id', r.id],
      ['slug', r.slug],
      ...recordKeys.map((k) => [k, r[k]]),
    ]) as unknown as PageRecord,
  }));
  const verdict = classify(plan, existing, opts.overwrite ?? false);
  const when = new Date(opts.now);

  const statements: Parameters<Db['batch']>[0][number][] = [];
  for (const { page, id, isNew } of verdict.writes) {
    const { id: _id, slug: _slug, ...fields } = page;
    if (isNew) {
      statements.push(
        db.insert(schema.learnPages).values({ ...page, createdAt: when, updatedAt: when }),
      );
    } else {
      statements.push(
        db
          .update(schema.learnPages)
          .set({ ...fields, editedInPanel: false, updatedAt: when })
          .where(eq(schema.learnPages.id, id)),
      );
    }
  }

  // Questions: the ones of every written page are replaced.
  const writtenIds = verdict.writes.map((w) => w.id);
  const idOf = new Map(verdict.writes.map((w) => [w.page.id, w.id]));
  for (const ids of chunk(writtenIds, 90))
    statements.push(db.delete(schema.learnFaqs).where(inArray(schema.learnFaqs.pageId, ids)));
  const faqRows: FaqRecord[] = plan.faqs
    .filter((f) => idOf.has(f.pageId))
    .map((f) => ({ ...f, pageId: idOf.get(f.pageId) ?? f.pageId }));
  for (const part of chunk(faqRows, 15)) statements.push(db.insert(schema.learnFaqs).values(part));

  // Tables, sources and search settings are replaced by the ones of the files.
  for (const d of plan.datasets) {
    statements.push(
      db
        .insert(schema.learnDatasets)
        .values({ key: d.key, data: d.data, updatedAt: when })
        .onConflictDoUpdate({
          target: schema.learnDatasets.key,
          set: { data: d.data, updatedAt: when },
        }),
    );
  }
  statements.push(db.delete(schema.learnSources));
  for (const part of chunk(plan.sources, 30))
    statements.push(db.insert(schema.learnSources).values(part));

  const pruned: string[] = [];
  if (opts.prune) {
    const keep = plan.pages.map((p) => p.slug);
    for (const r of rows) if (!keep.includes(r.slug)) pruned.push(r.slug);
    if (pruned.length > 0)
      statements.push(db.delete(schema.learnPages).where(notInArray(schema.learnPages.slug, keep)));
  }

  if (statements.length > 0)
    await db.batch(statements as [(typeof statements)[number], ...(typeof statements)[number][]]);
  return {
    ...empty,
    created: verdict.created,
    updated: verdict.updated,
    unchanged: verdict.unchanged,
    untouched: verdict.untouched,
    pruned,
    faqs: faqRows.length,
  };
}

// ---- Remote: the same plan as an SQL file for `wrangler d1 execute --remote --file` ----

const q = (v: string | number | boolean | null): string => {
  if (v === null) return 'NULL';
  if (typeof v === 'boolean') return v ? '1' : '0';
  if (typeof v === 'number') return String(v);
  return `'${v.replace(/'/g, "''")}'`;
};

/** SQL of the writes decided by `classify`. Same rules as `applyImport`. */
export function renderImportSql(
  plan: ImportPlan,
  existing: readonly ExistingPage[],
  opts: { overwrite?: boolean; prune?: boolean; now: number },
): { sql: string; summary: ImportSummary } {
  const verdict = classify(plan, existing, opts.overwrite ?? false);
  const out: string[] = [];
  const idOf = new Map<string, string>();
  const t = opts.now;
  const cols = ['id', 'slug', ...recordKeys] as const;
  for (const { page, id, isNew } of verdict.writes) {
    idOf.set(page.id, id);
    if (isNew) {
      const values = cols.map((c) => q(page[c]));
      out.push(
        `INSERT INTO learn_pages (${cols.map(snake).join(', ')}, created_at, updated_at) VALUES (${values.join(', ')}, ${t}, ${t});`,
      );
    } else {
      const set = recordKeys.map((k) => `${snake(k)} = ${q(page[k])}`);
      out.push(
        `UPDATE learn_pages SET ${set.join(', ')}, edited_in_panel = 0, updated_at = ${t} WHERE id = ${q(id)};`,
      );
    }
    out.push(`DELETE FROM learn_faqs WHERE page_id = ${q(id)};`);
  }
  let faqs = 0;
  for (const f of plan.faqs) {
    const pageId = idOf.get(f.pageId);
    if (!pageId) continue;
    faqs++;
    out.push(
      `INSERT INTO learn_faqs (id, page_id, position, question, answer) VALUES (${q(f.id)}, ${q(pageId)}, ${f.position}, ${q(f.question)}, ${q(f.answer)});`,
    );
  }
  for (const d of plan.datasets)
    out.push(
      `INSERT INTO learn_datasets (key, data, updated_at) VALUES (${q(d.key)}, ${q(d.data)}, ${t}) ON CONFLICT(key) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at;`,
    );
  out.push('DELETE FROM learn_sources;');
  for (const s of plan.sources)
    out.push(
      `INSERT INTO learn_sources (id, name, url) VALUES (${q(s.id)}, ${q(s.name)}, ${q(s.url)});`,
    );
  const pruned: string[] = [];
  if (opts.prune) {
    const keep = new Set(plan.pages.map((p) => p.slug));
    for (const e of existing)
      if (!keep.has(e.slug)) {
        pruned.push(e.slug);
        out.push(`DELETE FROM learn_pages WHERE id = ${q(e.id)};`);
      }
  }
  return {
    sql: out.join('\n') + '\n',
    summary: {
      skipped: false,
      created: verdict.created,
      updated: verdict.updated,
      unchanged: verdict.unchanged,
      untouched: verdict.untouched,
      pruned,
      faqs,
      warnings: plan.warnings,
    },
  };
}

function snake(k: string): string {
  return k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}
