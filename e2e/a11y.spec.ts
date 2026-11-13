import { test, expect } from '@playwright/test';
import { stubPhotoHost } from './stub-images';
import AxeBuilder from '@axe-core/playwright';
import { publicUrls } from './urls';

test.beforeEach(({ context }) => stubPhotoHost(context));

for (const url of publicUrls) {
  test(`axe: no serious violations on ${url}`, async ({ page }) => {
    await page.goto(url);
    if (url === '/') {
      // Over the hero the header logo fades out (300 ms); wait so axe does not read it mid-fade.
      await expect(page.locator('header[data-top]')).toHaveAttribute('data-over-hero', '');
      await expect(page.locator('header[data-top] a[aria-label]').first()).toBeHidden();
    }
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });
}
