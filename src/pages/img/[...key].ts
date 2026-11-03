import type { APIRoute } from 'astro';
import { getAppEnv, getEnv } from '@/server/env';
import { serveDevImage } from '@/server/images';

// Development only: 404 when APP_ENV is production (docs/10 §9).
export const GET: APIRoute = ({ params }) =>
  serveDevImage(params.key, getAppEnv(), getEnv().BUCKET);
