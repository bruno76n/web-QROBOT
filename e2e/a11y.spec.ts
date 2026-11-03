import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { publicUrls } from './urls';

for (const url of publicUrls) {
  test(`axe: no serious violations on ${url}`, async ({ page }) => {
    await page.goto(url);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });
}
