import { and, eq, inArray } from 'drizzle-orm';
import {
  isValidCrop,
  r2Keys,
  usageAspect,
  wantedWidths,
  widthsToGenerate,
  type PhotoUsage,
} from '@/lib/crop';
import type { PhotoRef } from '@/lib/schemas';
import { fail, type Failure } from '@/lib/result';
import { schema, type Db } from '../db/client';
import type { Photo } from '../db/schema';

export interface CheckedPhoto {
  ref: PhotoRef;
  row: Photo;
  /** The version in the database differs: the photo was re-centered and the old files go away. */
  recentered: boolean;
}

/**
 * Checks the photos a save refers to (docs/10 §3): they exist, belong to this owner (or are
 * `pending`), the crop fits their original, and re-centered versions really were uploaded.
 * Returns a failure, or the rows in the order received.
 */
export async function checkPhotoRefs(
  db: Db,
  bucket: R2Bucket,
  refs: PhotoRef[],
  usage: PhotoUsage,
  owner: { id: string | null; attachedIds?: ReadonlySet<string> },
): Promise<CheckedPhoto[] | Failure> {
  if (refs.length === 0) return [];
  const ids = refs.map((r) => r.id);
  if (new Set(ids).size !== ids.length)
    return fail('VALIDATION', { fields: { photos: ['duplicate photo'] } });

  const rows = await db
    .select()
    .from(schema.photos)
    .where(and(inArray(schema.photos.id, ids), eq(schema.photos.ownerType, usage)));
  const byId = new Map(rows.map((r) => [r.id, r]));

  const checked: CheckedPhoto[] = [];
  for (const ref of refs) {
    const row = byId.get(ref.id);
    const mine =
      row &&
      (row.status === 'pending' ||
        (owner.id !== null && row.ownerId === owner.id) ||
        owner.attachedIds?.has(row.id) === true);
    // A pending photo can be adopted by anyone with panel access; an attached one only by its owner
    // (a product, or the hero as a whole through `attachedIds`).
    if (!row || !mine) return fail('PHOTO_NOT_FOUND');
    if (row.aspect !== usageAspect[usage]) return fail('PHOTO_NOT_FOUND');

    const recentered = ref.version !== row.version;
    // Unchanged photos keep their stored crop; only a re-centered one is checked and applied.
    if (recentered) {
      if (
        !isValidCrop(ref.crop, row.originalWidth, row.originalHeight, {
          allowPadding: usage === 'product',
        })
      ) {
        return fail('VALIDATION', { fields: { photos: ['crop outside the original'] } });
      }
      const expected = widthsToGenerate(ref.crop.width, wantedWidths[usage]);
      const sent = [...ref.widths].sort((a, b) => a - b);
      if (expected.length !== sent.length || expected.some((w, i) => w !== sent[i])) {
        return fail('VALIDATION', { fields: { photos: ['widths do not match the crop'] } });
      }
      // The new versions must already be in R2 (the panel uploads them before saving).
      for (const w of sent) {
        if (!(await bucket.head(r2Keys.variant(row.id, ref.version, w))))
          return fail('PHOTO_NOT_FOUND');
      }
    }
    checked.push({ ref, row, recentered });
  }
  return checked;
}
