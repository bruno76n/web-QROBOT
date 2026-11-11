import { test, expect } from '@playwright/test';
import { stubPhotoHost } from './stub-images';
import { site } from '../src/config/site';

test.beforeEach(({ context }) => stubPhotoHost(context));

// Flows A, C and G of docs/04 §6, plus the "no JavaScript" state of docs/04 §7.
// They run on the production build with the seed (the web server command reloads it).
const WA = site.whatsapp;
const waText = (href: string | null) => {
  expect(href, 'whatsapp link').toMatch(new RegExp(`^https://wa\\.me/${WA}\\?text=`));
  return decodeURIComponent((href ?? '').split('?text=')[1] ?? '');
};

test('flujo A: del catálogo a un producto y pedirlo por WhatsApp con el mensaje exacto', async ({
  page,
}) => {
  await page.goto('/catalogo');
  await page
    .getByRole('link', { name: /Llaveros con nombre/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/producto\/llaveros-con-nombre$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Llaveros con nombre');

  await page.getByRole('radio', { name: 'Verde' }).click();
  await page.getByLabel('Nombre (hasta 10 letras)').fill('SOFI');
  const qty = page.getByLabel('Cantidad');
  await qty.fill('3');
  const link = page.getByRole('link', { name: /Pedir por WhatsApp/ });
  expect(waText(await link.getAttribute('href'))).toBe(
    `Hola, me interesa: 3 llaveros en verde (Nombre (hasta 10 letras): SOFI). ¿Cuánto me sale y para cuándo lo tendrían?\n${site.domain}/producto/llaveros-con-nombre`,
  );
  // singular for 1, and the +/- buttons
  await qty.fill('1');
  expect(waText(await link.getAttribute('href'))).toContain('me interesa: 1 llavero en verde');
  await page.getByRole('button', { name: 'Más' }).click();
  await expect(qty).toHaveValue('2');
  expect(waText(await link.getAttribute('href'))).toContain('2 llaveros en verde');

  // The tap is counted with the product id (docs/18 §4); the real WhatsApp page is not opened.
  await page.context().route('https://wa.me/**', (route) => route.abort());
  const beacon = page.waitForRequest((r) => r.url().endsWith('/api/click'));
  await link.click();
  const sent = (await beacon).postDataJSON() as { source: string; productId: string };
  expect(sent.source).toBe('product');
  expect(sent.productId).toMatch(/\S+/);
});

test('/api/click cuenta un toque, rechaza lo inválido y no guarda nada de la persona', async ({
  request,
}) => {
  const post = (data: unknown) =>
    request.post('/api/click', { data, headers: { 'content-type': 'application/json' } });
  expect((await post({ source: 'order' })).status()).toBe(204);
  expect((await post({ source: 'robar' })).status()).toBe(400);
  expect((await post({ source: 'product', productId: 'no-existe' })).status()).toBe(400);
  expect((await post({ source: 'product' })).status()).toBe(400);
  expect((await request.post('/api/click', { data: 'no es json' })).status()).toBe(400);
});

test('un producto sin colores ni personalización no muestra esas opciones', async ({ page }) => {
  await page.goto('/producto/q-404');
  await expect(page.getByRole('radiogroup')).toHaveCount(0);
  await expect(page.getByLabel(/Nombre/)).toHaveCount(0);
  const link = page.getByRole('link', { name: /Pedir por WhatsApp/ });
  expect(waText(await link.getAttribute('href'))).toBe(
    `Hola, me interesa: 1 Q-404. ¿Cuánto me sale y para cuándo lo tendrían?\n${site.domain}/producto/q-404`,
  );
  // six photos: counter, thumbnails and arrows
  await expect(page.getByText('1 / 6')).toBeVisible();
  await page.getByRole('button', { name: 'Foto siguiente' }).click();
  await expect(page.getByText('2 / 6')).toBeVisible();
});

test('sin JavaScript el link base de WhatsApp sigue funcionando', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/producto/llaveros-con-nombre');
  const link = page.getByRole('link', { name: /Pedir por WhatsApp/ });
  expect(waText(await link.getAttribute('href'))).toContain(
    'Hola, me interesa: 1 llavero en morado',
  );
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await context.close();
});

test('flujo G: las etiquetas para compartir de un producto', async ({ page, request }) => {
  const res = await request.get('/producto/macetas');
  expect(res.status()).toBe(200);
  await page.goto('/producto/macetas');
  const meta = async (sel: string) => page.locator(sel).first().getAttribute('content');
  expect(await page.title()).toBe('Macetas desde $150 · Quick Robot');
  expect(await meta('meta[property="og:title"]')).toBe('Macetas desde $150 · Quick Robot');
  expect(await meta('meta[property="og:description"]')).toBe(
    'Para tu cactus o tus suculentas, del color que quieras. Impresión 3D.',
  );
  expect(await meta('meta[property="og:type"]')).toBe('product');
  expect(await meta('meta[property="og:locale"]')).toBe('es_MX');
  expect(await meta('meta[property="og:site_name"]')).toBe('Quick Robot');
  expect(await meta('meta[property="product:price:amount"]')).toBe('150.00');
  expect(await meta('meta[property="product:price:currency"]')).toBe('MXN');
  expect(await meta('meta[name="twitter:card"]')).toBe('summary_large_image');
  const image = await meta('meta[property="og:image"]');
  expect(image).toMatch(
    new RegExp(`^${site.imgBase.replace(/\./g, '\\.')}/ph/seed-macetas-1/[0-9a-f]{8}/og\\.jpg$`),
  );
  expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toBe(
    `${site.domain}/producto/macetas`,
  );
  expect(await page.locator('html').getAttribute('lang')).toBe('es-MX');
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
    'href',
    '/brand/apple-touch-icon.png',
  );

  // JSON-LD: the Product and the breadcrumbs
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  const data = blocks.map((b) => JSON.parse(b) as Record<string, unknown>);
  const product = data.find((d) => d['@type'] === 'Product');
  expect(product).toMatchObject({
    name: 'Macetas',
    brand: { name: 'Quick Robot' },
    offers: { '@type': 'AggregateOffer', lowPrice: '150.00', priceCurrency: 'MXN' },
  });
  expect(data.find((d) => d['@type'] === 'BreadcrumbList')).toBeTruthy();
});

test('sitemap, robots y URLs sin barra final', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain(`<loc>${site.domain}/catalogo/navidad</loc>`);
  expect(sitemap).toContain(`<loc>${site.domain}/producto/macetas</loc>`);
  expect((sitemap.match(/<url>/g) ?? []).length).toBeGreaterThanOrEqual(20);
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Disallow: /admin');
  expect(robots).toContain(`Sitemap: ${site.domain}/sitemap.xml`);
  const slash = await request.get('/catalogo/', { maxRedirects: 0 });
  expect(slash.status()).toBe(301);
  expect(slash.headers()['location']).toMatch(/\/catalogo$/);
});

test('categoría desconocida y producto inexistente dan 404 con la página de Q-404', async ({
  page,
}) => {
  for (const path of ['/catalogo/nada', '/producto/no-existe', '/no-existe']) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(404);
    await expect(
      page.getByRole('heading', { name: 'Error 404: página no encontrada.' }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Ver el catálogo' })).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  }
});

test('navegar entre páginas con islas no rompe la CSP ni la consola', async ({ page }) => {
  const problems: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error' || /content security policy/i.test(m.text())) problems.push(m.text());
  });
  page.on('pageerror', (e) => problems.push(e.message));
  await page.goto('/catalogo');
  await page
    .getByRole('link', { name: /Llaveros con nombre/ })
    .first()
    .click();
  await expect(page.getByRole('link', { name: /Pedir por WhatsApp/ })).toBeVisible();
  await page.getByRole('radio', { name: 'Azul' }).click(); // the island works after navigating
  await page.getByRole('link', { name: 'Catálogo', exact: true }).first().click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Elige uno.');
  await page
    .getByRole('link', { name: /Llaveros con nombre/ })
    .first()
    .click();
  await page.getByRole('radio', { name: 'Verde' }).click(); // the island mounts again after a second swap
  expect(problems, problems.join('\n')).toEqual([]);
});

test('la imagen principal del producto es prioritaria y el resto es perezosa', async ({ page }) => {
  await page.goto('/producto/q-404');
  const imgs = page.locator('section[aria-roledescription="carousel"] img');
  await expect(imgs.first()).toHaveAttribute('fetchpriority', 'high');
  await expect(imgs.nth(1)).toHaveAttribute('loading', 'lazy');
  await expect(page.locator('link[rel="preload"][as="image"]')).toHaveCount(1);
  await page.goto('/catalogo');
  await expect(page.locator('ul[aria-label="Productos"] img').last()).toHaveAttribute(
    'loading',
    'lazy',
  );
});

test('la página de error del servidor tiene su texto y un botón para intentar de nuevo', async ({
  page,
}) => {
  const res = await page.goto('/500');
  expect(res?.status()).toBe(500);
  await expect(
    page.getByRole('heading', { name: 'Algo salió mal de nuestro lado.' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Intentar de nuevo' })).toBeVisible();
  // no technical details leak
  expect(await page.content()).not.toMatch(/stack|Error:|at \w+ \(/i);
});
