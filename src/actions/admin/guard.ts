import { ActionError, type ActionAPIContext } from 'astro:actions';
import { UnauthorizedError, requireAdmin } from '@/server/auth';

/**
 * First line of every admin action (docs/10 §3 step 2): the middleware already answered 401 to
 * requests without a session; this repeats the check in case someone removes that route.
 */
export async function guard(context: ActionAPIContext): Promise<void> {
  try {
    await requireAdmin(context.request);
  } catch (error) {
    if (error instanceof UnauthorizedError) throw new ActionError({ code: 'UNAUTHORIZED' });
    throw error;
  }
}
