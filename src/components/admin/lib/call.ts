import { fail, ok, type Failure, type Result } from '@/lib/result';

/** Shape of what `actions.admin.x()` returns (structural, so it can be tested without Astro). */
export interface ActionOutcome<T> {
  data?: Result<T> | undefined;
  error?:
    { code?: string; message?: string; fields?: Record<string, string[] | undefined> } | undefined;
}

/**
 * Turns an Astro action outcome into the panel's `Result` (docs/10 §3): business errors already
 * come as `Result`; Zod's `BAD_REQUEST` becomes `VALIDATION` with its fields; the rest is `INTERNAL`.
 */
export function normalizeOutcome<T>(outcome: ActionOutcome<T>): Result<T> {
  if (outcome.error) {
    const { code, message, fields } = outcome.error;
    if (code === 'UNAUTHORIZED') return fail('UNAUTHORIZED');
    if (code === 'BAD_REQUEST' && fields) return fail('VALIDATION', { fields });
    const errorId = /\b([0-9a-f]{8})\b/.exec(message ?? '')?.[1] ?? '—';
    return fail('INTERNAL', { errorId });
  }
  return outcome.data ?? fail('INTERNAL', { errorId: '—' });
}

/**
 * A network failure with the browser online is almost always an expired Access session: Access
 * answers with a redirect the browser blocks (docs/13 §2 point 5). Offline is its own case.
 */
export async function callAction<T>(
  run: () => Promise<ActionOutcome<T>>,
  isOnline: () => boolean = () => (typeof navigator === 'undefined' ? true : navigator.onLine),
): Promise<Result<T> | Failure> {
  try {
    return normalizeOutcome(await run());
  } catch {
    return isOnline() ? fail('UNAUTHORIZED') : fail('OFFLINE' as never);
  }
}

export class ApiError extends Error {
  constructor(public failure: Failure) {
    super(failure.code);
  }
}

/** For queries: returns the data or throws an `ApiError` the UI can show. */
export function unwrap<T>(result: Result<T>): T {
  if (result.ok) return result.data;
  throw new ApiError(result);
}

export { ok };
