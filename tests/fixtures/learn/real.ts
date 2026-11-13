/** Test helper: the real learning content (`content/aprende/`) in the shape the importer expects. */

import type { LearnFiles } from '../../../src/lib/learn/import';

// The real `content/aprende/`, read at build time (works inside the Workers test runtime too).
const raw = import.meta.glob('../../../content/aprende/**/*.{md,json}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const entries = Object.entries(raw)
  .map(([path, text]) => ({ path: path.replace(/^.*content\/aprende\//, ''), raw: text }))
  .filter((f) => f.path !== 'README.md')
  .sort((a, b) => a.path.localeCompare(b.path));

/** The real pages, data tables, sources and search config; throws if a required file is missing. */
export function realFiles(): LearnFiles {
  // The file with this path, or an error naming it.
  const find = (p: string) => {
    const f = entries.find((e) => e.path === p);
    if (!f) throw new Error(`${p} missing`);
    return f;
  };
  return {
    pages: entries.filter((e) => e.path.startsWith('paginas/')),
    datasets: entries.filter((e) => e.path.startsWith('datos/')),
    sources: find('fuentes.json'),
    search: find('buscador.json'),
  };
}
