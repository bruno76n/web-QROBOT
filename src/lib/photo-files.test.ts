import { describe, expect, it } from 'vitest';
import { isHeic, isSupportedPhoto } from './photo-files';

describe('photo file detection', () => {
  it('knows iPhone photos by type or by extension (Windows often sends no type)', () => {
    expect(isHeic({ type: 'image/heic', name: 'a' })).toBe(true);
    expect(isHeic({ type: 'image/heif', name: 'a' })).toBe(true);
    expect(isHeic({ type: '', name: 'IMG_0001.HEIC' })).toBe(true);
    expect(isHeic({ type: 'image/jpeg', name: 'a.jpg' })).toBe(false);
  });
  it('accepts JPG, PNG, WEBP and HEIC; rejects the rest, SVG included', () => {
    for (const f of [
      { type: 'image/jpeg', name: 'a.jpg' },
      { type: 'image/png', name: 'a.png' },
      { type: 'image/webp', name: 'a.webp' },
      { type: '', name: 'a.heic' },
    ]) {
      expect(isSupportedPhoto(f), f.name).toBe(true);
    }
    for (const f of [
      { type: 'image/svg+xml', name: 'a.svg' },
      { type: 'image/gif', name: 'a.gif' },
      { type: 'application/pdf', name: 'a.pdf' },
      { type: '', name: 'a' },
    ]) {
      expect(isSupportedPhoto(f), f.name).toBe(false);
    }
  });
});
