import { describe, expect, it } from 'vitest';
import {
  centerCrop,
  cropVersion,
  hashVersion,
  isSmallCrop,
  isValidCrop,
  ogLayout,
  r2Keys,
  variantHeight,
  widthsToGenerate,
  wantedWidths,
} from './crop';

describe('widthsToGenerate (docs/16 §4)', () => {
  it('3000 px wide 1:1 crop → 400, 800, 1200', () => {
    expect(widthsToGenerate(3000, wantedWidths.product)).toEqual([400, 800, 1200]);
  });
  it('700 px crop → only 400, and it is flagged as small', () => {
    expect(widthsToGenerate(700, wantedWidths.product)).toEqual([400]);
    expect(isSmallCrop(700, 'product')).toBe(true);
  });
  it('300 px crop → a single version of its own width, flagged as small', () => {
    expect(widthsToGenerate(300, wantedWidths.product)).toEqual([300]);
    expect(isSmallCrop(300, 'product')).toBe(true);
  });
  it('never enlarges: exact widths are kept, larger ones dropped', () => {
    expect(widthsToGenerate(800, wantedWidths.product)).toEqual([400, 800]);
    expect(widthsToGenerate(1300, wantedWidths.hero_desktop)).toEqual([1200]);
    expect(widthsToGenerate(500, wantedWidths.hero_mobile)).toEqual([500]);
  });
  it('small thresholds per usage', () => {
    expect(isSmallCrop(800, 'product')).toBe(false);
    expect(isSmallCrop(1599, 'hero_desktop')).toBe(true);
    expect(isSmallCrop(900, 'hero_mobile')).toBe(false);
  });
});

describe('ogLayout', () => {
  it('480 px crop → 1200 × 630 canvas with the photo at 480 px, centered, not enlarged', () => {
    expect(ogLayout(480)).toEqual({
      canvas: { width: 1200, height: 630 },
      size: 480,
      x: 360,
      y: 75,
    });
  });
  it('a big crop is placed at 630 px', () => {
    expect(ogLayout(3000)).toEqual({
      canvas: { width: 1200, height: 630 },
      size: 630,
      x: 285,
      y: 0,
    });
  });
});

describe('centerCrop', () => {
  it('4000 × 3000 in 1:1 → 3000 × 3000 at x = 500', () => {
    expect(centerCrop(4000, 3000, '1:1')).toEqual({ x: 500, y: 0, width: 3000, height: 3000 });
  });
  it('portrait original in 1:1 crops the height', () => {
    expect(centerCrop(530, 840, '1:1')).toEqual({ x: 0, y: 155, width: 530, height: 530 });
  });
  it('16:9 and 3:4 fit inside the original', () => {
    const a = centerCrop(2400, 1350, '16:9');
    expect(a).toEqual({ x: 0, y: 0, width: 2400, height: 1350 });
    const b = centerCrop(1200, 1600, '3:4');
    expect(b).toEqual({ x: 0, y: 0, width: 1200, height: 1600 });
    const c = centerCrop(2000, 2000, '16:9');
    expect(c.width).toBe(2000);
    expect(c.height).toBe(1125);
    expect(c.y).toBe(438);
  });
});

describe('crop helpers', () => {
  it('variant heights follow the aspect', () => {
    expect(variantHeight(800, '1:1')).toBe(800);
    expect(variantHeight(1200, '16:9')).toBe(675);
    expect(variantHeight(600, '3:4')).toBe(800);
  });
  it('validates a crop against the original', () => {
    expect(isValidCrop({ x: 0, y: 0, width: 100, height: 100 }, 100, 100)).toBe(true);
    expect(isValidCrop({ x: 1, y: 0, width: 100, height: 100 }, 100, 100)).toBe(false);
    expect(isValidCrop({ x: -1, y: 0, width: 10, height: 10 }, 100, 100)).toBe(false);
    expect(isValidCrop({ x: 0, y: 0, width: 0, height: 10 }, 100, 100)).toBe(false);
    expect(isValidCrop({ x: 0, y: 0, width: 10.5, height: 10 }, 100, 100)).toBe(false);
  });
  it('version changes when the crop or the nonce changes', () => {
    const crop = { x: 1, y: 2, width: 3, height: 4 };
    expect(cropVersion(crop, 'a')).toMatch(/^[0-9a-f]{8}$/);
    expect(cropVersion(crop, 'a')).toBe(cropVersion(crop, 'a'));
    expect(cropVersion(crop, 'a')).not.toBe(cropVersion(crop, 'b'));
    expect(cropVersion(crop, 'a')).not.toBe(cropVersion({ ...crop, x: 2 }, 'a'));
    expect(hashVersion('')).toBe('811c9dc5');
  });
  it('builds the R2 keys of docs/09', () => {
    expect(r2Keys.original('abc', 'jpg')).toBe('ph/abc/original.jpg');
    expect(r2Keys.variant('abc', 'v1', 800)).toBe('ph/abc/v1/800.webp');
    expect(r2Keys.og('abc', 'v1')).toBe('ph/abc/v1/og.jpg');
    expect(r2Keys.prefix('abc')).toBe('ph/abc/');
    expect(r2Keys.versionPrefix('abc', 'v1')).toBe('ph/abc/v1/');
  });
});
