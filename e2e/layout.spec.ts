import { test, expect } from '@playwright/test';
import { stubPhotoHost } from './stub-images';
import { publicUrls } from './urls';

// Header and footer must match the mockup in structure and size (docs/fases/fase-1.md §1.4).
test.beforeEach(({ context }) => stubPhotoHost(context));

for (const url of publicUrls) {
  test.describe(`layout ${url}`, () => {
    test('header, footer and no horizontal overflow', async ({ page }, info) => {
      await page.goto(url);
      const header = page.locator('header[data-top]');
      await expect(header).toBeVisible();
      expect((await header.boundingBox())?.height).toBe(68);

      // Black tab with the four links only from 900 px up (mockup: @media max-width 900px).
      const nav = page.getByRole('navigation', { name: 'Principal' });
      const wide = (page.viewportSize()?.width ?? 0) > 900;
      if (wide) {
        await expect(nav).toBeVisible();
        await expect(nav.getByRole('link')).toHaveText(['Navidad', 'Ideas', 'Catálogo', 'Q-404']);
      } else {
        await expect(nav).toBeHidden();
      }
      await expect(header.getByRole('link', { name: 'Cotizar' })).toHaveAttribute(
        'href',
        '/#pedido',
      );

      // Footer: contact data, copyright and a giant name that spans the container exactly.
      const footer = page.locator('footer');
      await expect(footer).toContainText('WhatsApp');
      await expect(footer).toContainText('Facebook');
      await expect(footer).toContainText('Instagram');
      await expect(footer).toContainText('Impresión 3D en Guadalajara');
      const box = await footer.locator('.footer-name').boundingBox();
      const textWidth = await footer.locator('.footer-name span').evaluate((el) => {
        const r = document.createRange();
        r.selectNodeContents(el);
        return r.getBoundingClientRect().width;
      });
      expect(Math.abs(textWidth - (box?.width ?? 0))).toBeLessThanOrEqual(2);

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      expect(overflow).toBe(false);

      await page.screenshot({
        path: `test-results/screens/${url === '/' ? 'home' : url.replace(/\W+/g, '-')}-${info.project.name}.png`,
        fullPage: true,
      });
    });

    test('keyboard focus is visible and skip link works', async ({ page }) => {
      await page.goto(url);
      await page.keyboard.press('Tab');
      const skip = page.getByRole('link', { name: 'Ir al contenido' });
      await expect(skip).toBeFocused();
      await expect(skip).toBeVisible();
    });
  });
}
