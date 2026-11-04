import { and, eq, lt } from 'drizzle-orm';
import { r2Keys } from '@/lib/crop';
import { schema } from './db/client';
import { removePrefixes, runBatch, type AdminDeps } from './admin/context';

const DAY_MS = 24 * 3600 * 1000;

/**
 * Sweeps photos that were uploaded but never attached to anything (the owner left without saving):
 * `pending` and older than 24 h. Rows go first, then the files (docs/07 §5).
 */
export async function cleanupPending(deps: AdminDeps): Promise<{ removed: number }> {
  const { db, bucket } = deps;
  const cutoff = new Date(deps.now() - DAY_MS);
  const stale = await db
    .select({ id: schema.photos.id })
    .from(schema.photos)
    .where(and(eq(schema.photos.status, 'pending'), lt(schema.photos.createdAt, cutoff)));
  if (stale.length === 0) return { removed: 0 };
  await runBatch(
    db,
    stale.map((p) => db.delete(schema.photos).where(eq(schema.photos.id, p.id))),
  );
  await removePrefixes(
    bucket,
    stale.map((p) => r2Keys.prefix(p.id)),
  );
  return { removed: stale.length };
}
