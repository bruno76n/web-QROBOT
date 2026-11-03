import { getEnv } from './env';

/** The R2 bucket with the photos. Only src/server/ may use it (docs/07 §6). */
export function getBucket(): R2Bucket {
  return getEnv().BUCKET;
}

/** Writes an object. Keys are made by the server (`ph/<uuid>/…`), never from a file name. */
export async function putObject(
  key: string,
  body: ArrayBuffer | ReadableStream | Uint8Array | string,
  contentType: string,
  bucket: R2Bucket = getBucket(),
): Promise<void> {
  await bucket.put(key, body, { httpMetadata: { contentType } });
}

/** Deletes every object whose key starts with `prefix`; returns how many were removed. */
export async function deleteByPrefix(
  prefix: string,
  bucket: R2Bucket = getBucket(),
): Promise<number> {
  let removed = 0;
  let cursor: string | undefined;
  do {
    const page = await bucket.list(
      cursor ? { prefix, cursor, limit: 1000 } : { prefix, limit: 1000 },
    );
    const keys = page.objects.map((o) => o.key);
    if (keys.length > 0) {
      await bucket.delete(keys);
      removed += keys.length;
    }
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  return removed;
}

/** Public URL of an object: `PUBLIC_IMG_BASE` is `/img` in development, `https://img.[domain]` in production. */
export function photoUrl(key: string, base: string = getEnv().PUBLIC_IMG_BASE): string {
  return `${base.replace(/\/+$/, '')}/${key.replace(/^\/+/, '')}`;
}
