/** Pure helpers for the hero editor's slide list: conversion from and to the saved hero, busy check, change fingerprint and reordering. */

import { arrayMove } from '@dnd-kit/sortable';
import type { HeroView } from '@/lib/admin-types';
import type { PhotoUsage } from '@/lib/crop';
import type { HeroInput } from '@/lib/schemas';
import { fingerprint, itemFromView, refsOf, type PhotoItem } from '../photos/usePhotos';

/** One slide in the editor: a required desktop photo and an optional mobile photo. */
export interface SlideItem {
  key: string;
  desktop: PhotoItem;
  mobile: PhotoItem | null;
}

/** Which photo of a slide is meant. */
export type Slot = 'desktop' | 'mobile';
/** Crop usage (aspect ratio and sizes) that applies to each slot. */
export const slotUsage = (slot: Slot): PhotoUsage =>
  slot === 'desktop' ? 'hero_desktop' : 'hero_mobile';

/** Builds the editor's slides from the saved hero. */
export const slidesFromView = (hero: HeroView): SlideItem[] =>
  hero.slides.map((s) => ({
    key: s.id,
    desktop: itemFromView(s.desktop, 'hero_desktop'),
    mobile: s.mobile ? itemFromView(s.mobile, 'hero_mobile') : null,
  }));

/** Every photo of the hero, in order: used to know if something is still uploading. */
export const allPhotos = (slides: SlideItem[]): PhotoItem[] =>
  slides.flatMap((s) => (s.mobile ? [s.desktop, s.mobile] : [s.desktop]));

/** True while any photo is still being prepared or uploaded, so saving must wait. */
export const isBusy = (slides: SlideItem[]) =>
  allPhotos(slides).some((p) => p.status === 'preparing' || p.status === 'uploading');

/** What changes when the hero has unsaved changes: photos, versions, order and the interval. */
export const heroFingerprint = (slides: SlideItem[], interval: number) =>
  `${interval}|${fingerprint(allPhotos(slides))}|${slides.map((s) => s.key).join(',')}`;

/** Slides ready to save, or null when some photo is not ready yet (a missing mobile photo is saved as `null`). */
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

/** Returns the slides with the one at `from` moved to position `to`. */
export const moveSlide = (slides: SlideItem[], from: number, to: number) =>
  arrayMove(slides, from, to);
