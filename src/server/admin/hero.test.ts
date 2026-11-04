import { beforeEach, describe, expect, it } from 'vitest';
import { env } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '../db/client';
import { getHero } from '../queries/hero';
import { resetHero, saveHero } from './hero';
import { keysUnder, makeDeps, putVersionFiles, resetAll, seedPhoto } from './test-utils';

const db = () => getDb(env.DB);
let t: ReturnType<typeof makeDeps>;
beforeEach(async () => {
  await resetAll();
  t = makeDeps();
});

const desktop = (id: string) => seedPhoto({ id, usage: 'hero_desktop' });
const mobile = (id: string) => seedPhoto({ id, usage: 'hero_mobile' });

describe('saveHero', () => {
  it('saves slides in order with their photos and the interval', async () => {
    const d1 = await desktop('d1');
    const d2 = await desktop('d2');
    const m2 = await mobile('m2');
    const res = await saveHero(t.deps, {
      slides: [
        { desktop: d1, mobile: null },
        { desktop: d2, mobile: m2 },
      ],
      intervalSeconds: 8,
    });
    expect(res).toEqual({ ok: true, data: { slides: 2 } });

    const hero = await getHero(db(), '/img');
    expect(hero.intervalSeconds).toBe(8);
    expect(hero.slides.map((s) => [s.desktop.id, s.mobile?.id ?? null])).toEqual([
      ['d1', null],
      ['d2', 'm2'],
    ]);
    expect(hero.slides[0]?.desktop.urls).toEqual({
      '1200': '/img/ph/d1/aaaaaaaa/1200.webp',
      '2400': '/img/ph/d1/aaaaaaaa/2400.webp',
    });
    expect(hero.slides[0]?.desktop.ogUrl).toBeNull();
    const photos = await db().select().from(schema.photos);
    expect(photos.every((p) => p.status === 'attached' && p.ownerId !== null)).toBe(true);
  });

  it('defaults to 6 seconds when nothing was saved', async () => {
    expect((await getHero(db(), '/img')).intervalSeconds).toBe(6);
    expect((await getHero(db(), '/img')).slides).toEqual([]);
  });

  it('TOO_MANY_SLIDES above 6', async () => {
    const slides = [];
    for (let i = 0; i < 7; i++) slides.push({ desktop: await desktop(`d${i}`), mobile: null });
    expect(await saveHero(t.deps, { slides, intervalSeconds: 6 })).toEqual({
      ok: false,
      code: 'TOO_MANY_SLIDES',
    });
    expect(
      await saveHero(t.deps, { slides: slides.slice(0, 6), intervalSeconds: 6 }),
    ).toMatchObject({ ok: true });
  });

  it('removing a slide deletes its photos from D1 and R2', async () => {
    const d1 = await desktop('d1');
    const d2 = await desktop('d2');
    const m2 = await mobile('m2');
    await saveHero(t.deps, {
      slides: [
        { desktop: d1, mobile: null },
        { desktop: d2, mobile: m2 },
      ],
      intervalSeconds: 6,
    });
    const res = await saveHero(t.deps, {
      slides: [{ desktop: d1, mobile: null }],
      intervalSeconds: 6,
    });
    expect(res.ok).toBe(true);
    expect((await getHero(db(), '/img')).slides).toHaveLength(1);
    expect(await db().select().from(schema.photos).where(eq(schema.photos.id, 'd2'))).toEqual([]);
    expect(await keysUnder('ph/d2/')).toEqual([]);
    expect(await keysUnder('ph/m2/')).toEqual([]);
    expect((await keysUnder('ph/d1/')).length).toBeGreaterThan(0);
  });

  it('re-centering a slide photo applies the crop and deletes the old version', async () => {
    const d1 = await desktop('d1');
    await saveHero(t.deps, { slides: [{ desktop: d1, mobile: null }], intervalSeconds: 6 });
    await putVersionFiles('d1', 'hero_desktop', 'bbbbbbbb', [1200]);
    const recentered = {
      ...d1,
      version: 'bbbbbbbb',
      crop: { x: 0, y: 0, width: 1600, height: 900 },
      widths: [1200],
    };
    expect(
      (
        await saveHero(t.deps, {
          slides: [{ desktop: recentered, mobile: null }],
          intervalSeconds: 6,
        })
      ).ok,
    ).toBe(true);
    const [ph] = await db().select().from(schema.photos).where(eq(schema.photos.id, 'd1'));
    expect(ph).toMatchObject({ version: 'bbbbbbbb', cropWidth: 1600, widths: '[1200]' });
    expect(await keysUnder('ph/d1/aaaaaaaa/')).toEqual([]);
    expect(await keysUnder('ph/d1/bbbbbbbb/')).toEqual(['ph/d1/bbbbbbbb/1200.webp']);
  });

  it('PHOTO_NOT_FOUND for unknown photos or a product photo used as hero', async () => {
    const product = await seedPhoto({ id: 'prod1' });
    expect(
      await saveHero(t.deps, {
        slides: [{ desktop: { ...product }, mobile: null }],
        intervalSeconds: 6,
      }),
    ).toEqual({
      ok: false,
      code: 'PHOTO_NOT_FOUND',
    });
    const ghost = { ...(await desktop('d1')), id: 'ghost' };
    expect(
      await saveHero(t.deps, { slides: [{ desktop: ghost, mobile: null }], intervalSeconds: 6 }),
    ).toEqual({
      ok: false,
      code: 'PHOTO_NOT_FOUND',
    });
  });

  it('VALIDATION when the same photo is used twice', async () => {
    const d1 = await desktop('d1');
    expect(
      await saveHero(t.deps, {
        slides: [
          { desktop: d1, mobile: null },
          { desktop: d1, mobile: null },
        ],
        intervalSeconds: 6,
      }),
    ).toMatchObject({ ok: false, code: 'VALIDATION' });
  });

  it('an attached hero photo of the current hero cannot be stolen by another save', async () => {
    const d1 = await desktop('d1');
    await saveHero(t.deps, { slides: [{ desktop: d1, mobile: null }], intervalSeconds: 6 });
    // simulate: the hero was reset, then someone reuses an id that is attached elsewhere
    const other = await seedPhoto({
      id: 'owned',
      usage: 'hero_desktop',
      status: 'attached',
      ownerId: 'someone-else',
    });
    expect(
      await saveHero(t.deps, { slides: [{ desktop: other, mobile: null }], intervalSeconds: 6 }),
    ).toEqual({
      ok: false,
      code: 'PHOTO_NOT_FOUND',
    });
    // and a failed save leaves the old hero as it was
    expect((await getHero(db(), '/img')).slides.map((s) => s.desktop.id)).toEqual(['d1']);
  });
});

describe('resetHero', () => {
  it('removes all slides and hero photos (D1 and R2) but keeps product photos', async () => {
    const d1 = await desktop('d1');
    const m1 = await mobile('m1');
    await saveHero(t.deps, { slides: [{ desktop: d1, mobile: m1 }], intervalSeconds: 12 });
    await seedPhoto({ id: 'prod1', status: 'attached', ownerId: 'p' });
    expect(await resetHero(t.deps)).toEqual({ ok: true, data: { removed: 2 } });
    expect((await getHero(db(), '/img')).slides).toEqual([]);
    expect(await keysUnder('ph/d1/')).toEqual([]);
    expect(await keysUnder('ph/m1/')).toEqual([]);
    expect((await keysUnder('ph/prod1/')).length).toBeGreaterThan(0);
  });
  it('works when there is nothing to reset', async () => {
    expect(await resetHero(t.deps)).toEqual({ ok: true, data: { removed: 0 } });
  });
});
