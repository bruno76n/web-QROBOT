import type { APIRoute } from 'astro';
import { fail } from '@/lib/result';
import { UnauthorizedError, requireAdmin } from '@/server/auth';
import { getOriginalKey } from '@/server/queries/photos';
import { getEnv } from '@/server/env';
import { serveOriginal } from '@/server/images';

export const prerender = false;

/** The original of a photo, for re-centering it in the panel. */
export const GET: APIRoute = async ({ request, params }) => {
  try {
    await requireAdmin(request);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return Response.json(fail('UNAUTHORIZED'), {
        status: 401,
        headers: { 'Cache-Control': 'no-store' },
      });
    }
    throw error;
  }
  return serveOriginal(await getOriginalKey(params.id), getEnv().BUCKET);
};
