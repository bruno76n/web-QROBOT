/** Public URLs and `<img>` attributes for stored photos, built only from the widths they have. Pure. */

import { r2Keys, variantHeight, type Aspect } from './crop';

/** What a public page needs to draw a stored photo (docs/10 §2, docs/15 §3). */
export interface PhotoSrc {
  id: string;
  alt: string;
  version: string;
  /** Widths that really exist (`photos.widths`); never invent a size. */
  widths: number[];
  aspect: Aspect;
}

/** Joins a base URL and a key with exactly one slash. */
const join = (base: string, key: string) =>
  `${base.replace(/\/+$/, '')}/${key.replace(/^\/+/, '')}`;

/** URL of one width of a photo. */
export const photoVariantUrl = (p: Pick<PhotoSrc, 'id' | 'version'>, width: number, base: string) =>
  join(base, r2Keys.variant(p.id, p.version, width));

/** URL of the social-sharing image (`og.jpg`) of a photo. */
export const photoOgUrl = (p: Pick<PhotoSrc, 'id' | 'version'>, base: string) =>
  join(base, r2Keys.og(p.id, p.version));

/** Attributes to render a photo as an `<img>`. */
export interface ImgAttrs {
  src: string;
  srcset: string;
  /** Intrinsic size of the largest version, so the layout never jumps. */
  width: number;
  height: number;
}

/** `src`, `srcset` and size of a photo from the widths it really has. */
export function photoImg(p: PhotoSrc, base: string): ImgAttrs {
  const widths = [...p.widths].sort((a, b) => a - b);
  const largest = widths[widths.length - 1] ?? 400;
  // The fallback `src` is the biggest version up to 800 px; browsers with srcset pick their own.
  const fallback = [...widths].reverse().find((w) => w <= 800) ?? largest;
  return {
    src: photoVariantUrl(p, fallback, base),
    srcset: widths.map((w) => `${photoVariantUrl(p, w, base)} ${w}w`).join(', '),
    width: largest,
    height: variantHeight(largest, p.aspect),
  };
}
