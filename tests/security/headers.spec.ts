import { test, expect } from '@playwright/test';
import { stubPhotoHost } from '../../e2e/stub-images';
import { publicUrls } from '../../e2e/urls';

// docs/13 §3 and §10: headers on every public page, and no CSP errors in the console.
// Runs against the production build (`pnpm preview`): Astro does not emit the CSP in dev.
test.beforeEach(({ context }) => stubPhotoHost(context));

for (const url of publicUrls) {
  test(`security headers on ${url}`, async ({ page }) => {
    const problems: string[] = [];
    page.on('console', (m) => {
      // A 404 page is itself a failed document request; that is not a CSP or script problem.
      const isPageStatus = m.location().url.endsWith(url) && /status of 404/.test(m.text());
      if ((m.type() === 'error' && !isPageStatus) || /content security policy/i.test(m.text()))
        problems.push(m.text());
    });
    page.on('pageerror', (e) => problems.push(e.message));

    const response = await page.goto(url, { waitUntil: 'networkidle' });
    const h = response?.headers() ?? {};

    expect(h['x-frame-options']).toBe('DENY');
    expect(h['strict-transport-security']).toBe('max-age=31536000; includeSubDomains');
    expect(h['x-content-type-options']).toBe('nosniff');
    expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(h['permissions-policy']).toBe('camera=(), microphone=(), geolocation=()');

    const csp = h['content-security-policy'] ?? '';
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("img-src 'self' https://img.quickrobot.example");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toMatch(/script-src [^;]*'sha256-/);
    // Scripts: hashes only. Inline code must never be allowed in script-src.
    const scriptSrc = csp.split(';').find((d) => d.trim().startsWith('script-src')) ?? '';
    expect(scriptSrc).not.toContain('unsafe-inline');
    expect(scriptSrc).not.toContain('unsafe-eval');
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");

    expect(problems, problems.join('\n')).toEqual([]);
  });
}

test('the panel may use the camera, the public site may not', async ({ request }) => {
  // /admin does not exist until phase 2; the middleware rule is checked on any path under it.
  const res = await request.get('/admin/probe');
  expect(res.headers()['permissions-policy']).toBe('camera=(self), microphone=(), geolocation=()');
});
