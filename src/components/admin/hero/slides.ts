import { arrayMove } from '@dnd-kit/sortable';
import type { HeroView } from '@/lib/admin-types';
import type { PhotoUsage } from '@/lib/crop';
import type { HeroInput } from '@/lib/schemas';
import { fingerprint, itemFromView, refsOf, type PhotoItem } from '../photos/usePhotos';

export interface SlideItem {
  key: string;
  desktop: PhotoItem;
  mobile: PhotoItem | null;
}

export type Slot = 'desktop' | 'mobile';
export const slotUsage = (slot: Slot): PhotoUsage =>
  slot === 'desktop' ? 'hero_desktop' : 'hero_mobile';

export const slidesFromView = (hero: HeroView): SlideItem[] =>
  hero.slides.map((s) => ({
    key: s.id,
    desktop: itemFromView(s.desktop, 'hero_desktop'),
    mobile: s.mobile ? itemFromView(s.mobile, 'hero_mobile') : null,
  }));

/** Every photo of the hero, in order: used to know if something is still uploading. */
export const allPhotos = (slides: SlideItem[]): PhotoItem[] =>
  slides.flatMap((s) => (s.mobile ? [s.desktop, s.mobile] : [s.desktop]));

export const isBusy = (slides: SlideItem[]) =>
  allPhotos(slides).some((p) => p.status === 'preparing' || p.status === 'uploading');

/** What changes when the hero has unsaved changes: photos, versions, order and the interval. */
export const heroFingerprint = (slides: SlideItem[], interval: number) =>
  `${interval}|${fingerprint(allPhotos(slides))}|${slides.map((s) => s.key).join(',')}`;

/** Slides ready to save, or null when some photo is not ready yet. */
export function toHeroInput(
  slides: SlideItem[],
  intervalSeconds: HeroInput['intervalSeconds'],
): HeroInput | null {
  const out: HeroInput['slides'] = [];
  for (const s of slides) {
    const [desktop] = refsOf([s.desktop]);
    if (!desktop) return null;
    const mobile = s.mobile ? (refsOf([s.mobile])[0] ?? null) : null;
    if (s.mobile && !mobile) return null;
    out.push({ desktop, mobile });
  }
  return { slides: out, intervalSeconds };
}

export const moveSlide = (slides: SlideItem[], from: number, to: number) =>
  arrayMove(slides, from, to);
