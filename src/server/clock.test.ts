import { describe, expect, it } from 'vitest';
import { now } from './clock';

// The test environment runs with APP_ENV=development (vitest.config.ts); production ignores the header.
describe('now()', () => {
  it('uses x-test-now outside production', () => {
    const req = new Request('http://x/', {
      headers: { 'x-test-now': '2026-09-30T23:59:00-06:00' },
    });
    expect(now(req).toISOString()).toBe('2026-10-01T05:59:00.000Z');
  });
  it('ignores a broken header and no request', () => {
    const real = Date.now();
    expect(
      Math.abs(
        now(new Request('http://x/', { headers: { 'x-test-now': 'mañana' } })).getTime() - real,
      ),
    ).toBeLessThan(5000);
    expect(Math.abs(now().getTime() - real)).toBeLessThan(5000);
  });
});
