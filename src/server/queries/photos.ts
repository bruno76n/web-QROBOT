import type { PhotoView } from '@/lib/admin-types';
import { r2Keys } from '@/lib/crop';
import { eq } from 'drizzle-orm';
import { getDb, schema, type Db } from '../db/client';
import type { Photo } from '../db/schema';
import { photoUrl } from '../storage';

function parseWidths(raw: string): number[] {
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((w): w is number => Number.isInteger(w)) : [];
  } catch {
    return [];
  }
}

/** The row of a photo → what the panel and the pages need (URLs only for widths that exist). */
export function toPhotoView(row: Photo, imgBase: string): PhotoView {
  const widths = parseWidths(row.widths);
  const urls: Record<string, string> = {};
  for (const w of widths)
    urls[String(w)] = photoUrl(r2Keys.variant(row.id, row.version, w), imgBase);
  return {
    id: row.id,
    alt: row.alt,
    aspect: row.aspect,
    version: row.version,
    widths,
    crop: { x: row.cropX, y: row.cropY, width: row.cropWidth, height: row.cropHeight },
    original: { width: row.originalWidth, height: row.originalHeight },
    urls,
    ogUrl: row.ownerType === 'product' ? photoUrl(r2Keys.og(row.id, row.version), imgBase) : null,
  };
}

/** R2 key of the original of a photo, or undefined when the photo does not exist. */
export async function getOriginalKey(
  id: string | undefined,
  db: Db = getDb(),
): Promise<string | undefined> {
  if (!id) return undefined;
  const [row] = await db
    .select({ key: schema.photos.originalKey })
    .from(schema.photos)
    .where(eq(schema.photos.id, id));
  return row?.key;
}
