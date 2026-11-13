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

export function realFiles(): LearnFiles {
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
