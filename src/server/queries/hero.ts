import { asc, eq, inArray } from 'drizzle-orm';
import type { HeroView } from '@/lib/admin-types';
import { heroIntervals } from '@/lib/schemas';
import { getDb, schema, type Db } from '../db/client';
import { getEnv } from '../env';
import { toPhotoView } from './photos';

export const HERO_INTERVAL_KEY = 'hero_interval_seconds';

/** The hero slides in order with their photos, and the interval between them (default 6 s). */
export async function getHero(
  db: Db = getDb(),
  imgBase: string = getEnv().PUBLIC_IMG_BASE,
): Promise<HeroView> {
  const slides = await db
    .select()
    .from(schema.heroSlides)
    .orderBy(asc(schema.heroSlides.sortOrder));
  const photoIds = slides.flatMap((s) => [
    s.desktopPhotoId,
    ...(s.mobilePhotoId ? [s.mobilePhotoId] : []),
  ]);
  const photos =
    photoIds.length > 0
      ? await db.select().from(schema.photos).where(inArray(schema.photos.id, photoIds))
      : [];
  const byId = new Map(photos.map((p) => [p.id, p]));

  const [setting] = await db
    .select()
    .from(schema.settings)
    .where(eq(schema.settings.key, HERO_INTERVAL_KEY));
  const interval = Number(setting?.value);
  const intervalSeconds = (heroIntervals as readonly number[]).includes(interval)
    ? (interval as HeroView['intervalSeconds'])
    : 6;

  return {
    slides: slides.flatMap((s) => {
      const desktop = byId.get(s.desktopPhotoId);
      if (!desktop) return [];
      const mobile = s.mobilePhotoId ? byId.get(s.mobilePhotoId) : undefined;
      return [
        {
          id: s.id,
          desktop: toPhotoView(desktop, imgBase),
          mobile: mobile ? toPhotoView(mobile, imgBase) : null,
        },
      ];
    }),
    intervalSeconds,
  };
}
