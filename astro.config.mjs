// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { site } from './src/config/site.ts';

// Photos are served from their own host in production (docs/13 §3); the CSP has to allow it.
const imgHost = site.imgBase;

export default defineConfig({
  output: 'server',
  // 'ignore' because the middleware answers 301 to the slash-less URL (docs/14 §4); Astro's own
  // 'never' answers 404 before the middleware runs.
  trailingSlash: 'ignore',
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
        "connect-src 'self' https://cloudflareinsights.com",
        "worker-src 'self' blob:",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
      ],
      // Components (motion, Embla, 21st.dev) use inline styles: no style hashes (docs/13 §3).
      // The only third-party script: Cloudflare Web Analytics, switched on from the dashboard (docs/13 §3, §7).
      // 'wasm-unsafe-eval' lets Safari run the WebP encoder (WASM) of the photo panel; it allows
      // compiling WebAssembly only, not eval() of strings (docs/13 §3).
      scriptDirective: {
        resources: ["'self'", "'wasm-unsafe-eval'", 'https://static.cloudflareinsights.com'],
      },
      styleDirective: { resources: ["'self'", "'unsafe-inline'"] },
    },
  },
  vite: { plugins: [tailwindcss()] },
});
