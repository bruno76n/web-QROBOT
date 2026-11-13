/**
 * `/robots.txt`, generated from the site domain by `robotsTxt` and cached for an hour.
 */
import type { APIRoute } from 'astro';
import { site } from '@/config/site';
import { robotsTxt } from '@/lib/seo';

export const prerender = false;

export const GET: APIRoute = () =>
  new Response(robotsTxt(site.domain), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
