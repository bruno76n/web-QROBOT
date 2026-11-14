/**
 * Preview of a learning page body in the panel: parses the Markdown with the same tree the site
 * saves (`src/lib/learn/markdown.ts`, docs/21 §5) and paints it with React elements, never with
 * `dangerouslySetInnerHTML`. Block marks show as a box with their name; a mark that does not exist
 * shows as a warning box.
 */

/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- the preview and its tables scroll on their own and take focus so the keyboard can scroll them (axe: scrollable-region-focusable), as on the site */
import { useDeferredValue, useMemo } from 'react';
import { es } from '@/i18n/es';
import { parseMarkdown, type InlineNode, type LearnNode } from '@/lib/learn/markdown';
import { markOf } from './form';

const t = es.admin.learn.editor;
/** Title of each callout kind, as the site shows it. */
const calloutTitle = { fact: es.learn.fact, tip: es.learn.tip, careful: es.learn.careful };

/** `markdown` is the body being typed; parsing follows it with a deferred value so typing stays smooth. */
export default function LearnPreview({ markdown }: { markdown: string }) {
  const deferred = useDeferredValue(markdown);
  const ast = useMemo(() => parseMarkdown(deferred).ast, [deferred]);
  if (ast.length === 0) return <p className="learn-prev-empty">{t.previewEmpty}</p>;
  return (
    <div
      className="learn-prev"
      data-testid="learn-preview"
      role="region"
      aria-label={t.preview}
      tabIndex={0}
    >
      <Blocks nodes={ast} />
    </div>
  );
}

/** A list of block nodes. */
function Blocks({ nodes }: { nodes: readonly LearnNode[] }) {
  return nodes.map((node, i) => <Block key={i} node={node} />);
}

/** One block node: heading, paragraph, list, table, code, callout, quote or block mark. */
function Block({ node }: { node: LearnNode }) {
  switch (node.t) {
    case 'h':
      return node.level === 2 ? (
        <h2 id={`prev-${node.id}`}>
          <Inline nodes={node.c} />
        </h2>
      ) : (
        <h3 id={`prev-${node.id}`}>
          <Inline nodes={node.c} />
        </h3>
      );
    case 'p': {
      // A paragraph that is only «[[name]]» but did not become a mark names a block that does not exist.
      const only = node.c.length === 1 && node.c[0]?.t === 'text' ? markOf(node.c[0].v) : null;
      if (only !== null)
        return (
          <div className="learn-mark bad" role="note">
            {t.markUnknown(only)}
          </div>
        );
      return (
        <p>
          <Inline nodes={node.c} />
        </p>
      );
    }
    case 'ul':
    case 'ol': {
      const items = node.items.map((item, i) => (
        <li key={i}>
          {item.length === 1 && item[0]?.t === 'p' ? (
            <Inline nodes={item[0].c} />
          ) : (
            <Blocks nodes={item} />
          )}
        </li>
      ));
      return node.t === 'ul' ? <ul>{items}</ul> : <ol>{items}</ol>;
    }
    case 'table':
      return (
        <div className="learn-tbl" role="region" aria-label={es.learn.table} tabIndex={0}>
          <table>
            <thead>
              <tr>
                {node.head.map((cell, i) => (
                  <th key={i} scope="col">
                    <Inline nodes={cell} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {node.rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td key={c}>
                      <Inline nodes={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'pre':
      return <pre>{node.v}</pre>;
    case 'callout':
      return (
        <div className={`learn-callout ${node.kind}`}>
          <b>{calloutTitle[node.kind]}.</b> <Blocks nodes={node.c} />
        </div>
      );
    case 'quote':
      return (
        <blockquote>
          <Blocks nodes={node.c} />
        </blockquote>
      );
    case 'mark':
      return (
        <div className="learn-mark" role="note">
          {t.markBox(node.name)}
        </div>
      );
  }
}

/** Inline nodes: text, bold, italics, code and links (links open in another tab so the editor stays open). */
function Inline({ nodes }: { nodes: readonly InlineNode[] }) {
  return nodes.map((n, i) => {
    switch (n.t) {
      case 'text':
        return n.v;
      case 'code':
        return <code key={i}>{n.v}</code>;
      case 'strong':
        return (
          <strong key={i}>
            <Inline nodes={n.c} />
          </strong>
        );
      case 'em':
        return (
          <em key={i}>
            <Inline nodes={n.c} />
          </em>
        );
      case 'a':
        return (
          <a key={i} href={n.href} target="_blank" rel="noopener">
            <Inline nodes={n.c} />
          </a>
        );
    }
  });
}
