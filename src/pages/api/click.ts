import type { APIRoute } from 'astro';
import { clickInputSchema } from '@/lib/schemas';
import { countClick } from '@/server/clicks';
import { getEnv } from '@/server/env';
import { now } from '@/server/clock';

export const prerender = false;

const empty = (status: number) =>
  new Response(null, { status, headers: { 'Cache-Control': 'no-store' } });

/** Counts one tap on a WhatsApp button (docs/10 §7). The IP only keys the limiter; it is not stored. */
export const POST: APIRoute = async ({ request, clientAddress }) => {
  const limiter = getEnv().CLICK_LIMITER;
  if (limiter) {
    const key = request.headers.get('cf-connecting-ip') ?? clientAddress ?? 'unknown';
    const { success } = await limiter.limit({ key });
    if (!success) return empty(429);
  }
  const text = await request.text().catch(() => '');
  if (text.length > 512) return empty(400);
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return empty(400);
  }
  const parsed = clickInputSchema.safeParse(body);
  if (!parsed.success) return empty(400);
  const counted = await countClick(parsed.data, now(request));
  return empty(counted ? 204 : 400);
};
