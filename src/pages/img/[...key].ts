/**
 * Development-only image route `/img/<key>`: serves a photo straight from the local R2 bucket,
 * so the site works without the public image domain. Production answers 404.
 */
import type { APIRoute } from 'astro';
import { getAppEnv, getEnv } from '@/server/env';
import { serveDevImage } from '@/server/images';

// Development only: 404 when APP_ENV is production (docs/10 §9).
export const GET: APIRoute = ({ params }) =>
  serveDevImage(params.key, getAppEnv(), getEnv().BUCKET);
