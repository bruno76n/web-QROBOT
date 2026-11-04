import type { APIRoute } from 'astro';
import { fail } from '@/lib/result';
import { UnauthorizedError, requireAdmin } from '@/server/auth';
import { runUpload } from '@/server/uploads';
import { MB, maxOriginalBytes } from '@/server/files';

export const prerender = false;

const json = (body: unknown, status: number) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

/** One photo per call (docs/10 §4). The middleware already checked the session; this checks again. */
export const POST: APIRoute = async ({ request }) => {
  try {
    await requireAdmin(request);
  } catch (error) {
    if (error instanceof UnauthorizedError) return json(fail('UNAUTHORIZED'), 401);
    throw error;
  }

  // Refuse huge bodies before reading them: the original (25 MB) plus the versions.
  const declared = Number(request.headers.get('content-length') ?? 0);
  if (declared > maxOriginalBytes + 16 * MB) return json(fail('FILE_TOO_LARGE'), 413);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json(fail('VALIDATION'), 400);
  }

  try {
    const result = await runUpload(form);
    return json(result.body, result.status);
  } catch (error) {
    const errorId = crypto.randomUUID().slice(0, 8);
    console.error(`[upload ${errorId}]`, error);
    return json(fail('INTERNAL', { errorId }), 500);
  }
};
