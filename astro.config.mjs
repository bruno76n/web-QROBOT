// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'server',
  // The dev toolbar floats over the save bars of the panel and breaks the browser tests.
  devToolbar: { enabled: false },
  adapter: cloudflare({ imageService: 'passthrough' }),
  integrations: [react()],
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data: blob:",
        "media-src 'self'",
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
