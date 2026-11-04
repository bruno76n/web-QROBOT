import { describe, expect, it } from 'vitest';
import { env } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '@/server/db/client';
import { handleUpload, type UploadDeps } from '@/server/uploads';

// docs/13 §10 (upload.test.ts) and docs/fases/fase-2.md §2.4.
const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46]);
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
const WEBP = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 4, 0, 0, 0, 0x57, 0x45, 0x42, 0x50, 0x56, 0x50,
]);
const SVG = new TextEncoder().encode(
  '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
);

const file = (bytes: Uint8Array, type: string, name = 'f') =>
  new File([bytes as BlobPart], name, { type });

let counter = 0;
const deps = (overrides: Partial<UploadDeps> = {}): UploadDeps => ({
  db: getDb(env.DB),
  bucket: env.BUCKET,
  imgBase: '/img',
  now: () => 1_700_000_000_000,
  randomId: () => `id${++counter}`,
  ...overrides,
});

/** A valid new product photo: 1000×1000 original, full crop → widths 400 and 800. */
function productForm(
  overrides: Record<string, string> = {},
  files: Record<string, File | null> = {},
) {
  const form = new FormData();
  const fields: Record<string, string> = {
    kind: 'product',
    aspect: '1:1',
    cropX: '0',
    cropY: '0',
    cropWidth: '1000',
    cropHeight: '1000',
    originalWidth: '1000',
    originalHeight: '1000',
    widths: '[400,800]',
    ...overrides,
  };
  for (const [k, v] of Object.entries(fields)) form.set(k, v);
  const defaults: Record<string, File | null> = {
    original: file(JPEG, 'image/jpeg', 'original.jpg'),
    w400: file(WEBP, 'image/webp'),
    w800: file(WEBP, 'image/webp'),
    og: file(JPEG, 'image/jpeg'),
    ...files,
  };
  for (const [k, v] of Object.entries(defaults)) if (v) form.set(k, v);
  return form;
}

const keysUnder = async (prefix: string) =>
  (await env.BUCKET.list({ prefix })).objects.map((o) => o.key);

describe('upload · happy path', () => {
  it('stores original and versions, creates a pending row and answers the URLs', async () => {
    const res = await handleUpload(productForm(), deps());
    expect(res.status).toBe(200);
    if (!res.body.ok) throw new Error('expected ok');
    const { photoId, version, widths, urls } = res.body.data;
    expect(widths).toEqual([400, 800]);
    expect(urls).toEqual({
      '400': `/img/ph/${photoId}/${version}/400.webp`,
      '800': `/img/ph/${photoId}/${version}/800.webp`,
      og: `/img/ph/${photoId}/${version}/og.jpg`,
    });
    expect((await keysUnder(`ph/${photoId}/`)).sort()).toEqual(
      [
        `ph/${photoId}/original.jpg`,
        `ph/${photoId}/${version}/400.webp`,
        `ph/${photoId}/${version}/800.webp`,
        `ph/${photoId}/${version}/og.jpg`,
      ].sort(),
    );
    const head = await env.BUCKET.head(`ph/${photoId}/${version}/800.webp`);
    expect(head?.httpMetadata?.contentType).toBe('image/webp');
    expect(head?.httpMetadata?.cacheControl).toBe('public, max-age=31536000, immutable');

    const [row] = await getDb(env.DB)
      .select()
      .from(schema.photos)
      .where(eq(schema.photos.id, photoId));
    expect(row).toMatchObject({
      status: 'pending',
      ownerId: null,
      ownerType: 'product',
      originalKey: `ph/${photoId}/original.jpg`,
      originalWidth: 1000,
      cropWidth: 1000,
      aspect: '1:1',
      version,
      widths: '[400,800]',
    });
  });

  it('a small crop gets one version of its own width', async () => {
    const res = await handleUpload(
      productForm(
        { cropWidth: '300', cropHeight: '300', widths: '[300]' },
        { w400: null, w800: null, w300: file(WEBP, 'image/webp') },
      ),
      deps(),
    );
    expect(res.status).toBe(200);
  });

  it('hero photos do not need og.jpg', async () => {
    const form = productForm(
      {
        kind: 'hero_desktop',
        aspect: '16:9',
        originalWidth: '2400',
        originalHeight: '1350',
        cropWidth: '2400',
        cropHeight: '1350',
        widths: '[1200,2400]',
      },
      {
        w400: null,
        w800: null,
        og: null,
        w1200: file(WEBP, 'image/webp'),
        w2400: file(WEBP, 'image/webp'),
      },
    );
    expect((await handleUpload(form, deps())).status).toBe(200);
  });
});

describe('upload · files that are not what they claim (415)', () => {
  it('a .jpg that is really a PNG', async () => {
    const res = await handleUpload(
      productForm({}, { original: file(PNG, 'image/jpeg', 'foto.jpg') }),
      deps(),
    );
    expect(res).toMatchObject({ status: 415, body: { ok: false, code: 'FILE_TYPE' } });
  });
  it('declared as PNG but the bytes are a JPEG', async () => {
    const res = await handleUpload(
      productForm({}, { original: file(JPEG, 'image/png', 'foto.png') }),
      deps(),
    );
    expect(res.status).toBe(415);
  });
  it('SVG is forbidden, whatever its name and type', async () => {
    for (const type of ['image/svg+xml', 'image/jpeg', '']) {
      const res = await handleUpload(
        productForm({}, { original: file(SVG, type, 'logo.jpg') }),
        deps(),
      );
      expect(res, type).toMatchObject({ status: 415, body: { code: 'FILE_TYPE' } });
    }
  });
  it('a version must be WebP and og.jpg must be a JPEG', async () => {
    expect(
      (await handleUpload(productForm({}, { w400: file(JPEG, 'image/jpeg') }), deps())).status,
    ).toBe(415);
    expect(
      (await handleUpload(productForm({}, { og: file(PNG, 'image/png') }), deps())).status,
    ).toBe(415);
  });
  it('nothing is left in R2 or D1 after a rejection', async () => {
    const before = (await env.BUCKET.list({ prefix: 'ph/' })).objects.length;
    const rows = (await getDb(env.DB).select().from(schema.photos)).length;
    await handleUpload(productForm({}, { og: file(PNG, 'image/png') }), deps());
    expect((await env.BUCKET.list({ prefix: 'ph/' })).objects.length).toBe(before);
    expect((await getDb(env.DB).select().from(schema.photos)).length).toBe(rows);
  });
});

describe('upload · sizes (413)', () => {
  it('an original over 25 MB', async () => {
    const big = new File([new Uint8Array(26 * 1024 * 1024)], 'big.jpg', { type: 'image/jpeg' });
    const res = await handleUpload(productForm({}, { original: big }), deps());
    expect(res).toMatchObject({ status: 413, body: { code: 'FILE_TOO_LARGE' } });
  });
  it('a version over 2 MB', async () => {
    const big = new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'v.webp', { type: 'image/webp' });
    const res = await handleUpload(productForm({}, { w800: big }), deps());
    expect(res.status).toBe(413);
  });
});

describe('upload · validation (400)', () => {
  it('widths that do not match the crop', async () => {
    const res = await handleUpload(
      productForm({ widths: '[400,800,1200]' }, { w1200: file(WEBP, 'image/webp') }),
      deps(),
    );
    expect(res).toMatchObject({ status: 400, body: { code: 'VALIDATION' } });
  });
  it('crop outside the original, wrong shape for the usage, and wrong aspect of the crop', async () => {
    expect((await handleUpload(productForm({ cropX: '10' }), deps())).status).toBe(400);
    expect((await handleUpload(productForm({ aspect: '16:9' }), deps())).status).toBe(400);
    expect(
      (await handleUpload(productForm({ cropHeight: '600', originalHeight: '1000' }), deps()))
        .status,
    ).toBe(400);
  });
  it('missing original, version or og.jpg', async () => {
    expect((await handleUpload(productForm({}, { original: null }), deps())).status).toBe(400);
    expect((await handleUpload(productForm({}, { w800: null }), deps())).status).toBe(400);
    expect((await handleUpload(productForm({}, { og: null }), deps())).status).toBe(400);
  });
  it('garbage fields', async () => {
    expect((await handleUpload(productForm({ kind: 'banner' }), deps())).status).toBe(400);
    expect((await handleUpload(productForm({ widths: 'x' }), deps())).status).toBe(400);
  });
});

describe('upload · a failure halfway removes what was uploaded', () => {
  it('deletes the original and the versions and leaves no row', async () => {
    let puts = 0;
    const flaky = new Proxy(env.BUCKET, {
      get(target, prop) {
        if (prop === 'put') {
          return async (...args: Parameters<R2Bucket['put']>) => {
            if (++puts === 3) throw new Error('R2 went away');
            return target.put(...args);
          };
        }
        const value = Reflect.get(target, prop, target) as unknown;
        return typeof value === 'function'
          ? (value as (...a: unknown[]) => unknown).bind(target)
          : value;
      },
    });
    const ids = ['halfway', 'nonce'];
    const rowsBefore = (await getDb(env.DB).select().from(schema.photos)).length;
    await expect(
      handleUpload(productForm(), deps({ bucket: flaky, randomId: () => ids.shift() ?? 'x' })),
    ).rejects.toThrow('R2 went away');
    expect(await keysUnder('ph/halfway/')).toEqual([]);
    expect((await getDb(env.DB).select().from(schema.photos)).length).toBe(rowsBefore);
  });
});

describe('upload · re-centering an existing photo', () => {
  async function existing(id: string, ownerType: 'product' | 'hero_desktop' = 'product') {
    await getDb(env.DB)
      .insert(schema.photos)
      .values({
        id,
        ownerType,
        originalKey: `ph/${id}/original.jpg`,
        originalWidth: 1000,
        originalHeight: 800,
        cropX: 0,
        cropY: 0,
        cropWidth: 800,
        cropHeight: 800,
        aspect: ownerType === 'product' ? '1:1' : '16:9',
        version: 'aaaaaaaa',
        widths: '[400,800]',
      });
  }

  it('uploads new versions without the original and leaves the row for saveProduct', async () => {
    await existing('recenter1');
    const form = productForm(
      {
        photoId: 'recenter1',
        cropX: '100',
        cropWidth: '800',
        cropHeight: '800',
        originalWidth: '1000',
        originalHeight: '800',
      },
      { original: null },
    );
    const res = await handleUpload(form, deps());
    expect(res.status).toBe(200);
    if (!res.body.ok) throw new Error('expected ok');
    expect(res.body.data.photoId).toBe('recenter1');
    expect(res.body.data.version).not.toBe('aaaaaaaa');
    const [row] = await getDb(env.DB)
      .select()
      .from(schema.photos)
      .where(eq(schema.photos.id, 'recenter1'));
    expect(row).toMatchObject({ version: 'aaaaaaaa', cropX: 0 });
    expect((await keysUnder(`ph/recenter1/${res.body.data.version}/`)).length).toBe(3);
  });

  it('uses the stored original size, not the one the client claims', async () => {
    await existing('recenter2');
    // 1000×800 stored; the client lies and says 4000×4000 to fit a bigger crop
    const form = productForm(
      {
        photoId: 'recenter2',
        cropWidth: '1000',
        cropHeight: '1000',
        originalWidth: '4000',
        originalHeight: '4000',
        widths: '[400,800]',
      },
      { original: null },
    );
    expect((await handleUpload(form, deps())).status).toBe(400);
  });

  it('unknown photo, or a photo of another kind → PHOTO_NOT_FOUND', async () => {
    await existing('hero1', 'hero_desktop');
    expect(
      (await handleUpload(productForm({ photoId: 'nope' }, { original: null }), deps())).status,
    ).toBe(422);
    expect(
      (await handleUpload(productForm({ photoId: 'hero1' }, { original: null }), deps())).status,
    ).toBe(422);
  });
});
