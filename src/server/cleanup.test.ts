import { beforeEach, describe, expect, it } from 'vitest';
import { env } from 'cloudflare:workers';
import { getDb, schema } from './db/client';
import { cleanupPending } from './cleanup';
import { exportBackup } from './admin/backup';
import { saveProduct } from './admin/products';
import { keysUnder, makeDeps, productInput, resetAll, seedPhoto } from './admin/test-utils';

const HOUR = 3600 * 1000;
let t: ReturnType<typeof makeDeps>;
beforeEach(async () => {
  await resetAll();
  t = makeDeps(1_800_000_000_000);
});

describe('cleanupPending', () => {
  it('removes pending photos older than 24 h (row and files) and keeps the rest', async () => {
    const now = 1_800_000_000_000;
    await seedPhoto({ id: 'old', createdAt: now - 25 * HOUR });
    await seedPhoto({ id: 'fresh', createdAt: now - 23 * HOUR });
    await seedPhoto({
      id: 'attached-old',
      status: 'attached',
      ownerId: 'p',
      createdAt: now - 90 * 24 * HOUR,
    });
    expect(await cleanupPending(t.deps)).toEqual({ removed: 1 });
    const left = (await getDb(env.DB).select().from(schema.photos)).map((p) => p.id).sort();
    expect(left).toEqual(['attached-old', 'fresh']);
    expect(await keysUnder('ph/old/')).toEqual([]);
    expect((await keysUnder('ph/fresh/')).length).toBeGreaterThan(0);
  });
  it('does nothing when there is nothing to remove', async () => {
    expect(await cleanupPending(t.deps)).toEqual({ removed: 0 });
  });
});

describe('exportBackup', () => {
  it('has version 1 and every table, without the files', async () => {
    const photo = await seedPhoto({ id: 'ph1' });
    await saveProduct(
      t.deps,
      productInput({ photos: [photo], colors: ['rojo'], categories: ['casa', 'navidad'] }),
    );
    await getDb(env.DB)
      .insert(schema.settings)
      .values({ key: 'hero_interval_seconds', value: '8' });
    const backup = await exportBackup(t.deps);
    expect(backup.version).toBe(1);
    expect(backup.exportedAt).toBe(new Date(1_800_000_000_000).toISOString());
    expect(backup.products).toHaveLength(1);
    expect(backup.categories.map((c) => c.category).sort()).toEqual(['casa', 'navidad']);
    expect(backup.colors).toHaveLength(1);
    expect(backup.photos).toHaveLength(1);
    expect(backup.photos[0]).toMatchObject({ id: 'ph1', status: 'attached' });
    expect(backup.settings).toEqual([{ key: 'hero_interval_seconds', value: '8' }]);
    expect(JSON.stringify(backup)).not.toContain('"body"');
  });
});
