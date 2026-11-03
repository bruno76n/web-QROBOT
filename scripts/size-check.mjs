// pnpm size — JavaScript budgets per page (docs/15 §2). Only pages that exist are checked.
// Usage: pnpm build && pnpm size   (starts its own preview server unless BASE_URL is set)
import { gzipSync } from 'node:zlib';
import { withPreview } from './_server.mjs';

const KB = 1024;
/** path (sample URL) → budget in KB of compressed JS loaded on open. null = no strict limit. */
const budgets = [
  { label: 'Inicio', url: '/', limitKb: 90 },
  { label: 'Catálogo', url: '/catalogo', limitKb: 25 },
  { label: 'Producto', url: '/producto/llaveros-con-nombre', limitKb: 70 },
  { label: 'Privacidad', url: '/privacidad', limitKb: 0 },
  { label: '404', url: '/404', limitKb: 0 },
];

async function jsOnOpen(base, html) {
  const srcs = new Set();
  for (const m of html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)) srcs.add(m[1]);
  for (const m of html.matchAll(/<link\b[^>]*rel="modulepreload"[^>]*href="([^"]+)"/g))
    srcs.add(m[1]);
  for (const m of html.matchAll(/<link\b[^>]*href="([^"]+)"[^>]*rel="modulepreload"/g))
    srcs.add(m[1]);
  let total = 0;
  for (const src of srcs) {
    const res = await fetch(new URL(src, base));
    if (!res.ok) throw new Error(`Cannot fetch ${src}: ${res.status}`);
    total += gzipSync(Buffer.from(await res.arrayBuffer())).length;
  }
  return { total, files: srcs.size };
}

async function run(base) {
  let failed = 0;
  let checked = 0;
  for (const b of budgets) {
    const res = await fetch(base + b.url);
    if (res.status !== 200) {
      console.log(`- ${b.label} (${b.url}): not built yet (HTTP ${res.status}), skipped`);
      continue;
    }
    checked++;
    const { total, files } = await jsOnOpen(base, await res.text());
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
