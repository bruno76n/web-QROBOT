import type { LearnFiles } from '../../../src/lib/learn/import';

// Vite reads the fixtures at build time, so this works in Node and inside the Workers runtime.
const raw = import.meta.glob('./**/*.{md,json}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const entries = Object.entries(raw)
  .map(([path, text]) => ({ path: path.replace(/^\.\//, ''), raw: text }))
  .filter((f) => f.path !== 'README.md')
  .sort((a, b) => a.path.localeCompare(b.path));

export function fixtureFiles(): LearnFiles {
  const find = (p: string) => {
    const f = entries.find((e) => e.path === p);
    if (!f) throw new Error(`fixture ${p} missing`);
    return f;
  };
  return {
    pages: entries.filter((e) => e.path.startsWith('paginas/')),
    datasets: entries.filter((e) => e.path.startsWith('datos/')),
    sources: find('fuentes.json'),
    search: find('buscador.json'),
  };
}

/** A copy of the fixtures with one file changed. */
export function withFile(path: string, change: (raw: string) => string): LearnFiles {
  const files = fixtureFiles();
  const swap = (list: { path: string; raw: string }[]) =>
    list.map((f) => (f.path === path ? { ...f, raw: change(f.raw) } : f));
  return {
    pages: swap(files.pages),
    datasets: swap(files.datasets),
    sources: swap([files.sources])[0]!,
    search: swap([files.search])[0]!,
  };
}
