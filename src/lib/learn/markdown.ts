import { fromMarkdown } from 'mdast-util-from-markdown';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { gfm } from 'micromark-extension-gfm';
import slugify from '@sindresorhus/slugify';
import type { PhrasingContent, RootContent } from 'mdast';

/**
 * Markdown → a tree of our own, through an allow-list (docs/21 §5). The page is rendered from this
 * tree with components: there is no `set:html` anywhere. Runs when importing or saving a page,
 * never on a visit.
 */

export type MarkName =
  | 'tabla:filamentos'
  | 'tabla:impresoras'
  | 'tabla:mantenimiento'
  | 'cabe-mi-pieza'
  | 'calculadora-costo';

export const markNames: readonly MarkName[] = [
  'tabla:filamentos',
  'tabla:impresoras',
  'tabla:mantenimiento',
  'cabe-mi-pieza',
  'calculadora-costo',
];

export type CalloutKind = 'fact' | 'tip' | 'careful';

export type InlineNode =
  | { t: 'text'; v: string }
  | { t: 'strong'; c: InlineNode[] }
  | { t: 'em'; c: InlineNode[] }
  | { t: 'code'; v: string }
  | { t: 'a'; href: string; external: boolean; c: InlineNode[] };

export type LearnNode =
  | { t: 'h'; level: 2 | 3; id: string; c: InlineNode[] }
  | { t: 'p'; c: InlineNode[] }
  | { t: 'ul' | 'ol'; items: LearnNode[][] }
  | { t: 'table'; head: InlineNode[][]; rows: InlineNode[][][] }
  | { t: 'pre'; v: string }
  | { t: 'callout'; kind: CalloutKind; c: LearnNode[] }
  | { t: 'quote'; c: LearnNode[] }
  | { t: 'mark'; name: MarkName };

export interface ParsedMarkdown {
  ast: LearnNode[];
  /** The `h2` of the body, for "En esta página". */
  toc: { id: string; text: string }[];
  /** Plain text for the search (docs/22 §4). */
  text: string;
}

const calloutLabels: Record<string, CalloutKind> = {
  'dato curioso': 'fact',
  truco: 'tip',
  cuidado: 'careful',
};

/** Which links may be a link (docs/21 §5). `https://` ones are external. */
export function linkKind(href: string): 'internal' | 'external' | null {
  const h = href.trim();
  if (h.startsWith('https://')) return 'external';
  if (h.startsWith('#')) return 'internal';
  if (h === '/aprende' || h.startsWith('/aprende/') || h.startsWith('/aprende#')) return 'internal';
  if (h === '/catalogo' || h.startsWith('/catalogo/') || h.startsWith('/catalogo#'))
    return 'internal';
  if (h.startsWith('/producto/')) return 'internal';
  return null;
}

function inlineOf(nodes: PhrasingContent[]): InlineNode[] {
  const out: InlineNode[] = [];
  const push = (n: InlineNode) => {
    const last = out[out.length - 1];
    if (n.t === 'text' && last?.t === 'text') last.v += n.v;
    else out.push(n);
  };
  for (const n of nodes) {
    switch (n.type) {
      case 'text':
        push({ t: 'text', v: n.value });
        break;
      case 'strong':
        out.push({ t: 'strong', c: inlineOf(n.children) });
        break;
      case 'emphasis':
        out.push({ t: 'em', c: inlineOf(n.children) });
        break;
      case 'delete':
        for (const c of inlineOf(n.children)) push(c);
        break;
      case 'inlineCode':
        out.push({ t: 'code', v: n.value });
        break;
      case 'break':
        push({ t: 'text', v: ' ' });
        break;
      case 'html':
        push({ t: 'text', v: n.value }); // HTML stays as text
        break;
      case 'link': {
        const kind = linkKind(n.url);
        const children = inlineOf(n.children);
        if (kind === null) for (const c of children) push(c);
        else out.push({ t: 'a', href: n.url.trim(), external: kind === 'external', c: children });
        break;
      }
      default:
        break; // images, references, footnotes: dropped
    }
  }
  return out;
}

export function inlineText(nodes: readonly InlineNode[]): string {
  return nodes.map((n) => (n.t === 'text' || n.t === 'code' ? n.v : inlineText(n.c))).join('');
}

export function plainOf(nodes: readonly LearnNode[]): string[] {
  const parts: string[] = [];
  for (const n of nodes) {
    switch (n.t) {
      case 'h':
      case 'p':
        parts.push(inlineText(n.c));
        break;
      case 'ul':
      case 'ol':
        for (const item of n.items) parts.push(...plainOf(item));
        break;
      case 'table':
        for (const row of [n.head, ...n.rows]) parts.push(row.map(inlineText).join(' '));
        break;
      case 'pre':
        parts.push(n.v);
        break;
      case 'callout':
      case 'quote':
        parts.push(...plainOf(n.c));
        break;
      case 'mark':
        break;
    }
  }
  return parts;
}

const markPattern = /^\[\[([a-z:-]+)\]\]$/;

/** The `[[…]]` marks written in a body, one per paragraph, known or not (docs/21 §5, §8). */
export function findMarks(markdown: string): string[] {
  const found: string[] = [];
  for (const m of markdown.matchAll(/^\s*\[\[([^\]\n]*)\]\]\s*$/gm)) found.push(m[1] ?? '');
  return found;
}

export function isMarkName(name: string): name is MarkName {
  return (markNames as readonly string[]).includes(name);
}

export function parseMarkdown(markdown: string): ParsedMarkdown {
  const root = fromMarkdown(markdown, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });
  const usedIds = new Map<string, number>();
  const toc: ParsedMarkdown['toc'] = [];

  const uniqueId = (text: string): string => {
    const base = slugify(text, { separator: '-', lowercase: true, decamelize: false }) || 'seccion';
    const n = (usedIds.get(base) ?? 0) + 1;
    usedIds.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  };

  const blocks = (nodes: RootContent[]): LearnNode[] => {
    const out: LearnNode[] = [];
    for (const n of nodes) {
      switch (n.type) {
        case 'heading': {
          const c = inlineOf(n.children);
          const level = n.depth <= 2 ? 2 : 3;
          const id = uniqueId(inlineText(c));
          if (level === 2) toc.push({ id, text: inlineText(c) });
          out.push({ t: 'h', level, id, c });
          break;
        }
        case 'paragraph': {
          const only = n.children.length > 0 && n.children.every((c) => c.type === 'text');
          if (only) {
            const raw = n.children.map((c) => (c.type === 'text' ? c.value : '')).join('');
            const m = markPattern.exec(raw.trim());
            if (m && m[1] && isMarkName(m[1])) {
              out.push({ t: 'mark', name: m[1] });
              break;
            }
          }
          out.push({ t: 'p', c: inlineOf(n.children) });
          break;
        }
        case 'list':
          out.push({
            t: n.ordered ? 'ol' : 'ul',
            items: n.children.map((item) => blocks(item.children)),
          });
          break;
        case 'table': {
          const [head, ...rows] = n.children;
          if (!head) break;
          const cells = (row: typeof head) => row.children.map((cell) => inlineOf(cell.children));
          out.push({ t: 'table', head: cells(head), rows: rows.map(cells) });
          break;
        }
        case 'code':
          out.push({ t: 'pre', v: n.value });
          break;
        case 'blockquote': {
          const inner = blocks(n.children);
          out.push(toCallout(inner));
          break;
        }
        case 'html':
          out.push({ t: 'p', c: [{ t: 'text', v: n.value }] }); // HTML stays as text
          break;
        default:
          break; // rules, definitions, footnotes: dropped
      }
    }
    return out;
  };

  const ast = blocks(root.children);
  const text = plainOf(ast).join(' ').replace(/\s+/g, ' ').trim();
  return { ast, toc, text };
}

/** `> **Dato curioso.** …` becomes a callout; any other quote stays a quote. */
function toCallout(inner: LearnNode[]): LearnNode {
  const first = inner[0];
  if (first?.t === 'p') {
    const lead = first.c[0];
    if (lead?.t === 'strong') {
      const label = inlineText(lead.c).trim().replace(/\.$/, '').toLowerCase();
      const kind = calloutLabels[label];
      if (kind) {
        const rest = first.c.slice(1);
        const head = rest[0];
        if (head?.t === 'text') head.v = head.v.replace(/^\s+/, '');
        const body: LearnNode[] = rest.length > 0 ? [{ t: 'p', c: rest }] : [];
        return { t: 'callout', kind, c: [...body, ...inner.slice(1)] };
      }
    }
  }
  return { t: 'quote', c: inner };
}

/** Plain text of a saved tree (for the search index). */
export function astPlainText(ast: readonly LearnNode[]): string {
  return plainOf(ast).join(' ').replace(/\s+/g, ' ').trim();
}

/** Every link of a tree, in order. */
export function astLinks(ast: readonly LearnNode[]): string[] {
  const out: string[] = [];
  const inline = (nodes: readonly InlineNode[]) => {
    for (const n of nodes) {
      if (n.t === 'a') {
        out.push(n.href);
        inline(n.c);
      } else if (n.t === 'strong' || n.t === 'em') inline(n.c);
    }
  };
  const walk = (nodes: readonly LearnNode[]) => {
    for (const n of nodes) {
      if (n.t === 'h' || n.t === 'p') inline(n.c);
      else if (n.t === 'ul' || n.t === 'ol') for (const item of n.items) walk(item);
      else if (n.t === 'table')
        for (const row of [n.head, ...n.rows]) for (const c of row) inline(c);
      else if (n.t === 'callout' || n.t === 'quote') walk(n.c);
    }
  };
  walk(ast);
  return out;
}
