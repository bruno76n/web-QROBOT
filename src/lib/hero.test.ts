import { describe, expect, it } from 'vitest';
import type { HeroView, PhotoView } from './admin-types';
import { heroSlides } from './hero';

const photo = (id: string, widths: number[], alt = ''): PhotoView => ({
  id,
  alt,
  aspect: '16:9',
  version: 'aaaaaaaa',
  widths,
  crop: { x: 0, y: 0, width: 1, height: 1 },
  original: { width: 1, height: 1 },
  urls: Object.fromEntries(widths.map((w) => [String(w), `/img/${id}/${w}.webp`])),
  ogUrl: null,
});
const alt = (i: number, n: number) => `Portada ${i} de ${n}`;

describe('heroSlides', () => {
  it('with nothing saved it uses the default photo', () => {
    const [s] = heroSlides({ slides: [], intervalSeconds: 6 }, 'Descripción', alt);
    expect(s?.desktop.src).toBe('/brand/hero-desktop-2400.webp');
    expect(s?.desktop.alt).toBe('Descripción');
    expect(s?.mobile?.srcset).toContain('hero-mobile-600.webp 600w');
  });
  it('uses the saved photos, with the phone photo only when there is one', () => {
    const hero: HeroView = {
      intervalSeconds: 8,
      slides: [
        { id: 'a', desktop: photo('d1', [2400, 1200], 'Foto A'), mobile: photo('m1', [600, 1200]) },
        { id: 'b', desktop: photo('d2', [1200]), mobile: null },
      ],
    };
    const slides = heroSlides(hero, 'Descripción', alt);
    expect(slides).toHaveLength(2);
    expect(slides[0]?.desktop).toMatchObject({
      srcset: '/img/d1/1200.webp 1200w, /img/d1/2400.webp 2400w',
      src: '/img/d1/2400.webp',
      width: 2400,
      height: 1350,
      alt: 'Foto A',
    });
    expect(slides[0]?.mobile).toMatchObject({ width: 1200, height: 1600 });
    expect(slides[1]?.mobile).toBeNull();
    expect(slides[1]?.desktop.alt).toBe('Portada 2 de 2');
    expect(slides[1]?.desktop.height).toBe(675); // never enlarged: 1200 × 675
  });
  it('a single photo keeps the description as its text', () => {
    const hero: HeroView = {
      intervalSeconds: 6,
      slides: [{ id: 'a', desktop: photo('d1', [1200]), mobile: null }],
    };
    expect(heroSlides(hero, 'Descripción', alt)[0]?.desktop.alt).toBe('Descripción');
  });
});
