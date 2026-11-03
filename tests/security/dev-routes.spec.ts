import { test, expect } from '@playwright/test';

// docs/10 §9: development-only routes must not exist in the production build.
// `pnpm preview` serves the production build with the production vars of wrangler.jsonc
// (`pnpm dev` keeps its development vars in `.dev.vars.local`, which preview never reads).
test('/img answers 404 in the production build', async ({ request }) => {
  for (const path of ['/img/ph/any/400.webp', '/img/', '/img/../wrangler.jsonc']) {
    expect((await request.get(path)).status(), path).toBe(404);
  }
});

test('/dev/ui answers 404 in the production build', async ({ request }) => {
  expect((await request.get('/dev/ui')).status()).toBe(404);
});
