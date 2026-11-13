// pnpm learn:import — loads content/aprende/ into D1 (docs/21 §8).
//   (no flags)     local D1, new and changed pages; pages edited in the panel are not touched
//   --if-empty     only when the local database has no pages (used by `pnpm dev`)
//   --overwrite    also replaces the pages edited in the panel
//   --prune        deletes the pages that are not in the files
//   --remote --yes writes to production through `wrangler d1 execute --remote` (needs credentials)
//   --sync         reserved for updating the search index (docs/22 §6); it only prints a notice
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { getPlatformProxy } from 'wrangler';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../src/server/db/schema.ts';
import { buildImportPlan, ImportError } from '../src/lib/learn/import.ts';
import {
  applyImport,
  renderImportSql,
  type ExistingPage,
  type ImportSummary,
} from '../src/server/learn-import.ts';
import { loadLearnFiles } from './learn-files.ts';
import { runSync } from './learn-sync.ts';

// Project root, parsed flags and the target database name.
const root = new URL('..', import.meta.url).pathname;
const args = new Set(process.argv.slice(2));
const known = ['--if-empty', '--overwrite', '--prune', '--remote', '--yes', '--sync'];
for (const a of args)
  if (!known.includes(a)) {
    console.error(`learn:import: opción desconocida ${a}`);
    process.exit(1);
  }
const remote = args.has('--remote');
const dbName = 'quick-robot-web';

/** Prints what the import did, with the page names when the lists are short. */
function print(summary: ImportSummary, where: string) {
  const list = (name: string, items: string[]) =>
    console.log(
      `  ${name}: ${items.length}${items.length > 0 && items.length <= 8 ? ` (${items.map((s) => s || 'portada').join(', ')})` : ''}`,
    );
  console.log(`learn:import → ${where}`);
  list('nuevas', summary.created);
  list('actualizadas', summary.updated);
  list('sin cambios', summary.unchanged);
  list('no se tocó (editadas en el panel)', summary.untouched);
  if (summary.pruned.length > 0) list('borradas', summary.pruned);
  console.log(`  preguntas escritas: ${summary.faqs}`);
  for (const w of summary.warnings) console.warn(`  aviso: ${w}`);
}

/** Runs wrangler through pnpm from the project root and returns its output. */
function wrangler(argv: string[]) {
  return spawnSync('pnpm', ['exec', 'wrangler', ...argv], { cwd: root, encoding: 'utf8' });
}

/**
 * Builds the plan from `content/aprende/` and writes it: to production as an SQL file run by wrangler
 * (`--remote`, only with `--yes`), or to the local D1 directly.
 */
async function main() {
  if (remote && !args.has('--yes')) {
    console.error(
      'learn:import: --remote escribe en producción. Agrega --yes si estás seguro (docs/21 §8).',
    );
    process.exit(1);
  }
  const plan = buildImportPlan(loadLearnFiles(join(root, 'content/aprende')));
  const now = Date.now();

  if (remote) {
    // Read which pages exist so the SQL only creates, updates or prunes what it should.
    const q = wrangler([
      'd1',
      'execute',
      dbName,
      '--remote',
      '--json',
      '--command',
      'SELECT id, slug, edited_in_panel FROM learn_pages',
    ]);
    if (q.status !== 0) {
      console.error(q.stderr || q.stdout);
      console.error(
        'learn:import: no se pudo leer la base de producción (¿migración 0007 aplicada y credenciales?).',
      );
      process.exit(1);
    }
    const parsed = JSON.parse(q.stdout) as {
      results: { id: string; slug: string; edited_in_panel: number }[];
    }[];
    const existing: ExistingPage[] = (parsed[0]?.results ?? []).map((r) => ({
      id: r.id,
      slug: r.slug,
      editedInPanel: r.edited_in_panel === 1,
    }));
    const { sql, summary } = renderImportSql(plan, existing, {
      now,
      overwrite: args.has('--overwrite'),
      prune: args.has('--prune'),
    });
    mkdirSync(join(root, '.wrangler'), { recursive: true });
    const file = join(root, '.wrangler/learn-import.sql');
    writeFileSync(file, sql);
    const run = wrangler(['d1', 'execute', dbName, '--remote', '--file', file]);
    if (run.status !== 0) {
      console.error(run.stderr || run.stdout);
      process.exit(1);
    }
    print(summary, 'producción');
  } else {
    // Refuse to write when the config points the local binding at a remote database.
    const config = readFileSync(join(root, 'wrangler.jsonc'), 'utf8');
    if (/"remote"\s*:\s*true/.test(config)) {
      console.error(
        'learn:import: wrangler.jsonc apunta a una base remota; sin --remote solo se escribe en la local.',
      );
      process.exit(1);
    }
    const proxy = await getPlatformProxy<{ DB: D1Database }>({
      configPath: join(root, 'wrangler.jsonc'),
    });
    try {
      const summary = await applyImport(drizzle(proxy.env.DB, { schema }), plan, {
        now,
        overwrite: args.has('--overwrite'),
        prune: args.has('--prune'),
        ifEmpty: args.has('--if-empty'),
      });
      if (summary.skipped)
        console.log(
          'learn:import: la base ya tiene páginas de Aprende; no se hace nada (--if-empty).',
        );
      else print(summary, 'base local');
    } finally {
      await proxy.dispose();
    }
  }
  if (args.has('--sync')) {
    if (remote)
      console.log(
        'learn:import: el índice de producción se actualiza desde el panel («Actualizar buscador»).',
      );
    else process.exitCode = await runSync();
  }
}

// Invalid content gets a short message; anything else shows the full error.
main().catch((e: unknown) => {
  if (e instanceof ImportError) console.error(`learn:import: ${e.message}`);
  else console.error(e);
  process.exit(1);
});
