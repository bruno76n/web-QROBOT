import { defineMiddleware } from 'astro:middleware';

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

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  // Responses from `fetch` can be immutable: rebuild the headers on a copy when needed.
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(staticHeaders)) headers.set(name, value);
  headers.set('Permissions-Policy', permissionsPolicy(context.url.pathname));
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
