// pnpm learn:sync — rebuilds the Meilisearch index of Aprende from the LOCAL D1 (docs/22 §6).
// Needs MEILI_HOST and MEILI_WRITE_KEY (shell or .dev.vars.local); without MEILI_HOST it says the
// search uses D1 and stops. Production's index is rebuilt from the panel («Actualizar buscador»),
// because only the Worker reads the production database.
import { join } from 'node:path';
import { getPlatformProxy } from 'wrangler';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../src/server/db/schema.ts';
import { meiliConfig, syncLearnIndex } from '../src/server/search-index.ts';
import { meiliEnv } from './learn-env.ts';

const root = new URL('..', import.meta.url).pathname;

/** Runs the sync and prints the result; returns the exit code. */
export async function runSync(): Promise<number> {
  const meili = meiliConfig(meiliEnv(root));
  if (!meili) {
    console.log(
      'learn:sync: sin MEILI_HOST el buscador usa la base de datos; no hay índice que actualizar.',
    );
    return 0;
  }
  const proxy = await getPlatformProxy<{ DB: D1Database }>({
    configPath: join(root, 'wrangler.jsonc'),
  });
  try {
    const r = await syncLearnIndex(drizzle(proxy.env.DB, { schema }), meili, new Date());
    if (!r.ok) {
      console.error(
        'learn:sync: no se pudo actualizar el índice (revisa MEILI_HOST y MEILI_WRITE_KEY).',
      );
      return 1;
    }
    if (r.skipped) console.log('learn:sync: sin Meilisearch, nada que hacer.');
    else console.log(`learn:sync: índice actualizado con ${r.docs} documentos.`);
    return 0;
  } finally {
    await proxy.dispose();
  }
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop() ?? '')) {
  runSync().then((code) => process.exit(code));
}
