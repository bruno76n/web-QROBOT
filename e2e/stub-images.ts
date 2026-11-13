/**
 * Test helper that answers photo-host requests locally, so pages with photos load without the network.
 */
import type { BrowserContext } from '@playwright/test';
import { site } from '../src/config/site';

// A 1×1 WebP. Photos come from `site.imgBase` (a real host in production); the tests answer
// those requests themselves so they do not depend on the network.
const PIXEL = Buffer.from('UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==', 'base64');

/** Routes every request to the photo host of `site.imgBase` to a 1×1 image, for the whole context. */
export async function stubPhotoHost(context: BrowserContext) {
  await context.route(`${site.imgBase}/**`, (route) =>
    route.fulfill({
      status: 200,
      contentType: route.request().url().endsWith('.jpg') ? 'image/jpeg' : 'image/webp',
      body: PIXEL,
    }),
  );
}
