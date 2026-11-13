/** Admin-session check shared by every admin action. */

import { ActionError, type ActionAPIContext } from 'astro:actions';
import { UnauthorizedError, requireAdmin } from '@/server/auth';

/**
 * Runs first in every admin action (docs/10 §3). The middleware already answers 401 to requests
 * without a session; this repeats the check so an action stays protected even if the middleware's
 * route list changes. Throws an `UNAUTHORIZED` action error when the token is missing or invalid.
 */
export async function guard(context: ActionAPIContext): Promise<void> {
  try {
    await requireAdmin(context.request);
  } catch (error) {
    if (error instanceof UnauthorizedError) throw new ActionError({ code: 'UNAUTHORIZED' });
    throw error;
  }
}
