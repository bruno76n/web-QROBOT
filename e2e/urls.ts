/**
 * Pages every cross-cutting test (headers, axe, screenshots, Lighthouse) must visit.
 * It grows with each phase; tests only look at pages that exist today.
 */
export const publicUrls: string[] = [
  '/',
  '/catalogo',
  '/catalogo/navidad',
  '/producto/llaveros-con-nombre',
  '/producto/q-404',
  '/privacidad',
  '/no-existe',
];
