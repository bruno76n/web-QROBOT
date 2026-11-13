// Server for Lighthouse CI: the production build on workerd, but with the photos served from
// /img (the production image domain does not exist while the domain is provisional).
import { spawn } from 'node:child_process';

// `PORT` overrides the default 4321.
const port = process.env.PORT ?? '4321';
const child = spawn(
  'pnpm',
  [
    'exec',
    'wrangler',
    'dev',
    '--config',
    'dist/server/wrangler.json',
    '--port',
    port,
    '--ip',
    '127.0.0.1',
    '--var',
    'PUBLIC_IMG_BASE:/img',
    '--var',
    'APP_ENV:development',
    '--persist-to',
    '.wrangler/state',
  ],
  { stdio: 'inherit' },
);
// Stops the server with this process, and ends with the server's exit code.
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('exit', (code) => process.exit(code ?? 0));
