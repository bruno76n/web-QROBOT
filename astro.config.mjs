// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { site } from './src/config/site.ts';

// Photos are served from img.<domain> in production (docs/13 §3); the CSP has to allow that host.
const imgHost = `https://img.${new URL(site.domain).host}`;

export default defineConfig({
  output: 'server',
  // 'ignore' because the middleware answers 301 to the slash-less URL (docs/14 §4); Astro's own
  // 'never' answers 404 before the middleware runs.
  trailingSlash: 'ignore',
  // `privacidad.html` (not `privacidad/index.html`): the asset server then answers /privacidad without
  // the redirect to a trailing slash that the middleware would undo (docs/decisiones.md).
  build: { format: 'file' },
  // The dev toolbar floats over the save bars of the panel and breaks the browser tests.
  devToolbar: { enabled: false },
  adapter: cloudflare({ imageService: 'passthrough' }),
  integrations: [react()],
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        `img-src 'self' ${imgHost} data: blob:`,
        `media-src 'self' ${imgHost}`,
        "font-src 'self'",
        "connect-src 'self'",
        "worker-src 'self' blob:",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
      ],
      // Components (motion, Embla, 21st.dev) use inline styles: no style hashes (docs/13 §3).
      styleDirective: { resources: ["'self'", "'unsafe-inline'"] },
    },
  },
  vite: { plugins: [tailwindcss()] },
});
