import { describe, expect, it } from 'vitest';
import type { HeroView, PhotoView } from '@/lib/admin-types';
import { heroFingerprint, isBusy, moveSlide, slidesFromView, toHeroInput } from './slides';

const photo = (id: string, aspect: PhotoView['aspect']): PhotoView => ({
  id,
  alt: '',
  aspect,
  version: 'aaaaaaaa',
  widths: [1200, 2400],
  crop: { x: 0, y: 0, width: 2400, height: 1350 },
  original: { width: 2400, height: 1350 },
  urls: { '1200': `/img/${id}/1200.webp`, '2400': `/img/${id}/2400.webp` },
  ogUrl: null,
});

const hero: HeroView = {
  intervalSeconds: 8,
  slides: [
    { id: 's1', desktop: photo('d1', '16:9'), mobile: photo('m1', '3:4') },
    { id: 's2', desktop: photo('d2', '16:9'), mobile: null },
  ],
};

describe('hero slides', () => {
  it('builds items from the server view', () => {
    const slides = slidesFromView(hero);
    expect(slides.map((s) => s.key)).toEqual(['s1', 's2']);
    expect(slides[0]?.desktop.previewUrl).toBe('/img/d1/1200.webp');
    expect(slides[1]?.mobile).toBeNull();
  });
  it('turns them into the saveHero input', () => {
    const input = toHeroInput(slidesFromView(hero), 8);
    expect(input?.intervalSeconds).toBe(8);
    expect(input?.slides).toHaveLength(2);
    expect(input?.slides[0]?.mobile?.id).toBe('m1');
    expect(input?.slides[1]?.mobile).toBeNull();
  });
  it('refuses to save while a photo is not ready', () => {
    const slides = slidesFromView(hero);
    const first = slides[0];
    if (!first) throw new Error('no slide');
    slides[0] = { ...first, desktop: { ...first.desktop, status: 'uploading' } };
    expect(isBusy(slides)).toBe(true);
    expect(toHeroInput(slides, 6)).toBeNull();
  });
  it('the fingerprint changes with order, interval and alt', () => {
    const slides = slidesFromView(hero);
    const base = heroFingerprint(slides, 8);
    expect(heroFingerprint(moveSlide(slides, 0, 1), 8)).not.toBe(base);
    expect(heroFingerprint(slides, 12)).not.toBe(base);
    expect(heroFingerprint(slidesFromView(hero), 8)).toBe(base);
  });
});
