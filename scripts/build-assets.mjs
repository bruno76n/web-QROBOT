// Builds the optimized brand assets into public/ (docs/15 §3). Runs before dev and build.
// Never touches assets/ or reference/. Never enlarges an image. Output is generated:
// public/brand/, public/fonts/ and public/favicon.svg are git-ignored.
import sharp from 'sharp';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, extname, join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const at = (...p) => join(root, ...p);
const QUALITY = 82; // docs/15 §3

const out = { brand: at('public/brand'), fonts: at('public/fonts') };
for (const dir of [out.brand, out.fonts, at('public/brand/q404'), at('public/brand/ideas')]) {
  mkdirSync(dir, { recursive: true });
}

/** Skip work when the output is newer than the source (and than this script). */
const script = statSync(at('scripts/build-assets.mjs')).mtimeMs;
const fresh = (src, dest) =>
  existsSync(dest) && statSync(dest).mtimeMs >= Math.max(statSync(src).mtimeMs, script);

let made = 0;

/** Writes `<name>-<w>.webp` for each wanted width that does not enlarge the source. */
async function responsive(src, destDir, name, widths) {
  const { width } = await sharp(src).metadata();
  const sizes = [...new Set(widths.map((w) => Math.min(w, width)))];
  for (const w of sizes) {
    const dest = join(destDir, `${name}-${w}.webp`);
    if (fresh(src, dest)) continue;
    await sharp(src)
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(dest);
    made++;
  }
}

// Logo → favicon
const logo = at('assets/logo-cabeza.svg');
if (!fresh(logo, at('public/favicon.svg'))) {
  copyFileSync(logo, at('public/favicon.svg'));
  made++;
}

// Geist (variable, latin subset, one file, docs/15 §4)
const fontSrc = at('node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2');
if (!fresh(fontSrc, join(out.fonts, 'geist-latin.woff2'))) {
  copyFileSync(fontSrc, join(out.fonts, 'geist-latin.woff2'));
  made++;
}

// Q-404 renders, ideas, default hero
for (const f of readdirSync(at('assets/q404'))) {
  const impresion = f.includes('impresion');
  await responsive(
    at('assets/q404', f),
    at('public/brand/q404'),
    basename(f, extname(f)),
    impresion ? [400, 800] : [265, 530],
  );
}
for (const f of readdirSync(at('assets/ideas'))) {
  await responsive(
    at('assets/ideas', f),
    at('public/brand/ideas'),
    basename(f, extname(f)),
    [240, 480],
  );
}
await responsive(
  at('reference/hero/hero-escritorio.webp'),
  out.brand,
  'hero-desktop',
  [1200, 2400],
);
await responsive(at('reference/hero/hero-celular.webp'), out.brand, 'hero-mobile', [600, 1200]);

// Poster of the video section: the default hero, smaller
{
  const src = at('reference/hero/hero-escritorio.webp');
  const dest = join(out.brand, 'video-poster-1200.webp');
  if (!fresh(src, dest)) {
    // Only resized: the blur and the dimming are done by CSS on the page (docs/05: portada desenfocada).
    await sharp(src).resize({ width: 1200 }).webp({ quality: 70 }).toFile(dest);
    made++;
  }
}

// Share image 1200×630: Q-404 on the --soft background (never enlarged), and apple-touch-icon
{
  const q = at('assets/q404/q404-morado-verde.webp');
  const dest = join(out.brand, 'og-default.jpg');
  if (!fresh(q, dest)) {
    const robot = await sharp(q).resize({ height: 570, withoutEnlargement: true }).toBuffer();
    await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#f6f6f8' } })
      .composite([{ input: robot, gravity: 'centre' }])
      .jpeg({ quality: 86 })
      .toFile(dest);
    made++;
  }
  const icon = join(out.brand, 'apple-touch-icon.png');
  if (!fresh(logo, icon)) {
    const head = await sharp(readFileSync(logo), { density: 600 })
      .resize({ width: 120 })
      .png()
      .toBuffer();
    await sharp({ create: { width: 180, height: 180, channels: 3, background: '#ffffff' } })
      .composite([{ input: head, gravity: 'centre' }])
      .png()
      .toFile(icon);
    made++;
  }
}

// 3D font for the name customizer (loaded only when someone touches the 3D view)
const { buildTypeface } = await import('./build-font.mjs');
const fontOut = join(out.fonts, 'geist-bold.typeface.json');
if (
  !fresh(at('node_modules/geist/dist/fonts/geist-sans/Geist-Bold.ttf'), fontOut) ||
  !fresh(at('scripts/build-font.mjs'), fontOut)
) {
  writeFileSync(fontOut, JSON.stringify(buildTypeface()));
  made++;
}

console.log(`build-assets: ${made} file(s) written`);
