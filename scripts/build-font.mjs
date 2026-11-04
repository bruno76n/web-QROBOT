// Builds the typeface.js JSON that three.js `Text3D` needs, from Geist Bold (docs/11 §3):
// A–Z, Ñ, accented vowels, Ü, digits and space. Output: public/fonts/geist-bold.typeface.json.
import opentype from 'opentype.js';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
export const allowedChars = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZÁÉÍÓÚÜ0123456789 ';

export function buildTypeface() {
  const file = readFileSync(join(root, 'node_modules/geist/dist/fonts/geist-sans/Geist-Bold.ttf'));
  const font = opentype.parse(
    file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength),
  );
  const scale = 1000 / font.unitsPerEm;
  const n = (v) => Math.round(v * scale);
  const glyphs = {};
  for (const ch of allowedChars) {
    const g = font.charToGlyph(ch);
    const o = [];
    for (const c of g.path.commands) {
      if (c.type === 'M') o.push('m', n(c.x), n(c.y));
      else if (c.type === 'L') o.push('l', n(c.x), n(c.y));
      else if (c.type === 'Q') o.push('q', n(c.x), n(c.y), n(c.x1), n(c.y1));
      else if (c.type === 'C') o.push('b', n(c.x), n(c.y), n(c.x1), n(c.y1), n(c.x2), n(c.y2));
    }
    const box = g.getBoundingBox();
    glyphs[ch] = { ha: n(g.advanceWidth ?? 0), x_min: n(box.x1), x_max: n(box.x2), o: o.join(' ') };
  }
  return {
    glyphs,
    familyName: 'Geist',
    ascender: n(font.ascender),
    descender: n(font.descender),
    underlinePosition: -100,
    underlineThickness: 50,
    boundingBox: { yMin: n(font.descender), xMin: 0, yMax: n(font.ascender), xMax: 1000 },
    resolution: 1000,
    original_font_information: {
      format: 0,
      fontFamily: 'Geist',
      fontSubfamily: 'Bold',
      license: 'SIL OFL 1.1',
    },
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  mkdirSync(join(root, 'public/fonts'), { recursive: true });
  const json = JSON.stringify(buildTypeface());
  writeFileSync(join(root, 'public/fonts/geist-bold.typeface.json'), json);
  console.log(`build-font: ${(json.length / 1024).toFixed(0)} KB`);
}
