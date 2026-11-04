import { describe, expect, it } from 'vitest';
import { env } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { getDb, schema } from './client';

describe('settings (local D1)', () => {
  it('writes, reads and updates a value', async () => {
    const db = getDb(env.DB);
    await db.insert(schema.settings).values({ key: 'hero_interval_seconds', value: '6' });

    const [row] = await db
      .select()
      .from(schema.settings)
      .where(eq(schema.settings.key, 'hero_interval_seconds'));
    expect(row).toEqual({ key: 'hero_interval_seconds', value: '6' });

    await db
      .insert(schema.settings)
      .values({ key: 'hero_interval_seconds', value: '8' })
      .onConflictDoUpdate({ target: schema.settings.key, set: { value: '8' } });
    const all = await db.select().from(schema.settings);
    expect(all).toEqual([{ key: 'hero_interval_seconds', value: '8' }]);
  });

  it('applies several writes together in one batch (D1 has no interactive transactions)', async () => {
    const db = getDb(env.DB);
    await db.batch([
      db.insert(schema.settings).values({ key: 'a', value: '1' }),
      db.insert(schema.settings).values({ key: 'b', value: '2' }),
    ]);
    const keys = (await db.select().from(schema.settings)).map((r) => r.key).sort();
    expect(keys).toEqual(['a', 'b', 'hero_interval_seconds']);
  });

  it('rolls the whole batch back when one statement fails', async () => {
    const db = getDb(env.DB);
    await expect(
      db.batch([
        db.insert(schema.settings).values({ key: 'will-roll-back', value: 'x' }),
        db.insert(schema.settings).values({ key: 'a', value: 'duplicate key' }),
      ]),
    ).rejects.toThrow();
    const keys = (await db.select().from(schema.settings)).map((r) => r.key);
    expect(keys).not.toContain('will-roll-back');
  });
});
