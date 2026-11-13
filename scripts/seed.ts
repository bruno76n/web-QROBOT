// pnpm seed — loads the 14 example products and the default hero into the LOCAL D1 and R2
// (docs/09 §4). Flags: `--if-empty` (only when the local database has no products; used by
// `pnpm dev`), `--many` (200 generated products for the performance test).
// It refuses to run against a remote database.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getPlatformProxy } from 'wrangler';
import sharp from 'sharp';
import { drizzle } from 'drizzle-orm/d1';
import { count } from 'drizzle-orm';
import {
  aspectRatio,
  cropVersion,
  ogLayout,
  r2Keys,
  usageAspect,
  variantHeight,
  wantedWidths,
  widthsToGenerate,
  type PhotoUsage,
} from '../src/lib/crop.ts';
import * as schema from '../src/server/db/schema.ts';
import { seedProducts } from './seed-data.ts';

// Project root, background color of the example photos and the command-line flags.
const root = new URL('..', import.meta.url).pathname;
const SOFT = '#f6f6f8';
const args = new Set(process.argv.slice(2));

/** Exits with an error when the flags, the environment or the wrangler config point at a remote database. */
function refuseRemote() {
  const remoteFlags = ['--remote', '--prod', '--production'].filter((f) => args.has(f));
  const env = process.env.CLOUDFLARE_ENV;
  const config = readFileSync(join(root, 'wrangler.jsonc'), 'utf8');
  const bindsRemote = /"remote"\s*:\s*true/.test(config);
  if (remoteFlags.length > 0 || bindsRemote || (env && env !== 'local')) {
    console.error(
      'seed: refusing to run against a remote database. The seed only writes to the LOCAL D1 and R2 (.wrangler/state).',
    );
    process.exit(1);
  }
}

/** A processed photo: the stored original plus every file to put in R2. */
interface Stored {
  originalKey: string;
  originalWidth: number;
  originalHeight: number;
  /** Widths of the generated versions (never above the photo's own width). */
  widths: number[];
  version: string;
  /** Original, versions and, for products, the social image; `key` is the R2 key. */
  files: { key: string; body: Buffer; type: string }[];
}

/**
 * Prepares one photo: product photos are small and not square, so they go centered on a square of
 * `SOFT`, uncropped; hero photos are used as they are. Produces the original, the versions and, for
 * products, the 1200 × 630 social image.
 */
async function processPhoto(file: string, photoId: string, usage: PhotoUsage): Promise<Stored> {
  const img = sharp(file);
  const meta = await img.metadata();
  const w = meta.width ?? 1;
  const h = meta.height ?? 1;
  let originalBuffer: Buffer;
  let width: number;
  let height: number;
  if (usage === 'product') {
    const side = Math.max(w, h);
    originalBuffer = await sharp({
      create: { width: side, height: side, channels: 3, background: SOFT },
    })
      .composite([{ input: await sharp(file).toBuffer(), gravity: 'centre' }])
      .webp({ quality: 90 })
      .toBuffer();
    width = side;
    height = side;
  } else {
    originalBuffer = await sharp(file).webp({ quality: 90 }).toBuffer();
    width = w;
    height = h;
  }
  const crop = { x: 0, y: 0, width, height };
  const version = cropVersion(crop, 'seed');
  const widths = widthsToGenerate(width, wantedWidths[usage]);
  const aspect = usageAspect[usage];
  const files: Stored['files'] = [
    { key: r2Keys.original(photoId, 'webp'), body: originalBuffer, type: 'image/webp' },
  ];
  for (const target of widths) {
    const body = await sharp(originalBuffer)
      .resize({
        width: target,
        height: variantHeight(target, aspect),
        fit: 'fill',
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toBuffer();
    files.push({ key: r2Keys.variant(photoId, version, target), body, type: 'image/webp' });
  }
  if (usage === 'product') {
    const layout = ogLayout(width);
    const photo = await sharp(originalBuffer)
      .resize({ width: layout.size, height: layout.size })
      .toBuffer();
    const og = await sharp({
      create: {
        width: layout.canvas.width,
        height: layout.canvas.height,
        channels: 3,
        background: SOFT,
      },
    })
      .composite([{ input: photo, left: layout.x, top: layout.y }])
      .jpeg({ quality: 86 })
      .toBuffer();
    files.push({ key: r2Keys.og(photoId, version), body: og, type: 'image/jpeg' });
  }
  void aspectRatio;
  return {
    originalKey: r2Keys.original(photoId, 'webp'),
    originalWidth: width,
    originalHeight: height,
    widths,
    version,
    files,
  };
}

/** Loads the example products, their photos in R2 and the default hero into the local D1 and R2. */
async function main() {
  refuseRemote();
  const proxy = await getPlatformProxy<{ DB: D1Database; BUCKET: R2Bucket }>({
    configPath: join(root, 'wrangler.jsonc'),
  });
  try {
    const { DB, BUCKET } = proxy.env;
    const db = drizzle(DB, { schema });

    if (args.has('--if-empty')) {
      const [row] = await db.select({ n: count() }).from(schema.products);
      if ((row?.n ?? 0) > 0) {
        console.log('seed: the local database already has products, nothing to do.');
        return;
      }
    }

    // Start from nothing: tables first, then every photo file.
    await db.batch([
      db.delete(schema.heroSlides),
      db.delete(schema.photos),
      db.delete(schema.products),
      db.delete(schema.settings),
    ]);
    let cursor: string | undefined;
    do {
      const page = await BUCKET.list(cursor ? { prefix: 'ph/', cursor } : { prefix: 'ph/' });
      if (page.objects.length > 0) await BUCKET.delete(page.objects.map((o) => o.key));
      cursor = page.truncated ? page.cursor : undefined;
    } while (cursor);

    // `--many` repeats the examples up to 200 products for the performance test.
    const many = args.has('--many');
    const list = many
      ? Array.from({ length: 200 }, (_, i) => {
          const base = seedProducts[i % seedProducts.length];
          if (!base) throw new Error('no seed products');
          return {
            ...base,
            slug: `prueba-${i + 1}`,
            name: `Producto de prueba ${i + 1}`,
            photoPrefix: base.slug,
          };
        })
      : seedProducts;

    // Rows are collected first and inserted together at the end.
    const now = Date.now();
    const photoRows: (typeof schema.photos.$inferInsert)[] = [];
    const productRows: (typeof schema.products.$inferInsert)[] = [];
    const categoryRows: (typeof schema.productCategories.$inferInsert)[] = [];
    const colorRows: (typeof schema.productColors.$inferInsert)[] = [];
    // Processed photos by source file, so repeated examples read each file once.
    const cache = new Map<string, Stored>();

    for (const [index, p] of list.entries()) {
      const id = `seed-${p.slug}`;
      productRows.push({
        id,
        slug: p.slug,
        name: p.name,
        unitSingular: p.unit[0],
        unitPlural: p.unit[1],
        short: p.short,
        description: p.description,
        priceFromCents: p.from * 100,
        priceNote: 'Baja si pides varias.',
        size: p.size,
        material: 'PLA',
        leadTime: p.leadTime,
        personalizable: p.hint !== null,
        personalHint: p.hint ?? '',
        featured: p.featured,
        published: true,
        everPublished: true,
        sortOrder: index,
        createdAt: new Date(now),
        updatedAt: new Date(now),
      });
      for (const category of p.categories) categoryRows.push({ productId: id, category });
      p.colors.forEach((color, i) => colorRows.push({ productId: id, color, sortOrder: i }));

      for (const [order, n] of p.photos.entries()) {
        const photoId = `seed-${p.slug}-${n}`;
        const file = join(root, 'reference/seed-photos', `${p.photoPrefix ?? p.slug}-${n}.webp`);
        let stored = cache.get(file);
        if (!stored) {
          stored = await processPhoto(file, photoId, 'product');
          cache.set(file, stored);
        }
        // Same bytes, own keys: every photo id has its own files in R2.
        const base = stored;
        const originalKey = r2Keys.original(photoId, 'webp');
        await BUCKET.put(originalKey, base.files[0]?.body as Buffer, {
          httpMetadata: { contentType: 'image/webp' },
        });
        for (const f of base.files.slice(1)) {
          const key = f.key.replace(/^ph\/[^/]+\//, `ph/${photoId}/`);
          await BUCKET.put(key, f.body, {
            httpMetadata: {
              contentType: f.type,
              cacheControl: 'public, max-age=31536000, immutable',
            },
          });
        }
        photoRows.push({
          id: photoId,
          ownerType: 'product',
          ownerId: id,
          status: 'attached',
          sortOrder: order,
          originalKey,
          originalWidth: base.originalWidth,
          originalHeight: base.originalHeight,
          cropX: 0,
          cropY: 0,
          cropWidth: base.originalWidth,
          cropHeight: base.originalHeight,
          aspect: '1:1',
          version: base.version,
          widths: JSON.stringify(base.widths),
          alt: p.name,
        });
      }
    }

    // Hero: one slide with the default photos (docs/09 §4).
    // Both hero photos belong to the single slide `seed-hero-1`.
    const heroPhotos: { usage: PhotoUsage; file: string; id: string }[] = [
      { usage: 'hero_desktop', file: 'hero-escritorio.webp', id: 'seed-hero-desktop' },
      { usage: 'hero_mobile', file: 'hero-celular.webp', id: 'seed-hero-mobile' },
    ];
    for (const hp of heroPhotos) {
      const s = await processPhoto(join(root, 'reference/hero', hp.file), hp.id, hp.usage);
      for (const f of s.files) {
        await BUCKET.put(f.key, f.body, {
          httpMetadata: {
            contentType: f.type,
            cacheControl: 'public, max-age=31536000, immutable',
          },
        });
      }
      photoRows.push({
        id: hp.id,
        ownerType: hp.usage,
        ownerId: 'seed-hero-1',
        status: 'attached',
        sortOrder: 0,
        originalKey: s.originalKey,
        originalWidth: s.originalWidth,
        originalHeight: s.originalHeight,
        cropX: 0,
        cropY: 0,
        cropWidth: s.originalWidth,
        cropHeight: s.originalHeight,
        aspect: usageAspect[hp.usage],
        version: s.version,
        widths: JSON.stringify(s.widths),
        alt: 'Portada de Quick Robot',
      });
    }

    // D1 limits bound parameters per statement: insert in chunks, all in one batch.
    const chunk = <T>(items: T[], size: number) =>
      Array.from({ length: Math.ceil(items.length / size) }, (_, i) =>
        items.slice(i * size, i * size + size),
      );
    // Row-count limits per statement keep each insert under the bound-parameter limit.
    const statements = [
      ...chunk(productRows, 4).map((c) => db.insert(schema.products).values(c)),
      ...chunk(categoryRows, 40).map((c) => db.insert(schema.productCategories).values(c)),
      ...chunk(colorRows, 30).map((c) => db.insert(schema.productColors).values(c)),
      ...chunk(photoRows, 4).map((c) => db.insert(schema.photos).values(c)),
      db.insert(schema.heroSlides).values({
        id: 'seed-hero-1',
        sortOrder: 0,
        desktopPhotoId: 'seed-hero-desktop',
        mobilePhotoId: 'seed-hero-mobile',
      }),
      db.insert(schema.settings).values({ key: 'hero_interval_seconds', value: '6' }),
    ];
    await db.batch(statements as [(typeof statements)[number], ...(typeof statements)[number][]]);
    console.log(
      `seed: ${productRows.length} products, ${photoRows.length} photos and the default hero loaded (local).`,
    );
  } finally {
    await proxy.dispose();
  }
}

await main();
