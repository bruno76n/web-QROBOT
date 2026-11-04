import type { AppEnv } from './env';

/**
 * Development-only image server (docs/10 §9): serves a photo straight from R2 so the site
 * works locally without the public image domain. Production answers 404 always.
 */
export async function serveDevImage(
  key: string | undefined,
  appEnv: AppEnv,
  bucket: R2Bucket,
): Promise<Response> {
  const notFound = () => new Response(null, { status: 404 });
  if (appEnv === 'production') return notFound();
  if (!key || key.includes('..') || key.startsWith('/')) return notFound();

  const object = await bucket.get(key);
  if (!object) return notFound();

  const headers = new Headers();
  headers.set('Content-Type', object.httpMetadata?.contentType ?? 'application/octet-stream');
  headers.set('Cache-Control', 'no-store');
  headers.set('ETag', object.httpEtag);
  return new Response(object.body, { headers });
}

/**
 * Streams the ORIGINAL of a photo to the panel (same origin, so the browser can crop it without
 * CORS problems on the image domain). Admin only: the route checks the session first.
 */
export async function serveOriginal(
  originalKey: string | undefined,
  bucket: R2Bucket,
): Promise<Response> {
  if (!originalKey) return new Response(null, { status: 404 });
  const object = await bucket.get(originalKey);
  if (!object) return new Response(null, { status: 404 });
  return new Response(object.body, {
    headers: {
      'Content-Type': object.httpMetadata?.contentType ?? 'application/octet-stream',
      'Cache-Control': 'private, no-store',
    },
  });
}
