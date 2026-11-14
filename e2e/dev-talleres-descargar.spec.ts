import { test, expect } from '@playwright/test';
import { site } from '../src/config/site';
import { es } from '../src/i18n/es';

// Flow P of docs/25 §12: the download page picks its main button on the server from the
// `User-Agent`, marks the visitor's row «Para tu equipo» and answers with `Vary: User-Agent`.
// Needs the development server: the page for workshops is hidden in the production build.
const t = es.system.download;
const { appUrl, downloads } = site.system;

const cases = [
  {
    device: 'Mac',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    row: 'mac',
    label: t.main.mac,
    href: downloads.mac.url || '/talleres/descargar#mac',
    req: t.req.mac(downloads.mac.minOs),
    alsoBrowser: true,
  },
  {
    device: 'Windows',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0',
    row: 'windows',
    label: t.main.windows,
    href: downloads.windows.url || '/talleres/descargar#windows',
    req: t.req.windows(downloads.windows.minOs),
    alsoBrowser: true,
  },
  {
    device: 'iPhone',
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    row: 'mobile',
    label: t.main.mobile,
    href: appUrl,
    req: t.req.mobile,
    alsoBrowser: false,
  },
] as const;

for (const c of cases) {
  test.describe(`descargar con un equipo ${c.device}`, () => {
    test.use({ userAgent: c.userAgent });

    test('el botón principal y la fila marcada son los de su equipo', async ({ page }) => {
      const response = await page.goto('/talleres/descargar');
      expect(response?.status()).toBe(200);
      expect(response?.headers()['vary'] ?? '').toMatch(/(^|,\s*)User-Agent(\s*,|$)/i);

      const main = page.locator('[data-dl-main]');
      await expect(main).toHaveAccessibleName(c.label);
      await expect(main).toHaveAttribute('href', c.href);
      await expect(page.locator('.dl-req')).toHaveText(c.req);

      // Computers get «Abrir en el navegador» beside the installer; phones only need the one.
      const header = page.locator('.dl-main a');
      await expect(header).toHaveCount(c.alsoBrowser ? 2 : 1);
      if (c.alsoBrowser) {
        await expect(header.nth(1)).toHaveText(t.openBrowser);
        await expect(header.nth(1)).toHaveAttribute('href', appUrl);
        await expect(header.nth(1)).toHaveAttribute('rel', 'noopener');
      } else {
        await expect(main).toHaveAttribute('rel', 'noopener');
      }

      // Only the visitor's row carries the mark.
      const mark = page.getByText(t.forYou, { exact: true });
      await expect(mark).toHaveCount(1);
      await expect(page.locator(`.plats li#${c.row}`)).toContainText(t.forYou);
      await expect(page.locator('.plats li')).toHaveCount(4);
    });
  });
}
