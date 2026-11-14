/**
 * Search endpoint `GET /api/aprende/buscar?q=…&tema=…` (docs/22 §7): the only way the browser
 * searches Aprende. Rate-limited per IP (the IP is not stored), input checked with Zod, results
 * from Meilisearch or D1 with the highlight split into parts. A search without results of 3
 * characters or more is counted for the day, after the answer is sent. Errors carry a code only.
 */
import type { APIRoute } from 'astro';
import { site } from '@/config/site';
import { learnSearchInput } from '@/lib/learn/content';
import { getEnv } from '@/server/env';
import { now } from '@/server/clock';
import { dayKey } from '@/server/clicks';
import { meiliConfig, recordSearchMiss, searchLearn } from '@/server/search';

export const prerender = false;

/** JSON answer; results may be cached for a minute, errors never. */
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': status === 200 ? 'public, max-age=60' : 'no-store',
    },
  });

export const GET: APIRoute = async ({ request, url, clientAddress, locals }) => {
  const env = getEnv();
  // Rate limit per IP, when the limiter binding exists (production and `wrangler dev`).
  const limiter = env.SEARCH_LIMITER;
  if (limiter) {
    const key = request.headers.get('cf-connecting-ip') ?? clientAddress ?? 'unknown';
    const { success } = await limiter.limit({ key });
    if (!success) return json(429, { ok: false, code: 'RATE_LIMITED' });
  }
  const parsed = learnSearchInput.safeParse({
    q: url.searchParams.get('q') ?? '',
    tema: url.searchParams.get('tema') ?? '',
  });
  if (!parsed.success) return json(400, { ok: false, code: 'BAD_INPUT' });
  const { q, tema } = parsed.data;

  try {
    const result = await searchLearn(q, tema || undefined, meiliConfig(env));
    if (result.total === 0) {
      const miss = recordSearchMiss(q, dayKey(now(request), site.timeZone)).catch(() => false);
      const ctx = (locals as { cfContext?: ExecutionContext }).cfContext;
      if (ctx) ctx.waitUntil(miss);
      else await miss;
    }
    return json(200, result);
  } catch {
    return json(500, { ok: false, code: 'SEARCH_FAILED' });
  }
};
