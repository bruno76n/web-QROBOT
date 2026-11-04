import { test, expect } from '@playwright/test';
import { stubPhotoHost } from './stub-images';

// The home page (docs/fases/fase-4.md): flow B, the header over the hero, printing, Q-404, the pool.
test.beforeEach(({ context }) => stubPhotoHost(context));

const WA = '52XXXXXXXXXX';

/** The order island hydrates when it scrolls into view: wait for it before typing. */
const orderReady = (page: import('@playwright/test').Page) =>
  page.waitForFunction(() => {
    const island = document.querySelector('astro-island:has(form.chat)');
    return island !== null && !island.hasAttribute('ssr');
  });
const waText = (href: string | null) => {
  expect(href, 'whatsapp link').toMatch(new RegExp(`^https://wa\\.me/${WA}\\?text=`));
  return decodeURIComponent((href ?? '').split('?text=')[1] ?? '');
};

test('flujo B: tocar "Servilleteros" llena el pedido y el link de WhatsApp lleva ese mensaje', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Servilleteros/ }).click();
  await expect(page).toHaveURL(/#pedido=servilleteros$/);
  await orderReady(page);
  const quantity = page.getByLabel('Cantidad');
  await expect(quantity).toHaveValue('20');
  await expect(page.getByLabel('Qué pieza')).toHaveValue('0');
  await expect(page.getByLabel('Con qué')).toHaveValue('0');
  const send = page.getByRole('link', { name: /Mandar por WhatsApp/ });
  expect(waText(await send.getAttribute('href'))).toBe(
    'Hola, necesito 20 servilleteros con mi logo. Lo necesito lo antes posible.\n(Lo vi en su página.)',
  );
  // the blanks are editable and the plural follows the quantity
  await page.getByLabel('Tu nombre o el de tu negocio').fill('Taquería Los Primos');
  await quantity.fill('1');
  await page.getByLabel('Detalles opcionales').fill('En negro');
  expect(waText(await send.getAttribute('href'))).toBe(
    'Hola, soy Taquería Los Primos y necesito 1 servilletero con mi logo. Lo necesito lo antes posible.\nDetalles: En negro\n(Lo vi en su página.)',
  );
});

test('"Apartar un regalo" llena el pedido de Navidad', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Apartar un regalo/ }).click();
  await expect(page).toHaveURL(/#pedido=navidad$/);
  await orderReady(page);
  const send = page.getByRole('link', { name: /Mandar por WhatsApp/ });
  expect(waText(await send.getAttribute('href'))).toBe(
    'Hola, necesito 1 figura con una foto. Lo necesito antes de Navidad.\n(Lo vi en su página.)',
  );
});

test('el header muestra "Impresión 3D · Guadalajara" sobre el hero y el logo al pasarlo', async ({
  page,
}) => {
  await page.goto('/');
  const header = page.locator('header[data-top]');
  await expect(header).toHaveAttribute('data-over-hero', '');
  await page.locator('#ideas').scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, 400));
  await expect(header).not.toHaveAttribute('data-over-hero', '');
});

test('el hero trae el nombre en una línea, ocupa el ancho y la imagen es prioritaria', async ({
  page,
}) => {
  await page.goto('/');
  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toContainText('Quick Robot');
  const { box, width, wrap } = await h1.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(el);
    return {
      box: r.height,
      width: range.getBoundingClientRect().width,
      wrap: el.parentElement?.clientWidth ?? 0,
    };
  });
  expect(box).toBeLessThan(width / 3); // a single line
  expect(width).toBeLessThanOrEqual(wrap + 2);
  expect(width).toBeGreaterThan(wrap * 0.9);
  await expect(page.locator('section.hero img').first()).toHaveAttribute('fetchpriority', 'high');
  await expect(page.locator('link[rel="preload"][as="image"]')).toHaveCount(2);
});

test('Imprimiendo: el contador de capas avanza con el scroll', async ({ page }) => {
  await page.goto('/');
  const layer = page.locator('[data-layer]');
  await page.locator('#imprimiendo').scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, 1));
  const first = Number(await layer.textContent());
  await page.evaluate(() => window.scrollBy(0, 500));
  await expect.poll(async () => Number(await layer.textContent())).toBeGreaterThan(first);
  await page.evaluate(() => window.scrollBy(0, 4000));
  await expect(page.locator('#imprimiendo')).toHaveClass(/done/);
  await expect(page.getByText('Listo. Salió un Q-404.')).toBeVisible();
});

test('Imprimiendo con movimiento reducido muestra el robot completo', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('#imprimiendo')).not.toHaveClass(/\bon\b/);
});

test('Q-404: elegir colores cambia el render, el nombre y el mensaje', async ({ page }) => {
  await page.goto('/');
  const send = page.getByRole('link', { name: /Quiero este Q-404/ });
  expect(waText(await send.getAttribute('href'))).toBe(
    'Hola, quiero un Q-404 en morado y verde. ¿Cuánto cuesta y cuándo lo tendrían?',
  );
  await page.locator('#q404 .chip', { hasText: 'Rosa y menta' }).click();
  await expect(page.locator('[data-name]')).toHaveText('Rosa y menta');
  expect(waText(await send.getAttribute('href'))).toBe(
    'Hola, quiero un Q-404 en rosa y menta. ¿Cuánto cuesta y cuándo lo tendrían?',
  );
  await expect(page.locator('[data-render="4"]')).toHaveCSS('opacity', '1');
  await expect(page.locator('[data-render="0"]')).toHaveCSS('opacity', '0');
  await expect(page.locator('.r1-note')).toContainText('Desde $350');
});

test('Video: sin archivo el botón está deshabilitado y dice por qué', async ({ page }) => {
  await page.goto('/');
  const play = page.locator('[data-play]');
  await expect(play).toBeDisabled();
  await expect(play).toHaveAttribute('aria-label', /todavía no hay video/);
  await expect(page.getByText('Timelapse')).toBeVisible();
});

test('la alberca: matter-js solo se baja al tocar, aparece el canvas y Escape lo quita', async ({
  page,
}) => {
  const heavy: string[] = [];
  page.on('request', (r) => {
    if (/matter|\/pit\./i.test(r.url())) heavy.push(r.url());
  });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect(heavy, 'no physics before touching the button').toEqual([]);
  const button = page.getByRole('button', { name: 'No aprietes este botón' });
  await button.scrollIntoViewIfNeeded();
  await button.click();
  const canvas = page.locator('canvas.pit');
  await expect(canvas).toBeVisible({ timeout: 15_000 });
  expect(heavy.length).toBeGreaterThan(0);
  await expect(canvas).toHaveCSS('pointer-events', 'none'); // it never blocks clicks
  await expect(page.getByRole('button', { name: 'Vaciar los robots' })).toBeVisible();
  await page.waitForTimeout(1500);
  await page.keyboard.press('Escape');
  await expect(canvas).toHaveCount(0, { timeout: 20_000 });
  await expect(page.getByRole('button', { name: 'Te dije que no' })).toBeVisible();
  await expect(page.getByText('Te dije.')).toBeVisible();
});

test('la alberca con movimiento reducido es corta y se quita sola', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: 'No aprietes este botón' }).click();
  await expect(page.locator('canvas.pit')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('canvas.pit')).toHaveCount(0, { timeout: 10_000 });
});

test('¿Qué se te antoja?: en pantallas táctiles sale la foto de la fila de la mitad', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'w390', 'only the phone layout');
  await page.goto('/');
  await page.locator('#ideas').scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, 200));
  await expect(page.locator('.idx .row.act')).toHaveCount(1, { timeout: 10_000 });
});

test('el servidor de producción ignora x-test-now', async ({ request }) => {
  // The build runs with APP_ENV=production: the header must change nothing (docs/10 §8).
  const html = await (
    await request.get('/', { headers: { 'x-test-now': '2026-09-30T12:00:00-06:00' } })
  ).text();
  const real = await (await request.get('/')).text();
  expect(html.includes('id="navidad"')).toBe(real.includes('id="navidad"'));
});

test('al volver al inicio después de navegar, los scripts de las secciones siguen funcionando', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Abre el catálogo/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Elige uno.');
  await page.getByRole('link', { name: 'Quick Robot, ir al inicio' }).first().click();
  await expect(page.locator('section.hero')).toBeVisible();
  // Q-404 chips, the pool button and the order links all work after the swap
  await page.locator('#q404 .chip', { hasText: 'Azul y lima' }).click();
  await expect(page.locator('[data-name]')).toHaveText('Azul y lima');
  await expect(page.getByRole('button', { name: 'No aprietes este botón' })).toBeVisible();
  await page.getByRole('link', { name: /Porta QR/ }).click();
  await expect(page).toHaveURL(/#pedido=porta-qr$/);
  await expect(page.locator('#pedido')).toBeInViewport({ timeout: 10_000 });
});
