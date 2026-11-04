// Helper: run `astro preview` (the built site on workerd) for scripts that need a server.
import { spawn } from 'node:child_process';

export async function withPreview(port, fn) {
  const child = spawn(
    'pnpm',
    ['exec', 'astro', 'preview', '--port', String(port), '--ignore-lock'],
    {
      stdio: 'ignore',
      detached: true,
    },
  );
  const base = `http://localhost:${port}`;
  try {
    const deadline = Date.now() + 60_000;
    for (;;) {
      try {
        const r = await fetch(base + '/');
        if (r.status < 500) break;
      } catch {
        /* not up yet */
      }
      if (Date.now() > deadline) throw new Error('preview server did not start in 60 s');
      await new Promise((r) => setTimeout(r, 500));
    }
    return await fn(base);
  } finally {
    try {
      process.kill(-child.pid, 'SIGTERM');
    } catch {
      /* already gone */
    }
  }
}
