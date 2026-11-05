import { beforeEach, describe, expect, it } from 'vitest';
import { env } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '../db/client';
import { listCategories } from '../queries/categories';
import { listPublishedProducts } from '../queries/public';
import { createCategory, deleteCategory, renameCategory, reorderCategories } from './categories';
import { saveProduct } from './products';
import { makeDeps, productInput, resetAll, seedPhoto } from './test-utils';

const db = () => getDb(env.DB);
let t: ReturnType<typeof makeDeps>;
beforeEach(async () => {
  await resetAll();
  t = makeDeps();
});

const ids = async () => (await listCategories(db())).map((c) => c.id);

describe('categories · seed', () => {
  it('starts with the three the migration creates, in order', async () => {
    expect(await ids()).toEqual(['negocio', 'casa', 'navidad']);
  });
});

describe('createCategory', () => {
  it('adds one at the end with an id made from the name', async () => {
    const res = await createCategory(t.deps, { label: 'Para la oficina' });
    expect(res).toEqual({ ok: true, data: { id: 'para-la-oficina' } });
    expect(await ids()).toEqual(['negocio', 'casa', 'navidad', 'para-la-oficina']);
  });
  it('keeps ids unique', async () => {
    const res = await createCategory(t.deps, { label: 'Casa' });
    expect(res).toEqual({ ok: true, data: { id: 'casa-2' } });
  });
});

describe('renameCategory', () => {
  it('changes the label but not the id', async () => {
    expect(await renameCategory(t.deps, { id: 'casa', label: 'Hogar' })).toMatchObject({
      ok: true,
    });
    expect((await listCategories(db())).find((c) => c.id === 'casa')?.label).toBe('Hogar');
  });
  it('NOT_FOUND for an unknown id', async () => {
    expect(await renameCategory(t.deps, { id: 'nada', label: 'X' })).toMatchObject({
      ok: false,
      code: 'NOT_FOUND',
    });
  });
});

describe('reorderCategories', () => {
  it('rewrites the order', async () => {
    await reorderCategories(t.deps, { ids: ['navidad', 'casa', 'negocio'] });
    expect(await ids()).toEqual(['navidad', 'casa', 'negocio']);
  });
  it('ignores unknown ids and keeps the missing ones at the end', async () => {
    await reorderCategories(t.deps, { ids: ['casa', 'zzz'] });
    expect(await ids()).toEqual(['casa', 'negocio', 'navidad']);
  });
});

describe('deleteCategory', () => {
  it('removes the category and its links, and closes the gap in positions', async () => {
    const res = await saveProduct(t.deps, productInput({ categories: ['casa', 'negocio'] }));
    if (!res.ok) throw new Error(res.code);
    expect(await deleteCategory(t.deps, { id: 'casa' })).toMatchObject({ ok: true });
    expect(await ids()).toEqual(['negocio', 'navidad']);
    const links = await db()
      .select()
      .from(schema.productCategories)
      .where(eq(schema.productCategories.productId, res.data.id));
    expect(links.map((l) => l.category)).toEqual(['negocio']);
    const positions = (await db().select().from(schema.categories)).map((c) => c.position).sort();
    expect(positions).toEqual([0, 1]);
  });

  it('refuses Navidad', async () => {
    expect(await deleteCategory(t.deps, { id: 'navidad' })).toMatchObject({
      ok: false,
      code: 'CATEGORY_PROTECTED',
    });
  });

  it('refuses when a published product would be left without category', async () => {
    const photo = await seedPhoto({ id: 'ph1' });
    const saved = await saveProduct(
      t.deps,
      productInput({ name: 'Solo casa', categories: ['casa'], photos: [photo], published: true }),
    );
    if (!saved.ok) throw new Error(saved.code);
    expect(await deleteCategory(t.deps, { id: 'casa' })).toEqual({
      ok: false,
      code: 'CATEGORY_IN_USE',
      details: { products: ['Solo casa'] },
    });
    expect(await ids()).toContain('casa');
  });

  it('a hidden product with only that category may lose it (it stays a draft)', async () => {
    await saveProduct(t.deps, productInput({ categories: ['casa'] }));
    expect(await deleteCategory(t.deps, { id: 'casa' })).toMatchObject({ ok: true });
  });

  it('NOT_FOUND for an unknown id', async () => {
    expect(await deleteCategory(t.deps, { id: 'nada' })).toMatchObject({
      ok: false,
      code: 'NOT_FOUND',
    });
  });
});

describe('a new category works end to end', () => {
  it('a product saved in it shows up when listing that category', async () => {
    const created = await createCategory(t.deps, { label: 'Para la oficina' });
    if (!created.ok) throw new Error(created.code);
    const photo = await seedPhoto({ id: 'ph1' });
    const saved = await saveProduct(
      t.deps,
      productInput({ categories: [created.data.id], photos: [photo], published: true }),
    );
    expect(saved.ok).toBe(true);
    const list = await listPublishedProducts({ category: created.data.id }, db());
    expect(list).toHaveLength(1);
    expect(list[0]?.category).toBe('para-la-oficina');
  });
});

describe('saveProduct · categories', () => {
  it('UNKNOWN_CATEGORY when an id is not in the table', async () => {
    expect(await saveProduct(t.deps, productInput({ categories: ['inventada'] }))).toMatchObject({
      ok: false,
      code: 'UNKNOWN_CATEGORY',
    });
  });
});
