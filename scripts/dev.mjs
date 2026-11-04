// pnpm dev: local setup, brand assets, then the Astro dev server with the local env file.
import { spawnSync } from 'node:child_process';

const run = (cmd, args, env = {}) => {
  const r = spawnSync(cmd, args, { stdio: 'inherit', env: { ...process.env, ...env } });
  if (r.status !== 0) process.exit(r.status ?? 1);
};
run('node', ['scripts/setup-local.mjs']);
run('node', ['scripts/seed.ts', '--if-empty']); // only when the local database is empty
run('node', ['scripts/build-assets.mjs']);
run('pnpm', ['exec', 'astro', 'dev', ...process.argv.slice(2)], { CLOUDFLARE_ENV: 'local' });
