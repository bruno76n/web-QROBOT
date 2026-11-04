import { eq, inArray } from 'drizzle-orm';
import { r2Keys } from '@/lib/crop';
import { limits } from '@/lib/publish';
import { fail, ok, type Result } from '@/lib/result';
import type { HeroInput } from '@/lib/schemas';
import { schema } from '../db/client';
import { HERO_INTERVAL_KEY } from '../queries/hero';
import { checkPhotoRefs, type CheckedPhoto } from './photos';
import { removePrefixes, runBatch, type AdminDeps } from './context';

/** `admin.saveHero`: replaces the whole hero (slides, photos and interval) in one batch. */
export async function saveHero(
  deps: AdminDeps,
  input: HeroInput,
): Promise<Result<{ slides: number }>> {
  const { db, bucket } = deps;
  if (input.slides.length > limits.maxSlides) return fail('TOO_MANY_SLIDES');

  // Which hero photos exist today: they may stay (attached to a slide) or go.
  const currentSlides = await db.select().from(schema.heroSlides);
  const currentIds = new Set(
    currentSlides.flatMap((s) => [s.desktopPhotoId, ...(s.mobilePhotoId ? [s.mobilePhotoId] : [])]),
  );

  const desktopRefs = input.slides.map((s) => s.desktop);
  const mobileRefs = input.slides.flatMap((s) => (s.mobile ? [s.mobile] : []));
  const slideIds = input.slides.map(() => deps.newId());

  // A hero photo can be reused only if it is already part of the hero (or is pending).
  const owner = { id: null, attachedIds: currentIds };
  const checkedDesktop = await checkPhotoRefs(db, bucket, desktopRefs, 'hero_desktop', owner);
  if (!Array.isArray(checkedDesktop)) return checkedDesktop;
  const checkedMobile = await checkPhotoRefs(db, bucket, mobileRefs, 'hero_mobile', owner);
  if (!Array.isArray(checkedMobile)) return checkedMobile;
  const all = [...checkedDesktop, ...checkedMobile];
  if (new Set(all.map((c) => c.ref.id)).size !== all.length)
    return fail('VALIDATION', { fields: { slides: ['duplicate photo'] } });

  const keep = new Set(all.map((c) => c.ref.id));
  const removed = [...currentIds].filter((id) => !keep.has(id));
  const now = new Date(deps.now());

  const mobileOf = new Map<number, CheckedPhoto>();
  let mi = 0;
  input.slides.forEach((s, i) => {
    if (s.mobile) mobileOf.set(i, checkedMobile[mi++] as CheckedPhoto);
  });

  const photoUpdate = (c: CheckedPhoto, ownerId: string, sortOrder: number) =>
    db
      .update(schema.photos)
      .set({
        status: 'attached',
        ownerId,
        sortOrder,
        alt: c.ref.alt,
        updatedAt: now,
        ...(c.recentered
          ? {
              cropX: c.ref.crop.x,
              cropY: c.ref.crop.y,
              cropWidth: c.ref.crop.width,
              cropHeight: c.ref.crop.height,
              version: c.ref.version,
              widths: JSON.stringify([...c.ref.widths].sort((a, b) => a - b)),
            }
          : {}),
      })
      .where(eq(schema.photos.id, c.ref.id));

  await runBatch(db, [
    // Slides first: they reference photos, so they must go before any photo is deleted.
    db.delete(schema.heroSlides),
    ...(removed.length > 0
      ? [db.delete(schema.photos).where(inArray(schema.photos.id, removed))]
      : []),
    ...input.slides.map((_, i) => {
      const desktop = checkedDesktop[i] as CheckedPhoto;
      return db.insert(schema.heroSlides).values({
        id: slideIds[i] as string,
        sortOrder: i,
        desktopPhotoId: desktop.ref.id,
        mobilePhotoId: mobileOf.get(i)?.ref.id ?? null,
      });
    }),
    ...input.slides.flatMap((_, i) => {
      const id = slideIds[i] as string;
      const mobile = mobileOf.get(i);
      return [
        photoUpdate(checkedDesktop[i] as CheckedPhoto, id, i),
        ...(mobile ? [photoUpdate(mobile, id, i)] : []),
      ];
    }),
    db
      .insert(schema.settings)
      .values({ key: HERO_INTERVAL_KEY, value: String(input.intervalSeconds) })
      .onConflictDoUpdate({
        target: schema.settings.key,
        set: { value: String(input.intervalSeconds) },
      }),
  ]);

  await removePrefixes(bucket, [
    ...removed.map((id) => r2Keys.prefix(id)),
    ...all.filter((c) => c.recentered).map((c) => r2Keys.versionPrefix(c.row.id, c.row.version)),
  ]);
  return ok({ slides: input.slides.length });
}

/** `admin.resetHero`: removes every slide and its photos; the home goes back to the default photo. */
export async function resetHero(deps: AdminDeps): Promise<Result<{ removed: number }>> {
  const { db, bucket } = deps;
  const photos = await db
    .select({ id: schema.photos.id })
    .from(schema.photos)
    .where(inArray(schema.photos.ownerType, ['hero_desktop', 'hero_mobile']));
  await runBatch(db, [
    db.delete(schema.heroSlides),
    ...(photos.length > 0
      ? [
          db.delete(schema.photos).where(
            inArray(
              schema.photos.id,
              photos.map((p) => p.id),
            ),
          ),
        ]
      : []),
  ]);
  await removePrefixes(
    bucket,
    photos.map((p) => r2Keys.prefix(p.id)),
  );
  return ok({ removed: photos.length });
}
