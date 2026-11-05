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
  'FILE_TYPE',
  'FILE_TOO_LARGE',
  'INTERNAL',
] as const;

export type ErrorCode = (typeof errorCodes)[number];

export interface Failure {
  ok: false;
  code: ErrorCode;
  /** Extra data for the panel, e.g. `{ missing: ['photo'] }` or `{ fields: {...} }`. */
  details?: Record<string, unknown>;
}

/** What every admin action returns for business results (docs/10 §3). */
export type Result<T> = { ok: true; data: T } | Failure;

export function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

export function fail(code: ErrorCode, details?: Record<string, unknown>): Failure {
  return details ? { ok: false, code, details } : { ok: false, code };
}
