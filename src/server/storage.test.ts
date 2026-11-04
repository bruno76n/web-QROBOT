import { describe, expect, it } from 'vitest';
import { env } from 'cloudflare:workers';
import { GET } from '@/pages/img/[...key]';
import { deleteByPrefix, photoUrl, putObject } from './storage';
import { serveDevImage } from './images';

const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]);

describe('storage (local R2)', () => {
  it('uploads a file, reads it through the /img route and deletes it by prefix', async () => {
    const key = 'ph/test-1/800.webp';
    await putObject(key, bytes, 'image/webp', env.BUCKET);
    await putObject('ph/test-1/400.webp', bytes, 'image/webp', env.BUCKET);
    await putObject('ph/other/400.webp', bytes, 'image/webp', env.BUCKET);

    // Same handler the dev server mounts at /img/[...key]
    const res = await GET({ params: { key } } as unknown as Parameters<typeof GET>[0]);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/webp');
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(bytes);

    const removed = await deleteByPrefix('ph/test-1/', env.BUCKET);
    expect(removed).toBe(2);
    expect(await env.BUCKET.get(key)).toBeNull();
    // Only the prefix goes: the neighbour stays
    expect(await env.BUCKET.get('ph/other/400.webp')).not.toBeNull();
    await deleteByPrefix('ph/other/', env.BUCKET);
  });

  it('deletes more than one page of objects', async () => {
    for (let i = 0; i < 1005; i++) await env.BUCKET.put(`ph/many/${i}`, 'x');
    expect(await deleteByPrefix('ph/many/', env.BUCKET)).toBe(1005);
    expect((await env.BUCKET.list({ prefix: 'ph/many/' })).objects).toHaveLength(0);
  }, 60_000);

  it('builds public URLs for /img (development) and for the image domain (production)', () => {
    expect(photoUrl('ph/a/400.webp', '/img')).toBe('/img/ph/a/400.webp');
    expect(photoUrl('/ph/a/400.webp', 'https://img.quickrobot.example/')).toBe(
      'https://img.quickrobot.example/ph/a/400.webp',
    );
  });
});

describe('/img route is development only', () => {
  it('answers 404 in production even when the object exists', async () => {
    await putObject('ph/prod/400.webp', bytes, 'image/webp', env.BUCKET);
    expect((await serveDevImage('ph/prod/400.webp', 'production', env.BUCKET)).status).toBe(404);
    expect((await serveDevImage('ph/prod/400.webp', 'development', env.BUCKET)).status).toBe(200);
    await deleteByPrefix('ph/prod/', env.BUCKET);
  });

  it('answers 404 for missing, empty and path-traversal keys', async () => {
    for (const key of [undefined, '', '../secret', 'ph/../x', '/etc/passwd', 'ph/nope/1.webp']) {
      expect((await serveDevImage(key, 'development', env.BUCKET)).status).toBe(404);
    }
  });
});
