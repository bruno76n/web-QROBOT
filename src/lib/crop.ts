/**
 * Pure maths of photo crops and variants (docs/12 §3, docs/15 §3). The browser turns these
 * numbers into pixels with a canvas; the server only stores them.
 */
export type Aspect = '1:1' | '16:9' | '3:4';
export type PhotoUsage = 'product' | 'hero_desktop' | 'hero_mobile';

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const usageAspect: Record<PhotoUsage, Aspect> = {
  product: '1:1',
  hero_desktop: '16:9',
  hero_mobile: '3:4',
};

/** Widths wanted per usage (docs/12 §3). */
export const wantedWidths: Record<PhotoUsage, readonly number[]> = {
  product: [400, 800, 1200],
  hero_desktop: [1200, 2400],
  hero_mobile: [600, 1200],
};

/** Below this crop width the panel warns "La foto es chica…" (docs/12 §3 step 5). */
export const smallThreshold: Record<PhotoUsage, number> = {
  product: 800,
  hero_desktop: 1600,
  hero_mobile: 900,
};

export const og = { width: 1200, height: 630 } as const;

export function aspectRatio(aspect: Aspect): number {
  switch (aspect) {
    case '1:1':
      return 1;
    case '16:9':
      return 16 / 9;
    case '3:4':
      return 3 / 4;
  }
}

/** Largest centered crop of the given shape inside the original (the automatic crop). */
export function centerCrop(width: number, height: number, aspect: Aspect): CropRect {
  const ratio = aspectRatio(aspect);
  let w = width;
  let h = Math.round(w / ratio);
  if (h > height) {
    h = height;
    w = Math.round(h * ratio);
  }
  return { x: Math.round((width - w) / 2), y: Math.round((height - h) / 2), width: w, height: h };
}

/**
 * Widths to generate: the wanted ones that are ≤ the crop width. A crop narrower than the
 * smallest wanted width gets ONE version of its own width. Never enlarges (docs/12 §3).
 */
export function widthsToGenerate(cropWidth: number, wanted: readonly number[]): number[] {
  const sorted = [...wanted].sort((a, b) => a - b);
  const fits = sorted.filter((w) => w <= cropWidth);
  return fits.length > 0 ? fits : [Math.max(1, Math.round(cropWidth))];
}

export function variantHeight(width: number, aspect: Aspect): number {
  return Math.round(width / aspectRatio(aspect));
}

export function isSmallCrop(cropWidth: number, usage: PhotoUsage): boolean {
  return cropWidth < smallThreshold[usage];
}

/**
 * `og.jpg`: a 1200 × 630 canvas with the square photo centered at 630 px, or at its own size
 * when smaller (never enlarged).
 */
export function ogLayout(cropWidth: number): {
  canvas: typeof og;
  size: number;
  x: number;
  y: number;
} {
  const size = Math.min(og.height, Math.round(cropWidth));
  return {
    canvas: og,
    size,
    x: Math.round((og.width - size) / 2),
    y: Math.round((og.height - size) / 2),
  };
}

/** How far a padded crop (product photos) may grow past the longest side of the original. */
export const maxPaddingFactor = 3;

/**
 * Keeps a crop inside the original and at least 1 px. Defensive: the server re-checks it.
 * With `allowPadding` (product photos) the crop may reach past the edges, to show a tall or wide
 * product whole with empty margins; it must still cover part of the photo and not be huge.
 */
export function isValidCrop(
  crop: CropRect,
  originalWidth: number,
  originalHeight: number,
  opts: { allowPadding?: boolean } = {},
): boolean {
  const ints = [crop.x, crop.y, crop.width, crop.height].every(Number.isInteger);
  if (opts.allowPadding) {
    return (
      ints &&
      crop.width >= 1 &&
      crop.height >= 1 &&
      crop.width <= maxPaddingFactor * Math.max(originalWidth, originalHeight) &&
      crop.height <= maxPaddingFactor * Math.max(originalWidth, originalHeight) &&
      crop.x < originalWidth &&
      crop.y < originalHeight &&
      crop.x + crop.width > 0 &&
      crop.y + crop.height > 0
    );
  }
  return (
    ints &&
    crop.x >= 0 &&
    crop.y >= 0 &&
    crop.width >= 1 &&
    crop.height >= 1 &&
    crop.x + crop.width <= originalWidth &&
    crop.y + crop.height <= originalHeight
  );
}

/** Short deterministic hash (FNV-1a, 8 hex chars) used as the `version` of a crop. */
export function hashVersion(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export function cropVersion(crop: CropRect, nonce: string): string {
  return hashVersion(`${crop.x},${crop.y},${crop.width},${crop.height},${nonce}`);
}

/** R2 keys (docs/09 › Claves en R2). Everything hangs from the photo id. */
export const r2Keys = {
  prefix: (photoId: string) => `ph/${photoId}/`,
  versionPrefix: (photoId: string, version: string) => `ph/${photoId}/${version}/`,
  original: (photoId: string, ext: string) => `ph/${photoId}/original.${ext}`,
  variant: (photoId: string, version: string, width: number) =>
    `ph/${photoId}/${version}/${width}.webp`,
  og: (photoId: string, version: string) => `ph/${photoId}/${version}/og.jpg`,
};
