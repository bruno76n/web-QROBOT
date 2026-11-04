import { spawnSync } from 'node:child_process';

/** Every run of the panel flows starts from the seed (docs/09 §4): 14 products and the default hero. */
export default function globalSetup() {
  seed();
  // Leave the seed behind too, so the public tests that follow see the example catalog.
  return () => seed();
}

function seed() {
  const r = spawnSync('node', ['scripts/seed.ts'], { stdio: 'ignore' });
  if (r.status !== 0) throw new Error('seed failed');
}
