import type { BatchItem } from 'drizzle-orm/batch';
import { getDb, type Db } from '../db/client';
import { getEnv } from '../env';
import { deleteByPrefix } from '../storage';

/** Everything an admin service needs, injected so tests control time, ids and R2. */
export interface AdminDeps {
  db: Db;
  bucket: R2Bucket;
  imgBase: string;
  /** Unix ms. */
  now: () => number;
  newId: () => string;
}

export function realDeps(): AdminDeps {
  const env = getEnv();
  return {
    db: getDb(),
    bucket: env.BUCKET,
    imgBase: env.PUBLIC_IMG_BASE,
    now: () => Date.now(),
    newId: () => crypto.randomUUID().replace(/-/g, '').slice(0, 20),
  };
}

/** One `db.batch`: applied completely or not at all (D1 has no interactive transactions). */
export async function runBatch(db: Db, items: BatchItem<'sqlite'>[]): Promise<void> {
  const [first, ...rest] = items;
  if (!first) return;
  await db.batch([first, ...rest]);
}

/**
 * Deletes R2 prefixes AFTER the database was written. A failure here is logged and ignored:
 * leftover files have no row that shows them, and `pnpm r2:orphans` cleans them (docs/07 §5).
 */
export async function removePrefixes(bucket: R2Bucket, prefixes: string[]): Promise<void> {
  for (const prefix of prefixes) {
    try {
      await deleteByPrefix(prefix, bucket);
    } catch (error) {
      console.error(`[r2 cleanup] could not delete ${prefix}`, error);
    }
  }
}
