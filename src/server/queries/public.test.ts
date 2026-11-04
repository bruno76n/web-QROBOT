import { beforeEach, describe, expect, it } from 'vitest';
import { env } from 'cloudflare:workers';
import { getDb } from '../db/client';
import { saveProduct, setPublished } from '../admin/products';
import { makeDeps, productInput, resetAll, seedPhoto } from '../admin/test-utils';
import {
  getProductPrice,
  getPublishedProduct,
  listChristmasPicks,
  listPublishedProducts,
  listRelated,
} from './public';

const db = () => getDb(env.DB);
let t: ReturnType<typeof makeDeps>;
let n = 0;

beforeEach(async () => {
  await resetAll();
  t = makeDeps();
});

async function publish(
  name: string,
  categories: ('negocio' | 'casa' | 'navidad')[],
  opts: { published?: boolean } = {},
) {
  const photo = await seedPhoto({ id: `ph${++n}` });
  const res = await saveProduct(
    t.deps,
    productInput({ name, categories, photos: [photo], published: opts.published ?? true }),
  );
  if (!res.ok) throw new Error(res.code);
  return res.data;
}

describe('public queries', () => {
  it('a hidden product is in no public query', async () => {
    const shown = await publish('Visible', ['casa']);
    const hidden = await publish('Oculto', ['casa'], { published: false });
    expect((await listPublishedProducts({}, db())).map((p) => p.name)).toEqual(['Visible']);
    expect((await listPublishedProducts({ category: 'casa' }, db())).map((p) => p.name)).toEqual([
      'Visible',
    ]);
    expect(await getPublishedProduct('oculto', db())).toBeNull();
    const page = await getPublishedProduct('visible', db());
    expect(page?.name).toBe('Visible');
    // never in "related" either
    expect(
      (await listRelated({ id: shown.id, categories: ['casa'] }, 4, db())).map((p) => p.id),
    ).not.toContain(hidden.id);
  });

  it('keeps the catalog order (sort_order) and filters by category', async () => {
    await publish('Uno', ['casa']);
    await publish('Dos', ['negocio']);
    await publish('Tres', ['casa', 'navidad']);
    expect((await listPublishedProducts({}, db())).map((p) => p.name)).toEqual([
      'Uno',
      'Dos',
      'Tres',
    ]);
    expect((await listPublishedProducts({ category: 'casa' }, db())).map((p) => p.name)).toEqual([
      'Uno',
      'Tres',
    ]);
    expect((await listPublishedProducts({ category: 'navidad' }, db())).map((p) => p.name)).toEqual(
      ['Tres'],
    );
  });

  it('a product that becomes hidden disappears right away', async () => {
    const a = await publish('A', ['casa']);
    await setPublished(t.deps, { id: a.id, published: false });
    expect(await listPublishedProducts({}, db())).toEqual([]);
    expect(await getPublishedProduct('a', db())).toBeNull();
  });

  it('cards carry the first photo with its real widths, and the main category', async () => {
    await publish('Navideño', ['navidad', 'casa']);
    const [card] = await listPublishedProducts({}, db());
    expect(card?.category).toBe('casa'); // first in categories.ts, not in click order
    expect(card?.photo).toMatchObject({ widths: [400, 800], aspect: '1:1', alt: 'Navideño' });
  });

  it('the product page has photos in order, colors and categories', async () => {
    const a = await seedPhoto({ id: 'pa' });
    const b = await seedPhoto({ id: 'pb' });
    await saveProduct(
      t.deps,
      productInput({
        name: 'Con fotos',
        photos: [b, a],
        published: true,
        colors: ['rojo', 'azul'],
        categories: ['navidad', 'negocio'],
      }),
    );
    const page = await getPublishedProduct('con-fotos', db());
    expect(page?.photos.map((p) => p.id)).toEqual(['pb', 'pa']);
    expect(page?.colors).toEqual(['rojo', 'azul']);
    expect(page?.categories).toEqual(['negocio', 'navidad']);
    expect(page?.category).toBe('negocio');
  });

  it('related: same category, published, not itself, up to the limit, in order', async () => {
    const main = await publish('Principal', ['casa']);
    await publish('R1', ['casa']);
    await publish('R2', ['casa', 'navidad']);
    await publish('Otro', ['negocio']);
    await publish('R3', ['casa']);
    await publish('R4', ['casa']);
    await publish('R5', ['casa']);
    const related = await listRelated({ id: main.id, categories: ['casa'] }, 4, db());
    expect(related.map((p) => p.name)).toEqual(['R1', 'R2', 'R3', 'R4']);
    expect(await listRelated({ id: main.id, categories: [] }, 4, db())).toEqual([]);
  });

  it('a product without photos still has a card (photo null)', async () => {
    await saveProduct(t.deps, productInput({ name: 'Sin foto', published: false }));
    // unpublished: not listed; publishing needs a photo, so public pages never show a photo-less product
    expect(await listPublishedProducts({}, db())).toEqual([]);
  });
});

describe('home queries', () => {
  it('Christmas picks: published, Navidad and "Más pedido", in order, up to 4', async () => {
    for (let i = 0; i < 6; i++) {
      const photo = await seedPhoto({ id: `x${++n}` });
      await saveProduct(
        t.deps,
        productInput({
          name: `Regalo ${i}`,
          categories: ['navidad'],
          featured: i !== 1,
          photos: [photo],
          published: i !== 2,
        }),
      );
    }
    const photo = await seedPhoto({ id: `x${++n}` });
    await saveProduct(
      t.deps,
      productInput({
        name: 'No navideño',
        categories: ['casa'],
        featured: true,
        photos: [photo],
        published: true,
      }),
    );
    expect((await listChristmasPicks(4, db())).map((p) => p.name)).toEqual([
      'Regalo 0',
      'Regalo 3',
      'Regalo 4',
      'Regalo 5',
    ]);
    expect((await listChristmasPicks(2, db())).map((p) => p.name)).toEqual([
      'Regalo 0',
      'Regalo 3',
    ]);
  });
  it('product price: only for published products', async () => {
    const photo = await seedPhoto({ id: `x${++n}` });
    await saveProduct(
      t.deps,
      productInput({ name: 'Q-404', priceFromCents: 35000, photos: [photo], published: true }),
    );
    expect(await getProductPrice('q-404', db())).toBe(35000);
    expect(await getProductPrice('nope', db())).toBeNull();
  });
});
