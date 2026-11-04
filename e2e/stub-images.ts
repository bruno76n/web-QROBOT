import type { BrowserContext } from '@playwright/test';

// A 1×1 WebP. In the production build photos come from img.<domain>, which does not exist while
// the domain is provisional, so the tests answer those requests themselves.
const PIXEL = Buffer.from('UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==', 'base64');

export async function stubPhotoHost(context: BrowserContext) {
  await context.route(/^https:\/\/img\.[^/]+\/.*/, (route) =>
    route.fulfill({
      status: 200,
      contentType: route.request().url().endsWith('.jpg') ? 'image/jpeg' : 'image/webp',
      body: PIXEL,
    }),
  );
}
