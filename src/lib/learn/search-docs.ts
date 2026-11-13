import slugify from '@sindresorhus/slugify';
import { learnTopicName } from '@/config/learn';
import { learnUrl, type PrintersData } from './content';

/** Documents of the Meilisearch index `learn` (docs/22 §4) and the highlight splitter (§7). */

export type SearchDocType = 'page' | 'faq' | 'term' | 'printer';

export interface SearchDoc {
  id: string;
  type: SearchDocType;
  title: string;
  text: string;
  /** Plain text of the body, up to 2,000 characters; only on pages. */
  body: string;
  tags: string[];
  topic: string;
  topicLabel: string;
  audience: string;
  pageId: string;
  url: string;
  order: number;
}

export interface SearchPageRow {
  id: string;
  slug: string;
  topic: string;
  title: string;
  summary: string;
  /** Plain text of the body (`search_text` has more things; this one is only the body). */
  bodyText: string;
  tags: string[];
  audience: string;
  published: boolean;
  sortOrder: number;
  /** Terms of the glossary page (`extra.terms`). */
  terms?: { term: string; en: string | null; definition: string }[];
}

export interface SearchFaqRow {
  id: string;
  pageId: string;
  /** Starts at 1; it is the number of `#pregunta-N`. */
  position: number;
  question: string;
  answer: string;
}

export const bodyMax = 2000;
export const volumeSlug = 'maquinas/volumen-de-impresion';

export function buildSearchDocs(input: {
  pages: readonly SearchPageRow[];
  faqs: readonly SearchFaqRow[];
  printers: Pick<PrintersData, 'rows'> | null;
}): SearchDoc[] {
  const docs: SearchDoc[] = [];
  const visible = new Map(input.pages.filter((p) => p.published).map((p) => [p.id, p]));

  for (const p of visible.values()) {
    docs.push({
      id: `p_${p.id}`,
      type: 'page',
      title: p.title,
      text: p.summary,
      body: p.bodyText.slice(0, bodyMax),
      tags: p.tags,
      topic: p.topic,
      topicLabel: learnTopicName(p.topic),
      audience: p.audience,
      pageId: p.id,
      url: learnUrl(p.slug),
      order: p.sortOrder,
    });
    for (const t of p.terms ?? []) {
      const slug = slugify(t.term, { separator: '-', lowercase: true, decamelize: false });
      docs.push({
        id: `t_${slug}`,
        type: 'term',
        title: t.en ? `${t.term} (${t.en})` : t.term,
        text: t.definition,
        body: '',
        tags: t.en ? [t.en] : [],
        topic: 'glosario',
        topicLabel: learnTopicName('glosario'),
        audience: p.audience,
        pageId: p.id,
        url: `${learnUrl(p.slug)}#${slug}`,
        order: p.sortOrder,
      });
    }
  }

  for (const f of input.faqs) {
    const p = visible.get(f.pageId);
    if (!p) continue;
    docs.push({
      id: `f_${f.id}`,
      type: 'faq',
      title: f.question,
      text: f.answer,
      body: '',
      tags: [],
      topic: p.topic,
      topicLabel: learnTopicName(p.topic),
      audience: p.audience,
      pageId: p.id,
      url: `${learnUrl(p.slug)}#pregunta-${f.position}`,
      order: p.sortOrder,
    });
  }

  const volume = [...visible.values()].find((p) => p.slug === volumeSlug);
  if (volume && input.printers) {
    for (const r of input.printers.rows) {
      const slug = printerSlug(r.brand, r.model);
      docs.push({
        id: `i_${slug}`,
        type: 'printer',
        title: `${r.brand} ${r.model}`,
        text: `${r.widthMm} × ${r.depthMm} × ${r.heightMm} mm · ${r.enclosed ? 'cerrada' : 'abierta'}`,
        body: '',
        tags: [r.brand, r.model],
        topic: 'maquinas',
        topicLabel: learnTopicName('maquinas'),
        audience: 'all',
        pageId: volume.id,
        url: `${learnUrl(volume.slug)}#${slug}`,
        order: volume.sortOrder,
      });
    }
  }
  return docs;
}

export function printerSlug(brand: string, model: string): string {
  return slugify(`${brand} ${model}`, { separator: '-', lowercase: true, decamelize: false });
}

export const markStart = '\u0001';
export const markEnd = '\u0002';

export interface HighlightPart {
  t: string;
  m: boolean;
}

/** `a\u0001b\u0002c` → `[{a}, {b, marked}, {c}]`. Pure text: the page paints it without `innerHTML`. */
export function splitHighlight(text: string): HighlightPart[] {
  const parts: HighlightPart[] = [];
  let marked = false;
  let buffer = '';
  const flush = () => {
    if (buffer !== '') parts.push({ t: buffer, m: marked });
    buffer = '';
  };
  for (const ch of text) {
    if (ch === markStart) {
      flush();
      marked = true;
    } else if (ch === markEnd) {
      flush();
      marked = false;
    } else buffer += ch;
  }
  flush();
  return parts;
}
