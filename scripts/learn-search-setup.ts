// pnpm learn:search-setup — prepares Meilisearch for Aprende once (docs/22 §2–5): with MEILI_HOST
// and MEILI_MASTER_KEY from the owner's terminal, creates the index `learn` with its settings and
// two keys: one that can only search `learn` (MEILI_SEARCH_KEY) and one that can write `learn` and
// `learn_tmp` (MEILI_WRITE_KEY). The keys are printed once to be saved as Worker secrets
// (`wrangler secret put …`); the master key is never stored anywhere.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Meilisearch } from 'meilisearch';
import { searchConfig } from '../src/lib/learn/content.ts';
import { indexName, indexSettings } from '../src/server/search-index.ts';
import { meiliEnv } from './learn-env.ts';

const root = new URL('..', import.meta.url).pathname;

async function main() {
  const env = meiliEnv(root);
  if (!env.MEILI_HOST || !env.MEILI_MASTER_KEY) {
    console.error(
      'learn:search-setup: pon MEILI_HOST y MEILI_MASTER_KEY en la terminal (docs/22 §3).',
    );
    process.exit(1);
  }
  const config = searchConfig.parse(
    JSON.parse(readFileSync(join(root, 'content/aprende/buscador.json'), 'utf8')),
  );
  const client = new Meilisearch({ host: env.MEILI_HOST, apiKey: env.MEILI_MASTER_KEY });
  const exists = await client.getIndex(indexName).then(
    () => true,
    () => false,
  );
  if (!exists) await client.createIndex(indexName, { primaryKey: 'id' }).waitTask();
  await client.index(indexName).updateSettings(indexSettings(config)).waitTask();

  const search = await client.createKey({
    name: 'quick-robot-learn-search',
    description: 'Solo buscar en Aprende (Worker)',
    actions: ['search'],
    indexes: [indexName],
    expiresAt: null,
  });
  const write = await client.createKey({
    name: 'quick-robot-learn-write',
    description: 'Actualizar el índice de Aprende (Worker y pnpm learn:sync)',
    actions: [
      'documents.add',
      'documents.delete',
      'indexes.create',
      'indexes.swap',
      'indexes.delete',
      'indexes.get',
      'settings.update',
      'tasks.get',
    ],
    indexes: [indexName, 'learn_tmp'],
    expiresAt: null,
  });
  console.log(
    'learn:search-setup: índice «learn» listo. Guarda estas llaves como secretos del Worker:',
  );
  console.log(`  MEILI_SEARCH_KEY=${search.key}`);
  console.log(`  MEILI_WRITE_KEY=${write.key}`);
  console.log(
    '  (wrangler secret put MEILI_SEARCH_KEY · wrangler secret put MEILI_WRITE_KEY; no se vuelven a mostrar)',
  );
}

main().catch((e: unknown) => {
  console.error('learn:search-setup: falló:', (e as Error).message);
  process.exit(1);
});
