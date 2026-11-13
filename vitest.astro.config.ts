// Vitest project for Astro components (rendered with the Container API): it needs Astro's own Vite
// config to compile `.astro` files, which the plain Node and Workers projects do not have.
import { getViteConfig } from 'astro/config';

export default getViteConfig(
  {
    test: {
      name: 'astro',
      environment: 'node',
      include: ['tests/**/*.astro.test.ts'],
    },
  },
  // The Cloudflare adapter is not needed to render a component; leaving it out keeps the test in Node.
  { configFile: false, root: new URL('.', import.meta.url).pathname },
);
