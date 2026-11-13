import { parse as parseYaml } from 'yaml';
import {
  datasetSchemas,
  normalizeQuery,
  pageFrontmatter,
  searchConfig,
  sourcesFile,
  type DatasetKey,
  type PageFrontmatter,
} from './content';
import { astLinks, astPlainText, findMarks, isMarkName, parseMarkdown } from './markdown';

/**
 * Turns the files of `content/aprende/` into rows (docs/21 §8). Pure: the script reads the disk and
 * writes the database; this only validates and converts. An error names the file and the field.
 */

/** A file read from disk, not yet validated. */
export interface RawFile {
  /** Path inside `content/aprende/`, e.g. `paginas/filamentos/pla.md`. */
  path: string;
  /** Full text of the file. */
  raw: string;
}

/** Every file of `content/aprende/` the import needs. */
export interface LearnFiles {
  pages: RawFile[];
  datasets: RawFile[];
  sources: RawFile;
  /** Search configuration (synonyms and stop words). */
  search: RawFile;
}

/** Invalid content; the message says the file and, when known, the field. */
export class ImportError extends Error {
  constructor(
    readonly file: string,
    readonly field: string,
    message: string,
  ) {
    super(`${file}${field ? ` › ${field}` : ''}: ${message}`);
    this.name = 'ImportError';
  }
}

/** A page ready to store. Lists and objects are JSON text, as the database keeps them. */
export interface PageRecord {
  id: string;
  slug: string;
  kind: PageFrontmatter['kind'];
  topic: string;
  title: string;
  subtitle: string;
  summary: string;
  bodyMd: string;
  /** JSON of the parsed body. */
  bodyAst: string;
  /** JSON of the table of contents. */
  toc: string;
  /** Normalized title, tags, subtitle, summary and questions, one group per line. */
  searchText: string;
  filters: string;
  chips: string;
  tags: string;
  related: string;
  sources: string;
  /** JSON with the optional `featured`, `suggestions` and `terms` of the page. */
  extra: string;
  audience: PageFrontmatter['audience'];
  cta: PageFrontmatter['cta'];
  ctaText: string;
  published: boolean;
  sortOrder: number;
  /** Month of the last review, `YYYY-MM`. */
  reviewed: string;
}

/** A question of a page; `position` starts at 1. */
export interface FaqRecord {
  id: string;
  pageId: string;
  position: number;
  question: string;
  answer: string;
}

/** What the import writes to the database. */
export interface ImportPlan {
  pages: PageRecord[];
  faqs: FaqRecord[];
  /** Data tables (and the search config under `buscador`) as JSON text. */
  datasets: { key: string; data: string }[];
  sources: { id: string; name: string; url: string | null }[];
  /** Problems that do not stop the import (broken links, unknown sources). */
  warnings: string[];
}

/** Stable id of a page: the same in every database. */
export function pageIdFor(slug: string): string {
  return slug === '' ? 'learn-home' : `learn-${slug.replace(/\//g, '-')}`;
}

/** `paginas/filamentos/pla.md` → `filamentos/pla`; `paginas/index.md` → `''`. */
export function slugFromPath(path: string): string {
  const rel = path.replace(/^paginas\//, '').replace(/\.md$/, '');
  return rel === 'index' ? '' : rel;
}

/** Separates the YAML block between `---` lines from the Markdown body. */
function splitFrontmatter(file: RawFile): { data: unknown; body: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(file.raw);
  if (!m) throw new ImportError(file.path, 'frontmatter', 'falta el bloque --- de arriba');
  try {
    return { data: parseYaml(m[1] ?? ''), body: (m[2] ?? '').replace(/^\s*\n/, '') };
  } catch (e) {
    throw new ImportError(file.path, 'frontmatter', `YAML inválido (${(e as Error).message})`);
  }
}

/** Parses a JSON file or fails with an `ImportError`. */
function parseJson(file: RawFile): unknown {
  try {
    return JSON.parse(file.raw);
  } catch {
    throw new ImportError(file.path, '', 'JSON inválido');
  }
}

/** Raises an `ImportError` for the first issue of a failed schema. */
function zodFail(file: string, issues: { path: PropertyKey[]; message: string }[]): never {
  const first = issues[0];
  throw new ImportError(
    file,
    first ? first.path.map(String).join('.') : '',
    first?.message ?? 'inválido',
  );
}

/** Short name for the query normalizer, used to build `searchText`. */
const norm = normalizeQuery;

/**
 * Validates all files and builds the plan. A broken file, a duplicated slug, an unknown `related`
 * page, source or `[[mark]]` throws `ImportError`; links to missing pages and unknown sources in
 * the data tables only add warnings.
 */
export function buildImportPlan(files: LearnFiles): ImportPlan {
  const warnings: string[] = [];

  // Sources: validated first, since pages and tables refer to their ids.
  const sourcesResult = sourcesFile.safeParse(parseJson(files.sources));
  if (!sourcesResult.success) zodFail(files.sources.path, sourcesResult.error.issues);
  const sources = sourcesResult.data.map((s) => ({ id: s.id, name: s.name, url: s.url ?? null }));
  const sourceIds = new Set(sources.map((s) => s.id));

  // Search config
  const searchResult = searchConfig.safeParse(parseJson(files.search));
  if (!searchResult.success) zodFail(files.search.path, searchResult.error.issues);

  // Pages (first pass: frontmatter, so the second can check the links between them)
  interface Draft {
    file: RawFile;
    slug: string;
    fm: PageFrontmatter;
    body: string;
  }
  const drafts: Draft[] = [];
  const slugs = new Set<string>();
  for (const file of files.pages) {
    const { data, body } = splitFrontmatter(file);
    const r = pageFrontmatter.safeParse(data);
    if (!r.success) zodFail(file.path, r.error.issues);
    const fm = r.data;
    const expected = slugFromPath(file.path);
    if (fm.slug !== expected)
      throw new ImportError(
        file.path,
        'slug',
        `es «${fm.slug}» pero el archivo dice «${expected}»`,
      );
    if (slugs.has(fm.slug)) throw new ImportError(file.path, 'slug', 'repetido');
    slugs.add(fm.slug);
    if (fm.slug === '' ? fm.kind !== 'home' : fm.kind === 'home')
      throw new ImportError(file.path, 'kind', 'solo la portada (slug vacío) es «home»');
    if (fm.slug !== '' && fm.topic === '')
      throw new ImportError(file.path, 'topic', 'falta el tema');
    if (fm.slug !== '' && !fm.slug.startsWith(fm.topic))
      throw new ImportError(
        file.path,
        'topic',
        `«${fm.topic}» no coincide con la ruta «${fm.slug}»`,
      );
    if (fm.slug.split('/')[0] === 'buscar')
      throw new ImportError(file.path, 'slug', 'ningún tema puede llamarse «buscar»');
    drafts.push({ file, slug: fm.slug, fm, body });
  }

  const pages: PageRecord[] = [];
  const faqs: FaqRecord[] = [];
  // Slug of an internal `/aprende` link, or null for any other link.
  const slugOf = (href: string): string | null => {
    const clean = href.split('#')[0]?.split('?')[0] ?? '';
    if (clean === '/aprende') return '';
    return clean.startsWith('/aprende/') ? clean.slice('/aprende/'.length) : null;
  };
  // Warns when an internal link points to a page that does not exist.
  const checkHref = (path: string, where: string, href: string) => {
    const s = slugOf(href);
    if (s !== null && !slugs.has(s)) warnings.push(`${path} › ${where}: la liga ${href} no existe`);
  };

  for (const { file, slug, fm, body } of drafts) {
    for (const rel of fm.related)
      if (!slugs.has(rel)) throw new ImportError(file.path, 'related', `«${rel}» no existe`);
    for (const id of fm.sources)
      if (!sourceIds.has(id))
        throw new ImportError(file.path, 'sources', `la fuente «${id}» no existe`);
    for (const mark of findMarks(body))
      if (!isMarkName(mark))
        throw new ImportError(file.path, 'cuerpo', `la marca [[${mark}]] no se conoce`);

    const parsed = parseMarkdown(body);
    for (const href of astLinks(parsed.ast)) checkHref(file.path, 'cuerpo', href);
    for (const f of fm.featured ?? []) checkHref(file.path, 'featured', f.href);
    for (const t of fm.terms ?? []) if (t.href) checkHref(file.path, 'terms', t.href);

    const id = pageIdFor(slug);
    const faqList = fm.faqs ?? [];
    faqList.forEach((q, i) =>
      faqs.push({ id: `${id}-q${i + 1}`, pageId: id, position: i + 1, question: q.q, answer: q.a }),
    );
    const searchText = [
      norm(fm.title),
      norm(fm.tags.join(' ')),
      norm([fm.subtitle, fm.summary, ...faqList.map((q) => q.q)].join(' ')),
    ].join('\n');
    const extra: Record<string, unknown> = {};
    if (fm.featured) extra.featured = fm.featured;
    if (fm.suggestions) extra.suggestions = fm.suggestions;
    if (fm.terms) extra.terms = fm.terms;

    pages.push({
      id,
      slug,
      kind: fm.kind,
      topic: fm.topic,
      title: fm.title,
      subtitle: fm.subtitle,
      summary: fm.summary,
      bodyMd: body,
      bodyAst: JSON.stringify(parsed.ast),
      toc: JSON.stringify(parsed.toc),
      searchText,
      filters: JSON.stringify(fm.filters),
      chips: JSON.stringify(fm.chips ?? []),
      tags: JSON.stringify(fm.tags),
      related: JSON.stringify(fm.related),
      sources: JSON.stringify(fm.sources),
      extra: JSON.stringify(extra),
      audience: fm.audience,
      cta: fm.cta,
      ctaText: fm.ctaText ?? '',
      published: fm.published,
      sortOrder: fm.order,
      reviewed: fm.reviewed,
    });
  }

  // Data tables: each one is checked against the schema of its key.
  const datasets: ImportPlan['datasets'] = [];
  for (const file of files.datasets) {
    const key = file.path.replace(/^datos\//, '').replace(/\.json$/, '');
    if (!(key in datasetSchemas))
      throw new ImportError(file.path, '', `tabla de datos desconocida «${key}»`);
    const schema = datasetSchemas[key as DatasetKey];
    const r = schema.safeParse(parseJson(file));
    if (!r.success) zodFail(file.path, r.error.issues);
    if (r.data.key !== key) throw new ImportError(file.path, 'key', `debe ser «${key}»`);
    const data = r.data as { rows: { slug?: string; sources?: string[] }[]; sources?: string[] };
    for (const row of data.rows) {
      if (row.slug !== undefined && !slugs.has(row.slug))
        warnings.push(`${file.path} › rows: la página «${row.slug}» no existe`);
      for (const id of [...(row.sources ?? []), ...(data.sources ?? [])])
        if (!sourceIds.has(id)) warnings.push(`${file.path}: la fuente «${id}» no existe`);
    }
    datasets.push({ key, data: JSON.stringify(r.data) });
  }
  datasets.push({ key: 'buscador', data: JSON.stringify(searchResult.data) });

  return { pages, faqs, datasets, sources, warnings };
}

/** Plain text of a stored page body (its JSON AST), for the search index. */
export function bodyTextOf(bodyAst: string): string {
  return astPlainText(JSON.parse(bodyAst));
}
