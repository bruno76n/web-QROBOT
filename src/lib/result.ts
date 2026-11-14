/** The result shape of admin actions: business success or a coded failure. Pure. */

/** Error codes shared by server and panel (docs/10 §5). */
export const errorCodes = [
  'UNAUTHORIZED',
  'VALIDATION',
  'NOT_FOUND',
  'SLUG_TAKEN',
  'CANNOT_PUBLISH',
  'TOO_MANY_PHOTOS',
  'TOO_MANY_SLIDES',
  'PHOTO_NOT_FOUND',
  'UNKNOWN_CATEGORY',
  'CATEGORY_PROTECTED',
  'CATEGORY_IN_USE',
  'TOO_MANY_CATEGORIES',
  'UNKNOWN_RELATED',
  'UNKNOWN_BLOCK',
  'SEARCH_UNAVAILABLE',
  'FILE_TYPE',
  'FILE_TOO_LARGE',
  'INTERNAL',
] as const;

/** One of the codes in `errorCodes`. */
export type ErrorCode = (typeof errorCodes)[number];

/** A business failure with its code. */
export interface Failure {
  ok: false;
  code: ErrorCode;
  /** Extra data for the panel, e.g. `{ missing: ['photo'] }`, `{ slugs: [...] }` or `{ fields: {...} }`. */
  details?: Record<string, unknown>;
}

/** What every admin action returns for business results (docs/10 §3). */
export type Result<T> = { ok: true; data: T } | Failure;

/** Wraps a successful value. */
export function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

/** Builds a failure; `details` is left out when not given. */
export function fail(code: ErrorCode, details?: Record<string, unknown>): Failure {
  return details ? { ok: false, code, details } : { ok: false, code };
}
