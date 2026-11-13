// Reads `content/aprende/` from disk into the shape `buildImportPlan` expects (docs/21 §8).
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { LearnFiles, RawFile } from '../src/lib/learn/import.ts';

export function walk(dir: string, ext: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, ext));
    else if (entry.name.endsWith(ext)) out.push(full);
  }
  return out.sort();
}

export function loadLearnFiles(root: string): LearnFiles {
  const read = (file: string): RawFile => ({
    path: relative(root, file).split('\\').join('/'),
    raw: readFileSync(file, 'utf8'),
  });
  return {
    pages: walk(join(root, 'paginas'), '.md').map(read),
    datasets: walk(join(root, 'datos'), '.json').map(read),
    sources: read(join(root, 'fuentes.json')),
    search: read(join(root, 'buscador.json')),
  };
}
