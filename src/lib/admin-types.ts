/** Shapes of the data the server hands to the panel. Types only. */

import type { Aspect, CropRect } from './crop';
import type { CategoryId } from '@/config/categories';
import type { ColorId } from '@/config/colors';

/** What the panel receives about a photo (the server builds it, the browser only reads it). */
export interface PhotoView {
  id: string;
  alt: string;
  aspect: Aspect;
  version: string;
  widths: number[];
  crop: CropRect;
  original: { width: number; height: number };
  /** Public URL of each generated width, keyed by the width. */
  urls: Record<string, string>;
  /** `og.jpg`; only product photos have one. */
  ogUrl: string | null;
}

/** A product as listed in the panel. */
export interface ProductRow {
  id: string;
  slug: string;
  name: string;
  priceFromCents: number | null;
  published: boolean;
  featured: boolean;
  categories: CategoryId[];
  photoCount: number;
  /** Smallest version of the first photo, for the list thumbnail. */
  thumbUrl: string | null;
  sortOrder: number;
}

/** A product with everything the editing form needs. */
export interface ProductDetail {
  id: string;
  slug: string;
  name: string;
  unitSingular: string;
  unitPlural: string;
  short: string;
  description: string;
  priceFromCents: number | null;
  priceNote: string;
  size: string;
  material: string;
  leadTime: string;
  customSize: string;
  personalizable: boolean;
  personalHint: string;
  featured: boolean;
  published: boolean;
  /** True once the product has been published at least once. */
  everPublished: boolean;
  categories: CategoryId[];
  colors: ColorId[];
  photos: PhotoView[];
}

/** A hero slide as read by the panel. */
export interface HeroSlideView {
  id: string;
  desktop: PhotoView;
  mobile: PhotoView | null;
}

/** The hero as read by the panel: its slides and how long each stays. */
export interface HeroView {
  slides: HeroSlideView[];
  intervalSeconds: 4 | 6 | 8 | 12;
}

/** Taps on the WhatsApp buttons in the last N days (docs/18 §3). */
export interface ClickStats {
  days: number;
  total: number;
  bySource: Record<'product' | 'order' | 'q404' | 'customizer', number>;
  byProduct: Record<string, number>;
}
