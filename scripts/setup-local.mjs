// Local setup (used by `pnpm dev`): creates .dev.vars.local from the example when missing and
// applies migrations to the LOCAL D1 (it lives in .wrangler/state, never in production).
//
// Why `.dev.vars.local` and not `.dev.vars`: `astro preview` and `wrangler dev` always read
// `.dev.vars`, which would turn a production build into "development" on a developer's machine.
// `pnpm dev` runs with CLOUDFLARE_ENV=local, which selects `.dev.vars.local` only.
import { copyFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

if (!existsSync('.dev.vars.local')) {
  copyFileSync('.dev.vars.example', '.dev.vars.local');
  console.log('setup-local: created .dev.vars.local from .dev.vars.example');
}
const r = spawnSync('pnpm', ['exec', 'wrangler', 'd1', 'migrations', 'apply', 'DB', '--local'], {
  stdio: 'inherit',
});
process.exit(r.status ?? 1);
