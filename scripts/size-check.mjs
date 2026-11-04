// pnpm size — JavaScript budgets per page (docs/15 §2). Only pages that exist are checked.
// Usage: pnpm build && pnpm size   (starts its own preview server unless BASE_URL is set)
import { gzipSync } from 'node:zlib';
import { withPreview } from './_server.mjs';

const KB = 1024;
/** path (sample URL) → budget in KB of compressed JS loaded on open. null = no strict limit. */
const budgets = [
  { label: 'Inicio', url: '/', limitKb: 90, skipVisible: true },
  { label: 'Catálogo', url: '/catalogo', limitKb: 25 },
  { label: 'Producto', url: '/producto/llaveros-con-nombre', limitKb: 70 },
  { label: 'Privacidad', url: '/privacidad', limitKb: 8 },
  // 404 and privacy carry no React: only the header and beacon scripts count (docs/15 §2)
  { label: '404', url: '/no-existe', limitKb: 8, status: 404 },
];

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
      for (const m of code.matchAll(/(?:from|import)\s*["'](\.{1,2}\/[^"']+\.js)["']/g))
        queue.push(new URL(m[1], url).href);
    }
  }
  srcs.clear();
  seen.forEach((u) => srcs.add(u));
  return { total, files: srcs.size };
}

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
    const { total, files } = await jsOnOpen(base, await res.text(), { skipVisible: b.skipVisible });
    const kb = total / KB;
    const ok = kb <= b.limitKb;
    console.log(
      `${ok ? '✓' : '✗'} ${b.label} (${b.url}): ${kb.toFixed(1)} KB gzip in ${files} file(s), budget ${b.limitKb} KB`,
    );
    if (!ok) failed++;
  }
  if (checked === 0) {
    console.error('No page found to check.');
    return 1;
  }
  return failed ? 1 : 0;
}

const code = process.env.BASE_URL
  ? await run(process.env.BASE_URL)
  : await withPreview(Number(process.env.PORT ?? 4399), run);
process.exit(code);
