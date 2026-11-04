import { describe, expect, it } from 'vitest';
import { allowedChars, buildTypeface } from '../scripts/build-font.mjs';

// docs/11 §3: the 3D font must include Ñ, accents and Ü.
describe('3D typeface', () => {
  const font = buildTypeface() as unknown as {
    glyphs: Record<string, { ha: number; o: string }>;
    resolution: number;
  };
  it('has every allowed character with an outline', () => {
    for (const ch of allowedChars.replace(' ', '')) {
      expect(font.glyphs[ch]?.o.length, ch).toBeGreaterThan(10);
    }
  });
  it('the space has an advance and no outline', () => {
    expect(font.glyphs[' ']?.ha).toBeGreaterThan(100);
  });
  it('uses the typeface.js resolution', () => {
    expect(font.resolution).toBe(1000);
  });
});
