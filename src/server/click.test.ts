import { beforeEach, describe, expect, it } from 'vitest';
import { env } from 'cloudflare:workers';
import { getDb, schema } from './db/client';
import { clickInputSchema } from '@/lib/schemas';
import { clickStats, dayKey, recordClick } from './clicks';
import { makeDeps, productInput, resetAll } from './admin/test-utils';
import { saveProduct } from './admin/products';

const TZ = 'America/Mexico_City';
const db = () => getDb(env.DB);
const day = (iso: string) => new Date(`${iso}T18:00:00Z`);

beforeEach(resetAll);

describe('clickInputSchema', () => {
  it('accepts the four sources and rejects anything else', () => {
    expect(clickInputSchema.safeParse({ source: 'order' }).success).toBe(true);
    expect(clickInputSchema.safeParse({ source: 'q404' }).success).toBe(true);
    expect(clickInputSchema.safeParse({ source: 'customizer' }).success).toBe(true);
    expect(clickInputSchema.safeParse({ source: 'product', productId: 'p1' }).success).toBe(true);
    expect(clickInputSchema.safeParse({ source: 'other' }).success).toBe(false);
    expect(clickInputSchema.safeParse({}).success).toBe(false);
  });
  it('requires a product id only for product taps', () => {
    expect(clickInputSchema.safeParse({ source: 'product' }).success).toBe(false);
    expect(clickInputSchema.safeParse({ source: 'order', productId: 'p1' }).success).toBe(false);
  });
});

describe('recordClick / clickStats', () => {
  it('adds one per tap on the same day, source and product', async () => {
    await recordClick(db(), { source: 'order' }, day('2026-11-04'), TZ);
    await recordClick(db(), { source: 'order' }, day('2026-11-04'), TZ);
    const rows = await db().select().from(schema.whatsappClicks);
    expect(rows).toEqual([{ day: '2026-11-04', source: 'order', productId: '', count: 2 }]);
  });

  it('does not count a product that does not exist', async () => {
    expect(await recordClick(db(), { source: 'product', productId: 'nope' }, new Date(), TZ)).toBe(
      false,
    );
    expect(await db().select().from(schema.whatsappClicks)).toHaveLength(0);
  });

  it('stores nothing that identifies the person (only day, source, product, count)', async () => {
    await recordClick(db(), { source: 'q404' }, new Date(), TZ);
    const [row] = await db().select().from(schema.whatsappClicks);
    expect(Object.keys(row ?? {}).sort()).toEqual(['count', 'day', 'productId', 'source']);
  });

  it('sums the last N days by source and product', async () => {
    const t = makeDeps();
    const saved = await saveProduct(t.deps, productInput());
    if (!saved.ok) throw new Error('product');
    const id = saved.data.id;
    const now = day('2026-11-04');
    await recordClick(db(), { source: 'product', productId: id }, now, TZ);
    await recordClick(db(), { source: 'product', productId: id }, day('2026-10-10'), TZ);
    await recordClick(db(), { source: 'product', productId: id }, day('2026-08-01'), TZ); // too old
    await recordClick(db(), { source: 'order' }, now, TZ);
    const stats = await clickStats(db(), 30, now, TZ);
    expect(stats.total).toBe(3);
    expect(stats.bySource).toEqual({ product: 2, order: 1, q404: 0, customizer: 0 });
    expect(stats.byProduct).toEqual({ [id]: 2 });
  });

  it('uses the business day, not UTC', () => {
    // 03:00 UTC on the 5th is still the 4th evening in Guadalajara.
    expect(dayKey(new Date('2026-11-05T03:00:00Z'), TZ)).toBe('2026-11-04');
  });
});
