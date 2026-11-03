// pnpm security — docs/13 §10. Every step runs on what already exists.
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';

const steps = [];
const run = (label, cmd, args, opts = {}) => {
  console.log(`\n▶ ${label}`);
  const r = spawnSync(cmd, args, { stdio: 'inherit', ...opts });
  const ok = r.status === 0;
  steps.push({ label, ok });
  if (!ok) console.error(`✗ ${label}`);
  return ok;
};
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

// 4. Security tests that exist so far
if (has('tests/security', /\.test\.ts$/)) {
  run('vitest security', 'pnpm', ['exec', 'vitest', 'run', 'tests/security']);
}
if (has('tests/security', /\.spec\.ts$/)) {
  run('playwright security', 'pnpm', ['exec', 'playwright', 'test', 'tests/security']);
}

const bad = steps.filter((s) => !s.ok);
console.log(
  `\n${bad.length ? '✗' : '✓'} security: ${steps.length - bad.length}/${steps.length} steps passed`,
);
process.exit(bad.length ? 1 : 0);
