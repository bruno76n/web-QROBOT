import type { HeroView } from './admin-types';

/** What the hero needs to draw each slide (docs/04 §2.1, docs/15 §3). Pure. */
export interface HeroSlideImg {
  desktop: { srcset: string; src: string; width: number; height: number; alt: string };
  /** The phone photo (3:4); null = use the desktop one, cropped to the center by CSS. */
  mobile: { srcset: string; width: number; height: number } | null;
}

const DEFAULT_ALT = 'Portada de Quick Robot';

export const defaultHeroSlide = (alt: string = DEFAULT_ALT): HeroSlideImg => ({
  desktop: {
    srcset: '/brand/hero-desktop-1200.webp 1200w, /brand/hero-desktop-2400.webp 2400w',
    src: '/brand/hero-desktop-2400.webp',
    width: 2400,
    height: 1350,
    alt,
  },
  mobile: {
    srcset: '/brand/hero-mobile-600.webp 600w, /brand/hero-mobile-1200.webp 1200w',
    width: 1200,
    height: 1600,
  },
});

const srcsetOf = (urls: Record<string, string>) =>
  Object.entries(urls)
    .map(([w, u]) => [Number(w), u] as const)
    .sort((a, b) => a[0] - b[0])
    .map(([w, u]) => `${u} ${w}w`)
    .join(', ');

const largestUrl = (urls: Record<string, string>) => {
  const widths = Object.keys(urls)
    .map(Number)
    .sort((a, b) => a - b);
  return urls[String(widths[widths.length - 1])] ?? '';
};

/** Slides from the panel's hero; with none saved, the default photo (reference/hero). */
export function heroSlides(
  hero: HeroView,
  defaultAlt: string,
  slideAlt: (i: number, n: number) => string,
): HeroSlideImg[] {
  if (hero.slides.length === 0) return [defaultHeroSlide(defaultAlt)];
  const n = hero.slides.length;
  return hero.slides.map((s, i) => {
    const dw = Math.max(...s.desktop.widths);
    const mw = s.mobile ? Math.max(...s.mobile.widths) : 0;
    return {
      desktop: {
        srcset: srcsetOf(s.desktop.urls),
        src: largestUrl(s.desktop.urls),
        width: dw,
        height: Math.round((dw * 9) / 16),
        alt: s.desktop.alt || (n > 1 ? slideAlt(i + 1, n) : defaultAlt),
      },
      mobile: s.mobile
        ? { srcset: srcsetOf(s.mobile.urls), width: mw, height: Math.round((mw * 4) / 3) }
        : null,
    };
  });
}
