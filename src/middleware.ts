import { defineMiddleware } from 'astro:middleware';
import { isAdminRequest } from '@/server/auth';

/**
 * Security headers for every response (docs/13 §3).
 * The Content-Security-Policy itself comes from Astro (`security.csp` in astro.config.mjs),
 * which hashes the inline scripts at build time; it already carries `frame-ancestors 'none'`.
 */
const staticHeaders: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

const permissionsPolicy = (pathname: string) =>
  // The panel may take a photo with the camera (docs/13 §3).
  pathname === '/admin' || pathname.startsWith('/admin/')
    ? 'camera=(self), microphone=(), geolocation=()'
    : 'camera=(), microphone=(), geolocation=()';

/** Requests that need a valid admin session BEFORE Astro validates anything (docs/13 §2, rule 5). */
const isAdminApi = (pathname: string) =>
  pathname.startsWith('/_actions/admin.') || pathname.startsWith('/api/admin/');

const isPanel = (pathname: string) => pathname === '/admin' || pathname.startsWith('/admin/');

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const response =
    isAdminApi(pathname) && !(await isAdminRequest(context.request))
      ? Response.json({ ok: false, code: 'UNAUTHORIZED' }, { status: 401 })
      : await next();
  // Responses from `fetch` can be immutable: rebuild the headers on a copy when needed.
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(staticHeaders)) headers.set(name, value);
  headers.set('Permissions-Policy', permissionsPolicy(pathname));
  // The panel is never indexed (docs/13 §2 point 4); it is also left out of the sitemap.
  if (isPanel(pathname)) headers.set('X-Robots-Tag', 'noindex, nofollow');
  if (isAdminApi(pathname)) headers.set('Cache-Control', 'no-store');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
