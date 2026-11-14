// pnpm size — JavaScript budgets per page (docs/15 §2). Only pages that exist are checked.
// Usage: pnpm build && pnpm size   (starts its own preview server unless BASE_URL is set)
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { withPreview } from './_server.mjs';

const KB = 1024;
/**
 * Pages to check: `url` is a sample address, `limitKb` the budget of gzip JS loaded on open,
 * `skipVisible` leaves out `client:visible` islands (below the fold), `status` the expected HTTP status.
 */
const budgets = [
  { label: 'Inicio', url: '/', limitKb: 90, skipVisible: true },
  { label: 'Catálogo', url: '/catalogo', limitKb: 25 },
  { label: 'Producto', url: '/producto/llaveros-con-nombre', limitKb: 70 },
  { label: 'Privacidad', url: '/privacidad', limitKb: 8 },
  // 404 and privacy carry no React: only the header and beacon scripts count (docs/15 §2)
  { label: '404', url: '/no-existe', limitKb: 8, status: 404 },
  // Aprende: search, filters and tools are plain scripts, no React (docs/21 §13). `safari` also
  // checks that its scripts run in Safari 14 (docs/24 §5–6).
  { label: 'Aprende', url: '/aprende', limitKb: 25, safari: true },
  { label: 'Aprende · tema', url: '/aprende/filamentos', limitKb: 25, safari: true },
  { label: 'Aprende · ficha', url: '/aprende/filamentos/pla', limitKb: 25, safari: true },
  { label: 'Aprende · ¿Cabe mi pieza?', url: '/aprende/maquinas/volumen-de-impresion', limitKb: 25, safari: true },
  { label: 'Aprende · calculadora', url: '/aprende/negocio/costo', limitKb: 25, safari: true },
];

/**
 * What Safari 14 cannot run (docs/24 §5): a direct `requestIdleCallback(` call, and regular
 * expressions with lookbehind, which stop the whole script from loading before Safari 16.4.
 */
const safariBreakers = [
  { name: 'requestIdleCallback', re: /(?:^|[^.\w])requestIdleCallback\(/ },
  { name: 'lookbehind', re: /\(\?<[=!]/ },
];

/** Folder of the built client scripts. */
const builtJs = 'dist/client/_astro';

/**
 * Safari 14 check over the page scripts of the build (docs/24 §5, docs/25 §12): every `<script>` of
 * an Astro page or component (files `*.astro_astro_type_script_*`) and every file it imports, so it
 * also covers pages that do not answer in the build, like the hidden page for workshops. The React
 * islands of the panel are not page scripts: their rules are not those of docs/24. Returns the
 * problems found.
 */
function safariInBuild() {
  if (!existsSync(builtJs)) return [`${builtJs} does not exist (pnpm build first)`];
  const queue = readdirSync(builtJs).filter(
    (f) => f.endsWith('.js') && f.includes('.astro_astro_type_script_'),
  );
  const seen = new Set();
  const problems = [];
  while (queue.length > 0) {
    const f = queue.shift();
    if (seen.has(f) || !existsSync(join(builtJs, f))) continue;
    seen.add(f);
    const code = readFileSync(join(builtJs, f), 'utf8');
    for (const s of safariBreakers) if (s.re.test(code)) problems.push(`${s.name} in ${f}`);
    // Follow the static imports of the same folder (shared chunks of the page scripts).
    for (const m of code.matchAll(/(?:from|import)\s*["']\.\/([^"']+\.js)["']/g)) queue.push(m[1]);
  }
  return problems;
}

/** Every file under `dir` with one of the extensions. */
const walk = (dir, exts) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? walk(join(dir, e.name), exts)
      : exts.some((x) => e.name.endsWith(x))
        ? [join(dir, e.name)]
        : [],
  );

/**
 * Safari 14 check over the source of every browser script we write: the `<script>` blocks of the
 * Astro components and pages, and `src/scripts/`. Scripts of pages rendered on demand can be
 * inlined into their HTML instead of becoming files of the build, so the build check alone does not
 * see the scripts of the hidden pages (docs/25 §12).
 */
function safariInSource() {
  const astro = walk('src', ['.astro']).flatMap((f) =>
    [...readFileSync(f, 'utf8').matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map((m) => ({
      f,
      code: m[1],
    })),
  );
  const scripts = existsSync('src/scripts')
    ? walk('src/scripts', ['.ts', '.js'])
        .filter((f) => !/\.test\.[jt]s$/.test(f))
        .map((f) => ({ f, code: readFileSync(f, 'utf8') }))
    : [];
  return [...astro, ...scripts].flatMap(({ f, code }) =>
    safariBreakers.filter((s) => s.re.test(code)).map((s) => `${s.name} in ${f}`),
  );
}

/**
 * Gzip size of the JavaScript a page loads on open: its scripts, preloaded modules, island
 * components, and every file those import. Returns the total bytes and the number of files.
 */
async function jsOnOpen(base, html, { skipVisible = false } = {}) {
  const srcs = new Set();
  for (const m of html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)) srcs.add(m[1]);
  for (const m of html.matchAll(/<link\b[^>]*rel="modulepreload"[^>]*href="([^"]+)"/g))
    srcs.add(m[1]);
  for (const m of html.matchAll(/<link\b[^>]*href="([^"]+)"[^>]*rel="modulepreload"/g))
    srcs.add(m[1]);
  // Islands load their component and renderer too. `client:visible` ones below the fold do not
  // count on open when the budget says so (docs/15 §2); everything else counts as if hydrated.
  for (const [tag] of html.matchAll(/<astro-island\b[^>]*>/g)) {
    if (skipVisible && /\bclient="visible"/.test(tag)) continue;
    for (const m of tag.matchAll(
      /\b(?:component-url|renderer-url|before-hydration-url)="([^"]+)"/g,
    ))
      srcs.add(m[1]);
  }
  // Follow the static imports of each file (React and Embla live in shared chunks).
  const seen = new Set();
  let total = 0;
  const codes = [];
  const queue = [...srcs].map((src) => new URL(src, base).href);
  while (queue.length > 0) {
    const url = queue.shift();
    if (seen.has(url)) continue;
    seen.add(url);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Cannot fetch ${url}: ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    total += gzipSync(buf).length;
    if (/\.m?js(\?|$)/.test(url)) {
      const code = buf.toString('utf8');
      codes.push({ url, code });
      for (const m of code.matchAll(/(?:from|import)\s*["'](\.{1,2}\/[^"']+\.js)["']/g))
        queue.push(new URL(m[1], url).href);
    }
  }
  srcs.clear();
  seen.forEach((u) => srcs.add(u));
  return { total, files: srcs.size, codes };
}

/** Checks every budget against the server at `base`; returns the exit code (0 = all within budget). */
async function run(base) {
  let failed = 0;
  let checked = 0;
  for (const b of budgets) {
    const res = await fetch(base + b.url);
    if (res.status !== (b.status ?? 200)) {
      console.log(`- ${b.label} (${b.url}): not built yet (HTTP ${res.status}), skipped`);
      continue;
    }
    checked++;
    const { total, files, codes } = await jsOnOpen(base, await res.text(), {
      skipVisible: b.skipVisible,
    });
    const kb = total / KB;
    const broken = b.safari
      ? safariBreakers.flatMap((s) =>
          codes.filter((c) => s.re.test(c.code)).map((c) => `${s.name} in ${c.url}`),
        )
      : [];
    for (const m of broken) console.log(`  ✗ Safari 14: ${m}`);
    const ok = kb <= b.limitKb && broken.length === 0;
    console.log(
      `${ok ? '✓' : '✗'} ${b.label} (${b.url}): ${kb.toFixed(1)} KB gzip in ${files} file(s), budget ${b.limitKb} KB`,
    );
    if (!ok) failed++;
  }
  if (checked === 0) {
    console.error('No page found to check.');
    return 1;
  }
  const safari = [...safariInBuild(), ...safariInSource()];
  for (const m of safari) console.log(`  ✗ Safari 14: ${m}`);
  console.log(
    `${safari.length ? '✗' : '✓'} Safari 14: page scripts of ${builtJs} with their imports, and the source of every browser script (requestIdleCallback, lookbehind)`,
  );
  return failed || safari.length ? 1 : 0;
}

// Uses `BASE_URL` when set; otherwise starts a preview server of the build (port `PORT`).
const code = process.env.BASE_URL
  ? await run(process.env.BASE_URL)
  : await withPreview(Number(process.env.PORT ?? 4399), run);
process.exit(code);
