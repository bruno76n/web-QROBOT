/**
 * Shared helpers of the admin service tests (they run in the Workers runtime, with local D1 and R2):
 * dependencies with a controllable clock, a full reset, photo fixtures and a valid product input.
 */

import { seedCategories } from '@/config/categories';
import { env } from 'cloudflare:workers';
import { getDb, schema } from '../db/client';
import { r2Keys, usageAspect, widthsToGenerate, wantedWidths, type PhotoUsage } from '@/lib/crop';
import type { PhotoRef, ProductInput } from '@/lib/schemas';
import type { AdminDeps } from './context';

/** Admin dependencies over the test database and bucket, with a fake clock and sequential ids (`id1`, `id2`...). */
export function makeDeps(start = 1_800_000_000_000) {
  let clock = start;
  let n = 0;
  const deps: AdminDeps = {
    db: getDb(env.DB),
    bucket: env.BUCKET,
    imgBase: '/img',
    now: () => clock,
    newId: () => `id${++n}`,
  };
  return { deps, advance: (ms: number) => (clock += ms), setNow: (ms: number) => (clock = ms) };
}

/** Empties every table and the bucket: each test starts from nothing. */
export async function resetAll() {
  const db = getDb(env.DB);
  await db.delete(schema.heroSlides);
  await db.delete(schema.photos);
  await db.delete(schema.products);
  await db.delete(schema.settings);
  // Categories are reset to the default list.
  await db.delete(schema.categories);
  await db
    .insert(schema.categories)
    .values(seedCategories.map((c, position) => ({ id: c.id, label: c.label, position })));
  await db.delete(schema.whatsappClicks);
  await db.delete(schema.learnPages); // its questions go with it
  await db.delete(schema.learnDatasets);
  await db.delete(schema.learnSources);
  await db.delete(schema.learnSearchMisses);
  let cursor: string | undefined;
  do {
    const page = await env.BUCKET.list(cursor ? { cursor } : {});
    if (page.objects.length > 0) await env.BUCKET.delete(page.objects.map((o) => o.key));
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
}

/** Pixel size of the fake original of each photo usage. */
const originalSize: Record<PhotoUsage, { width: number; height: number }> = {
  product: { width: 1000, height: 1000 },
  hero_desktop: { width: 2400, height: 1350 },
  hero_mobile: { width: 1200, height: 1600 },
};

/** Puts the files of a photo version into R2 (what the upload endpoint does). */
export async function putVersionFiles(
  id: string,
  usage: PhotoUsage,
  version: string,
  widths: number[],
) {
  for (const w of widths) await env.BUCKET.put(r2Keys.variant(id, version, w), 'webp');
  if (usage === 'product') await env.BUCKET.put(r2Keys.og(id, version), 'jpg');
}

/** Options of `seedPhoto`; everything but `id` is optional. */
export interface SeedPhotoOptions {
  id: string;
  usage?: PhotoUsage;
  status?: 'pending' | 'attached';
  ownerId?: string | null;
  version?: string;
  sortOrder?: number;
  /** Unix ms; also used as `updatedAt`. */
  createdAt?: number;
}

/** A photo as the upload endpoint leaves it: its row and its files. Returns the ref a save would send. */
export async function seedPhoto(o: SeedPhotoOptions): Promise<PhotoRef> {
  const usage = o.usage ?? 'product';
  const size = originalSize[usage];
  const version = o.version ?? 'aaaaaaaa';
  const widths = widthsToGenerate(size.width, wantedWidths[usage]);
  await getDb(env.DB)
    .insert(schema.photos)
    .values({
      id: o.id,
      ownerType: usage,
      ownerId: o.ownerId ?? null,
      status: o.status ?? 'pending',
      sortOrder: o.sortOrder ?? 0,
      originalKey: r2Keys.original(o.id, 'jpg'),
      originalWidth: size.width,
      originalHeight: size.height,
      cropX: 0,
      cropY: 0,
      cropWidth: size.width,
      cropHeight: size.height,
      aspect: usageAspect[usage],
      version,
      widths: JSON.stringify(widths),
      ...(o.createdAt
        ? { createdAt: new Date(o.createdAt), updatedAt: new Date(o.createdAt) }
        : {}),
    });
  await env.BUCKET.put(r2Keys.original(o.id, 'jpg'), 'orig');
  await putVersionFiles(o.id, usage, version, widths);
  return {
    id: o.id,
    crop: { x: 0, y: 0, width: size.width, height: size.height },
    version,
    widths,
    alt: '',
  };
}

/** Sorted R2 keys that start with `prefix`. */
export const keysUnder = async (prefix: string) =>
  (await env.BUCKET.list({ prefix })).objects.map((o) => o.key).sort();

/** A valid product input; override only what a test cares about. */
export function productInput(overrides: Partial<ProductInput> = {}): ProductInput {
  return {
    name: 'Llaveros con nombre',
    slug: '',
    unitSingular: 'llavero',
    unitPlural: 'llaveros',
    short: 'Con tu nombre.',
    description: '',
    priceFromCents: 5000,
    priceNote: 'Baja si pides varias.',
    size: '5 cm',
    material: 'PLA',
    leadTime: '2 a 4 días',
    customSize: '',
    personalizable: false,
    personalHint: '',
    featured: false,
    published: false,
    categories: ['casa'],
    colors: ['verde'],
    photos: [],
    ...overrides,
  };
}
