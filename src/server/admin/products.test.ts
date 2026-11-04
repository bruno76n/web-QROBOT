import { beforeEach, describe, expect, it } from 'vitest';
import { env } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '../db/client';
import { getProductForAdmin, listAllProductsForAdmin } from '../queries/products';
import {
  deleteProduct,
  duplicateProduct,
  reorderProducts,
  saveProduct,
  setPublished,
} from './products';
import {
  keysUnder,
  makeDeps,
  productInput,
  putVersionFiles,
  resetAll,
  seedPhoto,
} from './test-utils';

const db = () => getDb(env.DB);
const row = async (id: string) =>
  (await db().select().from(schema.products).where(eq(schema.products.id, id)))[0];

let t: ReturnType<typeof makeDeps>;
beforeEach(async () => {
  await resetAll();
  t = makeDeps();
});

async function create(overrides: Parameters<typeof productInput>[0] = {}) {
  const res = await saveProduct(t.deps, productInput(overrides));
  if (!res.ok) throw new Error(`create failed: ${res.code}`);
  return res.data;
}

describe('saveProduct · create', () => {
  it('saves an incomplete draft (no photo, no price) with a generated slug', async () => {
    const res = await saveProduct(t.deps, productInput({ priceFromCents: null, categories: [] }));
    expect(res).toMatchObject({ ok: true, data: { slug: 'llaveros-con-nombre' } });
    const p = await row((res as { data: { id: string } }).data.id);
    expect(p).toMatchObject({
      published: false,
      everPublished: false,
      priceFromCents: null,
      sortOrder: 0,
    });
  });

  it('puts the new product at the end of the catalog', async () => {
    const a = await create({ name: 'A' });
    const b = await create({ name: 'B' });
    expect((await row(a.id))?.sortOrder).toBe(0);
    expect((await row(b.id))?.sortOrder).toBe(1);
  });

  it('stores categories and colors in order', async () => {
    const { id } = await create({
      categories: ['navidad', 'casa'],
      colors: ['rojo', 'verde', 'azul'],
    });
    const detail = await getProductForAdmin(id, db(), '/img');
    expect(detail?.categories).toEqual(['casa', 'navidad']); // catalog order, not click order
    expect(detail?.colors).toEqual(['rojo', 'verde', 'azul']);
  });

  it('attaches pending photos in order and the first one becomes the card photo', async () => {
    const p1 = await seedPhoto({ id: 'ph1' });
    const p2 = await seedPhoto({ id: 'ph2' });
    const { id } = await create({ photos: [p2, p1] });
    const detail = await getProductForAdmin(id, db(), '/img');
    expect(detail?.photos.map((p) => p.id)).toEqual(['ph2', 'ph1']);
    const rows = await db().select().from(schema.photos);
    expect(rows.every((r) => r.status === 'attached' && r.ownerId === id)).toBe(true);
    expect(detail?.photos[0]?.urls).toEqual({
      '400': '/img/ph/ph2/aaaaaaaa/400.webp',
      '800': '/img/ph/ph2/aaaaaaaa/800.webp',
    });
    expect(detail?.photos[0]?.ogUrl).toBe('/img/ph/ph2/aaaaaaaa/og.jpg');
  });
});

describe('saveProduct · publishing rules', () => {
  it('cannot publish without photo, category, price or name — and writes nothing', async () => {
    const res = await saveProduct(
      t.deps,
      productInput({ published: true, priceFromCents: null, categories: [], photos: [] }),
    );
    expect(res).toEqual({
      ok: false,
      code: 'CANNOT_PUBLISH',
      details: { missing: ['photo', 'category', 'price'] },
    });
    expect(await db().select().from(schema.products)).toEqual([]);
  });

  it('publishes when it has everything, and remembers it was published', async () => {
    const photo = await seedPhoto({ id: 'ph1' });
    const { id } = await create({ published: true, photos: [photo] });
    expect(await row(id)).toMatchObject({ published: true, everPublished: true });
  });

  it('a photo failure on a publish attempt leaves the photos pending', async () => {
    const photo = await seedPhoto({ id: 'ph1' });
    const res = await saveProduct(
      t.deps,
      productInput({ published: true, priceFromCents: null, photos: [photo] }),
    );
    expect(res.ok).toBe(false);
    const [ph] = await db().select().from(schema.photos);
    expect(ph?.status).toBe('pending');
  });
});

describe('saveProduct · slugs', () => {
  it('adds -2 when the generated slug is taken', async () => {
    await create({ name: 'Gato' });
    const second = await create({ name: 'Gato' });
    expect(second.slug).toBe('gato-2');
  });

  it('SLUG_TAKEN when a slug typed by hand belongs to another product', async () => {
    await create({ name: 'Gato' });
    const res = await saveProduct(t.deps, productInput({ name: 'Perro', slug: 'gato' }));
    expect(res).toEqual({ ok: false, code: 'SLUG_TAKEN' });
  });

  it('keeps its own slug when saving again with it', async () => {
    const { id } = await create({ name: 'Gato', slug: 'mi-gato' });
    const res = await saveProduct(t.deps, productInput({ id, name: 'Gato', slug: 'mi-gato' }));
    expect(res).toMatchObject({ ok: true, data: { slug: 'mi-gato' } });
  });

  it('follows the name while it was never published, and stops once it was', async () => {
    const photo = await seedPhoto({ id: 'ph1' });
    const draft = await create({ name: 'Nombre uno' });
    const renamed = await saveProduct(t.deps, productInput({ id: draft.id, name: 'Nombre dos' }));
    expect(renamed).toMatchObject({ ok: true, data: { slug: 'nombre-dos' } });

    const published = await saveProduct(
      t.deps,
      productInput({ id: draft.id, name: 'Nombre dos', published: true, photos: [photo] }),
    );
    expect(published.ok).toBe(true);
    const again = await saveProduct(
      t.deps,
      productInput({ id: draft.id, name: 'Nombre tres', published: false }),
    );
    expect(again).toMatchObject({ ok: true, data: { slug: 'nombre-dos' } }); // links already shared keep working
    const byHand = await saveProduct(
      t.deps,
      productInput({ id: draft.id, name: 'Nombre tres', slug: 'nuevo-link' }),
    );
    expect(byHand).toMatchObject({ ok: true, data: { slug: 'nuevo-link' } });
  });
});

describe('saveProduct · photos', () => {
  it('removing a photo deletes its row and its files', async () => {
    const a = await seedPhoto({ id: 'pha' });
    const b = await seedPhoto({ id: 'phb' });
    const { id } = await create({ photos: [a, b] });
    expect((await keysUnder('ph/phb/')).length).toBeGreaterThan(0);

    const res = await saveProduct(t.deps, productInput({ id, photos: [a] }));
    expect(res.ok).toBe(true);
    expect((await getProductForAdmin(id, db(), '/img'))?.photos.map((p) => p.id)).toEqual(['pha']);
    expect(await keysUnder('ph/phb/')).toEqual([]);
    expect((await keysUnder('ph/pha/')).length).toBeGreaterThan(0);
  });

  it('reordering photos rewrites their order and the alt text', async () => {
    const a = await seedPhoto({ id: 'pha' });
    const b = await seedPhoto({ id: 'phb' });
    const { id } = await create({ photos: [a, b] });
    await saveProduct(t.deps, productInput({ id, photos: [{ ...b, alt: 'Vista de lado' }, a] }));
    const detail = await getProductForAdmin(id, db(), '/img');
    expect(detail?.photos.map((p) => [p.id, p.alt])).toEqual([
      ['phb', 'Vista de lado'],
      ['pha', ''],
    ]);
  });

  it('re-centering applies the new crop and version and deletes the old files', async () => {
    const a = await seedPhoto({ id: 'pha', version: 'aaaaaaaa' });
    const { id } = await create({ photos: [a] });
    // the panel re-centers: uploads new versions first, then saves
    await putVersionFiles('pha', 'product', 'bbbbbbbb', [400, 800]);
    const recentered = { ...a, version: 'bbbbbbbb', crop: { x: 0, y: 0, width: 800, height: 800 } };
    const res = await saveProduct(t.deps, productInput({ id, photos: [recentered] }));
    expect(res.ok).toBe(true);
    const [ph] = await db().select().from(schema.photos).where(eq(schema.photos.id, 'pha'));
    expect(ph).toMatchObject({ version: 'bbbbbbbb', cropWidth: 800, widths: '[400,800]' });
    expect(await keysUnder('ph/pha/aaaaaaaa/')).toEqual([]);
    expect((await keysUnder('ph/pha/bbbbbbbb/')).length).toBe(3);
    expect(await env.BUCKET.head('ph/pha/original.jpg')).not.toBeNull(); // the original stays
  });

  it('PHOTO_NOT_FOUND for unknown photos, photos of another product, or versions never uploaded', async () => {
    const other = await seedPhoto({ id: 'mine' });
    await create({ name: 'Otro', photos: [other] });
    const ghost = { ...other, id: 'ghost' };
    expect(await saveProduct(t.deps, productInput({ photos: [ghost] }))).toEqual({
      ok: false,
      code: 'PHOTO_NOT_FOUND',
    });
    expect(await saveProduct(t.deps, productInput({ name: 'Nuevo', photos: [other] }))).toEqual({
      ok: false,
      code: 'PHOTO_NOT_FOUND',
    });
    const notUploaded = { ...other, version: 'cccccccc' };
    const { id } = await create({ name: 'Tercero' });
    void id;
    const mine = (
      await db().select().from(schema.products).where(eq(schema.products.name, 'Otro'))
    )[0];
    expect(
      await saveProduct(
        t.deps,
        productInput({ id: mine?.id as string, name: 'Otro', photos: [notUploaded] }),
      ),
    ).toEqual({
      ok: false,
      code: 'PHOTO_NOT_FOUND',
    });
  });

  it('a hero photo cannot be attached to a product', async () => {
    const hero = await seedPhoto({ id: 'hero1', usage: 'hero_desktop' });
    expect(await saveProduct(t.deps, productInput({ photos: [hero] }))).toEqual({
      ok: false,
      code: 'PHOTO_NOT_FOUND',
    });
  });

  it('TOO_MANY_PHOTOS above 10', async () => {
    const photos = [];
    for (let i = 0; i < 11; i++) photos.push(await seedPhoto({ id: `p${i}` }));
    expect(await saveProduct(t.deps, productInput({ photos }))).toEqual({
      ok: false,
      code: 'TOO_MANY_PHOTOS',
    });
    expect(await saveProduct(t.deps, productInput({ photos: photos.slice(0, 10) }))).toMatchObject({
      ok: true,
    });
  });

  it('VALIDATION when a re-centered crop does not fit the original or its widths', async () => {
    const a = await seedPhoto({ id: 'pha' });
    const { id } = await create({ photos: [a] });
    await putVersionFiles('pha', 'product', 'dddddddd', [400, 800]);
    const outside = { ...a, version: 'dddddddd', crop: { x: 500, y: 0, width: 800, height: 800 } };
    expect(await saveProduct(t.deps, productInput({ id, photos: [outside] }))).toMatchObject({
      ok: false,
      code: 'VALIDATION',
    });
    const wrongWidths = { ...a, version: 'dddddddd', widths: [400, 800, 1200] };
    expect(await saveProduct(t.deps, productInput({ id, photos: [wrongWidths] }))).toMatchObject({
      ok: false,
      code: 'VALIDATION',
    });
  });
});

describe('saveProduct · errors and atomicity', () => {
  it('NOT_FOUND for an id that does not exist', async () => {
    expect(await saveProduct(t.deps, productInput({ id: 'nope' }))).toEqual({
      ok: false,
      code: 'NOT_FOUND',
    });
  });

  it('a batch that fails halfway writes nothing at all', async () => {
    const photo = await seedPhoto({ id: 'ph1' });
    // Repeated categories break the primary key in the middle of the batch
    // (the Zod schema rejects them earlier; this proves the batch is all-or-nothing).
    await expect(
      saveProduct(t.deps, productInput({ categories: ['casa', 'casa'], photos: [photo] })),
    ).rejects.toThrow();
    expect(await db().select().from(schema.products)).toEqual([]);
    expect(await db().select().from(schema.productCategories)).toEqual([]);
    const [ph] = await db().select().from(schema.photos);
    expect(ph).toMatchObject({ status: 'pending', ownerId: null });
    expect((await keysUnder('ph/ph1/')).length).toBeGreaterThan(0); // files untouched
  });

  it('stores markup as plain text', async () => {
    const { id } = await create({ name: '<script>alert(1)</script>', short: '"><img onerror=x>' });
    const detail = await getProductForAdmin(id, db(), '/img');
    expect(detail?.name).toBe('<script>alert(1)</script>');
    expect(detail?.short).toBe('"><img onerror=x>');
  });

  it('an injection attempt in text fields does not touch the database', async () => {
    await create({ name: "x'; DROP TABLE products; --" });
    expect((await db().select().from(schema.products)).length).toBe(1);
  });
});

describe('setPublished', () => {
  it('NOT_FOUND', async () => {
    expect(await setPublished(t.deps, { id: 'nope', published: true })).toEqual({
      ok: false,
      code: 'NOT_FOUND',
    });
  });
  it('CANNOT_PUBLISH lists what is missing and leaves the product hidden', async () => {
    const { id } = await create({ priceFromCents: null, categories: [] });
    expect(await setPublished(t.deps, { id, published: true })).toEqual({
      ok: false,
      code: 'CANNOT_PUBLISH',
      details: { missing: ['photo', 'category', 'price'] },
    });
    expect((await row(id))?.published).toBe(false);
  });
  it('publishes and hides again', async () => {
    const photo = await seedPhoto({ id: 'ph1' });
    const { id } = await create({ photos: [photo] });
    expect(await setPublished(t.deps, { id, published: true })).toMatchObject({ ok: true });
    expect(await row(id)).toMatchObject({ published: true, everPublished: true });
    await setPublished(t.deps, { id, published: false });
    expect(await row(id)).toMatchObject({ published: false, everPublished: true });
  });
});

describe('reorderProducts', () => {
  it('rewrites sort_order 0…N in the order received', async () => {
    const a = await create({ name: 'A' });
    const b = await create({ name: 'B' });
    const c = await create({ name: 'C' });
    expect(await reorderProducts(t.deps, { ids: [c.id, a.id, b.id] })).toEqual({
      ok: true,
      data: { count: 3 },
    });
    const list = await listAllProductsForAdmin(db(), '/img');
    expect(list.map((p) => [p.name, p.sortOrder])).toEqual([
      ['C', 0],
      ['A', 1],
      ['B', 2],
    ]);
  });
  it('ignores unknown ids and keeps unlisted products after the listed ones', async () => {
    const a = await create({ name: 'A' });
    const b = await create({ name: 'B' });
    const c = await create({ name: 'C' });
    await reorderProducts(t.deps, { ids: [c.id, 'ghost'] });
    expect((await listAllProductsForAdmin(db(), '/img')).map((p) => p.id)).toEqual([
      c.id,
      a.id,
      b.id,
    ]);
  });
  it('VALIDATION on repeated ids', async () => {
    const a = await create({ name: 'A' });
    expect(await reorderProducts(t.deps, { ids: [a.id, a.id] })).toMatchObject({
      ok: false,
      code: 'VALIDATION',
    });
  });
});

describe('duplicateProduct', () => {
  it('copies the data, categories and colors but not the photos, and starts hidden', async () => {
    const photo = await seedPhoto({ id: 'ph1' });
    const orig = await create({
      published: true,
      featured: true,
      photos: [photo],
      categories: ['casa', 'navidad'],
      colors: ['azul'],
    });
    const res = await duplicateProduct(t.deps, { id: orig.id });
    expect(res).toMatchObject({ ok: true, data: { slug: 'llaveros-con-nombre-copia' } });
    const copyId = (res as { data: { id: string } }).data.id;
    const copy = await getProductForAdmin(copyId, db(), '/img');
    expect(copy).toMatchObject({
      name: 'Llaveros con nombre (copia)',
      published: false,
      everPublished: false,
      featured: true,
      categories: ['casa', 'navidad'],
      colors: ['azul'],
      priceFromCents: 5000,
      photos: [],
    });
    expect((await getProductForAdmin(orig.id, db(), '/img'))?.photos).toHaveLength(1);
    expect((await row(copyId))?.sortOrder).toBe(1);
  });
  it('a second copy gets its own slug', async () => {
    const orig = await create();
    await duplicateProduct(t.deps, { id: orig.id });
    const second = await duplicateProduct(t.deps, { id: orig.id });
    expect(second).toMatchObject({ ok: true, data: { slug: 'llaveros-con-nombre-copia-2' } });
  });
  it('NOT_FOUND', async () => {
    expect(await duplicateProduct(t.deps, { id: 'nope' })).toEqual({
      ok: false,
      code: 'NOT_FOUND',
    });
  });
});

describe('deleteProduct', () => {
  it('deletes the product, its rows and its photo files, and leaves the others alone', async () => {
    const a = await seedPhoto({ id: 'pha' });
    const b = await seedPhoto({ id: 'phb' });
    const keep = await create({ name: 'Se queda', photos: [b] });
    const gone = await create({ name: 'Se va', photos: [a], colors: ['rojo'] });
    expect(await deleteProduct(t.deps, { id: gone.id })).toEqual({
      ok: true,
      data: { id: gone.id },
    });
    expect(await row(gone.id)).toBeUndefined();
    expect(await db().select().from(schema.photos).where(eq(schema.photos.id, 'pha'))).toEqual([]);
    expect(
      (await db().select().from(schema.productColors)).filter((c) => c.productId === gone.id),
    ).toEqual([]);
    expect(await keysUnder('ph/pha/')).toEqual([]);
    expect((await keysUnder('ph/phb/')).length).toBeGreaterThan(0);
    expect(await row(keep.id)).toBeDefined();
  });
  it('NOT_FOUND', async () => {
    expect(await deleteProduct(t.deps, { id: 'nope' })).toEqual({ ok: false, code: 'NOT_FOUND' });
  });
});

describe('queries for the panel', () => {
  it('lists products in catalog order with status, categories, photo count and thumbnail', async () => {
    const photo = await seedPhoto({ id: 'ph1' });
    await create({
      name: 'Con foto',
      photos: [photo],
      categories: ['navidad', 'negocio'],
      published: true,
    });
    await create({ name: 'Sin foto', priceFromCents: null });
    const list = await listAllProductsForAdmin(db(), '/img');
    expect(list).toHaveLength(2);
    expect(list[0]).toMatchObject({
      name: 'Con foto',
      published: true,
      categories: ['negocio', 'navidad'],
      photoCount: 1,
      thumbUrl: '/img/ph/ph1/aaaaaaaa/400.webp',
    });
    expect(list[1]).toMatchObject({
      name: 'Sin foto',
      photoCount: 0,
      thumbUrl: null,
      priceFromCents: null,
    });
  });
  it('an empty catalog is an empty list, and a missing product is null', async () => {
    expect(await listAllProductsForAdmin(db(), '/img')).toEqual([]);
    expect(await getProductForAdmin('nope', db(), '/img')).toBeNull();
  });
  it('lists 200 products (more than one chunk of ids)', async () => {
    for (let i = 0; i < 200; i++) await create({ name: `Producto ${i}` });
    const list = await listAllProductsForAdmin(db(), '/img');
    expect(list).toHaveLength(200);
    expect(list[199]?.sortOrder).toBe(199);
  }, 120_000);
});
