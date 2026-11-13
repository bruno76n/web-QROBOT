// pnpm r2:orphans — lists (and with --delete removes) leftovers in the LOCAL R2 bucket (docs/17 §5):
//   (a) folders `ph/<id>/` with no row in `photos`
//   (b) version folders `ph/<id>/<version>/` that are not the current version of their row
//       (re-centers that were never saved).
// Against production, run it with the credentials from a machine that has them; this script only
// touches the local bucket and refuses `--remote`.
import { join } from 'node:path';
import { getPlatformProxy } from 'wrangler';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../src/server/db/schema.ts';

// The script only reads the local bucket, so a production run is refused.
if (process.argv.includes('--remote')) {
  console.error(
    'r2:orphans: only the local bucket is supported here (see docs/17 §5 for production).',
  );
  process.exit(1);
}
// Without `--delete` it only lists what it finds.
const doDelete = process.argv.includes('--delete');
const root = new URL('..', import.meta.url).pathname;

// Local D1 and R2 through wrangler's platform proxy.
const proxy = await getPlatformProxy<{ DB: D1Database; BUCKET: R2Bucket }>({
  configPath: join(root, 'wrangler.jsonc'),
});
try {
  const db = drizzle(proxy.env.DB, { schema });
  // Current version of each photo row, by photo id.
  const current = new Map((await db.select().from(schema.photos)).map((p) => [p.id, p.version]));

  // Folders to report and every key inside them.
  const orphanPrefixes = new Set<string>();
  const orphanKeys: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await proxy.env.BUCKET.list(
      cursor ? { prefix: 'ph/', cursor } : { prefix: 'ph/' },
    );
    // Keys look like `ph/<id>/original.<ext>` or `ph/<id>/<version>/<file>`.
    for (const { key } of page.objects) {
      const [, id, second] = key.split('/');
      if (!id) continue;
      if (!current.has(id)) {
        orphanPrefixes.add(`ph/${id}/`);
        orphanKeys.push(key);
      } else if (
        second &&
        second !== 'original.jpg' &&
        !second.startsWith('original.') &&
        second !== current.get(id)
      ) {
        orphanPrefixes.add(`ph/${id}/${second}/`);
        orphanKeys.push(key);
      }
    }
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);

  if (orphanKeys.length === 0) {
    console.log('r2:orphans: nothing to clean.');
  } else {
    for (const prefix of [...orphanPrefixes].sort()) console.log(`orphan: ${prefix}`);
    console.log(`${orphanKeys.length} file(s) in ${orphanPrefixes.size} folder(s).`);
    // R2 deletes at most 1000 keys per call.
    if (doDelete) {
      for (let i = 0; i < orphanKeys.length; i += 1000)
        await proxy.env.BUCKET.delete(orphanKeys.slice(i, i + 1000));
      console.log('r2:orphans: deleted.');
    } else {
      console.log('Run with --delete to remove them.');
    }
  }
} finally {
  await proxy.dispose();
}
