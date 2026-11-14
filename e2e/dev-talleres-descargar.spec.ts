import { test, expect, type Browser, type ViewportSize } from '@playwright/test';

// Flow P (docs/25 §7.3, §12), with `pnpm dev` (the page for workshops is hidden in any build): the
// server picks the main download button from the `User-Agent`, marks the visitor's row «Tu equipo»
// and answers with `Vary: User-Agent`. Each device gets a fresh context with its own agent, at the
// width of the project.

const devices = [
  {
    name: 'Mac',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    button: 'Descargar para Mac',
    href: '/talleres/descargar#mac',
    row: 'mac',
    browserButton: true,
  },
  {
    name: 'Windows',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0',
    button: 'Descargar para Windows',
    href: '/talleres/descargar#windows',
    row: 'windows',
    browserButton: true,
  },
  {
    name: 'iPhone',
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    button: 'Abrir en el navegador',
    href: /^https:\/\//,
    row: 'mobile',
    browserButton: false,
  },
] as const;

async function openAs(
  browser: Browser,
  options: { baseURL: string | undefined; viewport: ViewportSize | null; userAgent: string },
) {
  const { baseURL, ...rest } = options;
  const context = await browser.newContext(baseURL ? { ...rest, baseURL } : rest);
  const page = await context.newPage();
  const res = await page.goto('/talleres/descargar');
  return { context, page, res };
}

for (const d of devices) {
  test(`P · ${d.name}: su botón y su fila marcada`, async ({ browser, baseURL, viewport }) => {
    const { context, page, res } = await openAs(browser, {
      baseURL,
      viewport,
      userAgent: d.userAgent,
    });
    expect(res?.status()).toBe(200);
    expect(res?.headers()['vary'] ?? '').toMatch(/user-agent/i);

    await expect(page.getByRole('heading', { level: 1, name: 'Descargar' })).toBeVisible();
    const main = page.locator('.dl-main a').first();
    await expect(main).toContainText(d.button);
    await expect(main).toHaveAttribute('href', d.href);
    // Desktops also get «Abrir en el navegador»; phones only have it as the main button.
    await expect(page.locator('.dl-main a')).toHaveCount(d.browserButton ? 2 : 1);
    await expect(page.locator('.dl-main a[href^="https://"]')).toHaveAttribute('rel', 'noopener');

    // Only the visitor's row is marked.
    const marked = page.locator('.plats li.on');
    await expect(marked).toHaveCount(1);
    await expect(marked).toHaveAttribute('id', d.row);
    await expect(marked).toContainText('Tu equipo');
    await expect(page.getByText('Tu equipo')).toHaveCount(1);

    // No script of its own and no sideways scroll.
    await expect(page.locator('main script, .system script')).toHaveCount(0);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    await context.close();
  });
}
