// pnpm db:backup — a dated .sql file with the whole database (docs/17 §5).
// Local by default; `--remote` exports production (needs the Cloudflare credentials).
import { mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const remote = process.argv.includes('--remote');
const date = new Date().toISOString().slice(0, 10);
mkdirSync('backups', { recursive: true });
const output = `backups/quick-robot-${remote ? 'remote' : 'local'}-${date}.sql`;
const args = [
  'exec',
  'wrangler',
  'd1',
  'export',
  'DB',
  remote ? '--remote' : '--local',
  '--output',
  output,
];
const r = spawnSync('pnpm', args, { stdio: 'inherit' });
if (r.status === 0) console.log(`\nbackup: ${output}`);
process.exit(r.status ?? 1);
