// pnpm security — docs/13 §10. Runs each check that applies to the files present and exits
// non-zero if any step fails.
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Result of every step: `{ label, ok }`.
const steps = [];
// Runs a command with inherited output and records whether it passed.
const run = (label, cmd, args, opts = {}) => {
  console.log(`\n▶ ${label}`);
  const r = spawnSync(cmd, args, { stdio: 'inherit', ...opts });
  const ok = r.status === 0;
  steps.push({ label, ok });
  if (!ok) console.error(`✗ ${label}`);
  return ok;
};
// True when `dir` exists and has a file matching `re`.
const has = (dir, re) => existsSync(dir) && readdirSync(dir).some((f) => re.test(f));

// 1. Dependencies
run('pnpm audit (prod, high)', 'pnpm', ['audit', '--prod', '--audit-level=high']);

// 2. Secrets
const gl = spawnSync('gitleaks', ['version'], { stdio: 'ignore' });
if (gl.status === 0) {
  run('gitleaks', 'gitleaks', ['detect', '--no-banner', '--redact']);
} else if (process.env.CI) {
  steps.push({ label: 'gitleaks (not installed in CI)', ok: false });
  console.error('✗ gitleaks is required in CI');
} else {
  console.warn('\n! gitleaks is not installed locally: skipped (CI runs it).');
}

// 3. Lint security rules + frontiers, and proof that the rules do break
run('eslint (security rules and frontiers)', 'pnpm', ['exec', 'eslint', '.', '--max-warnings=0']);
run('negative lint fixtures must fail', 'node', ['scripts/lint-negative.mjs']);

// 4. Security tests present in tests/security (Vitest ones and Playwright ones)
if (has('tests/security', /\.test\.ts$/)) {
  run('vitest security', 'pnpm', ['exec', 'vitest', 'run', 'tests/security']);
}
if (has('tests/security', /\.spec\.ts$/)) {
  run('playwright security', 'pnpm', ['exec', 'playwright', 'test', 'tests/security']);
}

// 5. The page for workshops stays hidden (docs/25 §2, §12): its pages are never prerendered and
// each one carries its own lock; the build has no static HTML that names it (Cloudflare would serve
// that without passing through the Worker). Runs after Playwright, whose server builds `dist/`.
const check = (label, problems) => {
  console.log(`\n▶ ${label}`);
  for (const p of problems) console.error(`  ${p}`);
  steps.push({ label, ok: problems.length === 0 });
  if (problems.length) console.error(`✗ ${label}`);
};
/** Every file under `dir`, with its path. */
const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );
const systemPages = existsSync('src/pages/talleres')
  ? walk('src/pages/talleres').filter((f) => f.endsWith('.astro'))
  : [];
check(
  'page for workshops: never prerendered, locked page by page',
  systemPages.flatMap((f) => {
    const src = readFileSync(f, 'utf8');
    return [
      ...(/prerender\s*=\s*true/.test(src) ? [`${f}: prerender = true`] : []),
      ...(!/export const prerender = false;/.test(src) ? [`${f}: without prerender = false`] : []),
      ...(!src.includes("if (!systemVisible) return Astro.rewrite('/404');")
        ? [`${f}: without its lock`]
        : []),
    ];
  }),
);
// The system screens and the page parts never carry `style` attributes (docs/25 §9): bar sizes
// go as SVG attributes and colors as classes or `fill`.
const systemComponents = existsSync('src/components/system')
  ? walk('src/components/system').filter((f) => f.endsWith('.astro'))
  : [];
check(
  'page for workshops: no style attributes in its components',
  systemComponents
    .filter((f) => /\sstyle\s*=/.test(readFileSync(f, 'utf8')))
    .map((f) => `${f}: style attribute`),
);
if (existsSync('dist')) {
  check(
    'page for workshops: no static HTML names it',
    walk('dist')
      .filter((f) => f.endsWith('.html'))
      .filter((f) => f.includes('talleres') || readFileSync(f, 'utf8').includes('/talleres'))
      .map((f) => `${f}: names /talleres`),
  );
} else {
  console.warn('\n! dist/ does not exist: the static HTML check was skipped (pnpm build first).');
}

const bad = steps.filter((s) => !s.ok);
console.log(
  `\n${bad.length ? '✗' : '✓'} security: ${steps.length - bad.length}/${steps.length} steps passed`,
);
process.exit(bad.length ? 1 : 0);
