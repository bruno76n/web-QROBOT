import { spawnSync } from 'node:child_process';

/** Every run of the panel flows starts from the seed (docs/09 §4): 14 products and the default hero. */
export default function globalSetup() {
  const r = spawnSync('node', ['scripts/seed.ts'], { stdio: 'inherit' });
  if (r.status !== 0) throw new Error('seed failed');
}
