import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// docs/13 §10: every admin route answers 401 without a session, even with invalid input
// (the session is checked BEFORE the input is validated). Runs on the production build,
// where there is no development session.
const adminRequests = [
  { method: 'POST', path: '/_actions/admin.listProducts', body: {} },
  { method: 'POST', path: '/_actions/admin.saveProduct', body: { name: '' } },
  { method: 'POST', path: '/_actions/admin.deleteProduct', body: { nonsense: true } },
  { method: 'POST', path: '/api/admin/upload', body: {} },
] as const;

for (const r of adminRequests) {
  test(`${r.path} without a token → 401`, async ({ request }) => {
    const res = await request.post(r.path, { data: r.body });
    expect(res.status()).toBe(401);
    expect(await res.json()).toEqual({ ok: false, code: 'UNAUTHORIZED' });
    expect(res.headers()['cache-control']).toBe('no-store');
  });
  test(`${r.path} with a made-up token → 401`, async ({ request }) => {
    const res = await request.post(r.path, {
      data: r.body,
      headers: { 'Cf-Access-Jwt-Assertion': 'eyJhbGciOiJSUzI1NiJ9.e30.x' },
    });
    expect(res.status()).toBe(401);
  });
}

test('the panel is never indexed', async ({ request }) => {
  const res = await request.get('/admin/anything');
  expect(res.headers()['x-robots-tag']).toBe('noindex, nofollow');
});

test('the production build does not contain the development session', () => {
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((f) => {
      const p = join(dir, f);
      return statSync(p).isDirectory() ? walk(p) : [p];
    });
  const files = walk('dist').filter((f) => /\.(m?js|json|html)$/.test(f));
  expect(files.length).toBeGreaterThan(0);
  for (const f of files) {
    expect(readFileSync(f, 'utf8'), f).not.toContain('dev-admin@quickrobot.local');
  }
});
