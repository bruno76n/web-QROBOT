/** Server clock with a test override outside production. */

import { getAppEnv } from './env';

/**
 * The server's "now" (docs/10 §8). Outside production the `x-test-now` header (an ISO date) can
 * set it, so tests can look at the Christmas season in any month; production ignores the header.
 */
export function now(request?: Request): Date {
  if (request && getAppEnv() !== 'production') {
    const raw = request.headers.get('x-test-now');
    const parsed = raw ? new Date(raw) : null;
    if (parsed && !Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}
