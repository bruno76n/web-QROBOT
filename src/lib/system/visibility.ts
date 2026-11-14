/**
 * Whether the page for workshops («Para talleres») can be seen (docs/25 §2). Pure: the caller
 * passes the switch and whether this is `pnpm dev`.
 */

/** The base path of the pages for workshops. */
export const systemBase = '/talleres';

/**
 * True for `/talleres` and anything under `/talleres/`, nothing else (`/talleresx` is not). The
 * path is decoded first, so `/%74alleres` and `/talleres%2Fprecios` count too; a badly encoded path
 * is not a system path and never throws.
 */
export function isSystemPath(pathname: string): boolean {
  let path: string;
  try {
    path = decodeURIComponent(pathname);
  } catch {
    return false;
  }
  return path === systemBase || path.startsWith(`${systemBase}/`);
}

/** Visible with the switch on, or always in `pnpm dev` so the pages can be built and tested. */
export function isSystemVisible(input: { enabled: boolean; dev: boolean }): boolean {
  return input.enabled || input.dev;
}
