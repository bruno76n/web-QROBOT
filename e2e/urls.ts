/**
 * List of public pages that cross-cutting tests visit (security headers, accessibility,
 * screenshots, Lighthouse). The last entry is an address that does not exist, to cover the 404 page.
 */
/** Pages every cross-cutting test must visit. */
export const publicUrls: string[] = [
  '/',
  '/catalogo',
  '/catalogo/navidad',
  '/producto/llaveros-con-nombre',
  '/producto/q-404',
  '/privacidad',
  '/no-existe',
];
