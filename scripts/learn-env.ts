// Meilisearch settings for the terminal scripts of Aprende: from the shell environment first, then
// from `.dev.vars.local` (the local file `pnpm dev` uses). Values are never printed.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** `KEY=value` lines of a dev vars file (comments and blank lines ignored). */
function readVars(file: string): Record<string, string> {
  if (!existsSync(file)) return {};
  const out: Record<string, string> = {};
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (m && m[1]) out[m[1]] = (m[2] ?? '').replace(/^"(.*)"$/, '$1');
  }
  return out;
}

/** MEILI_HOST, MEILI_SEARCH_KEY, MEILI_WRITE_KEY and MEILI_MASTER_KEY as the scripts see them. */
export function meiliEnv(root: string): Record<string, string | undefined> {
  const file = readVars(join(root, '.dev.vars.local'));
  const pick = (k: string) => process.env[k] ?? file[k];
  return {
    MEILI_HOST: pick('MEILI_HOST'),
    MEILI_SEARCH_KEY: pick('MEILI_SEARCH_KEY'),
    MEILI_WRITE_KEY: pick('MEILI_WRITE_KEY'),
    MEILI_MASTER_KEY: pick('MEILI_MASTER_KEY'),
  };
}
