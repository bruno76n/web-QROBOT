import { test, expect } from '@playwright/test';
import { makePhoto, reseed } from './admin-helpers';

// Needs the development server: the date is simulated on both sides (docs/10 §8) with the
// `x-test-now` header (server) and Playwright's clock (browser), and flow E uses the panel.
test.describe.configure({ mode: 'serial' });
test.beforeAll(() => reseed());

const at = (iso: string) => new Date(iso);

async function openHomeAt(page: import('@playwright/test').Page, iso: string) {
  await page.setExtraHTTPHeaders({ 'x-test-now': iso });
  await page.clock.install({ time: at(iso) });
  await page.goto('/');
}

test('Navidad no existe en septiembre', async ({ page }) => {
  await openHomeAt(page, '2026-09-30T23:59:00-06:00');
  await expect(page.locator('#navidad')).toHaveCount(0);
  await expect(
    page.getByRole('heading', { name: 'Regala algo que no hay en ninguna tienda.' }),
  ).toHaveCount(0);
});

test('Navidad aparece el 1 de octubre', async ({ page }) => {
  await openHomeAt(page, '2026-10-01T00:00:00-06:00');
  await expect(page.locator('#navidad')).toBeVisible();
  await expect(page.locator('[data-d]')).toHaveText('84');
});

test('el 23 de diciembre a las 18:00 faltan 0 días y 6 horas, y el contador corre', async ({
  page,
}) => {
  await openHomeAt(page, '2026-12-23T18:00:00-06:00');
  const section = page.locator('#navidad');
  await expect(section).toBeVisible();
  await expect(section.locator('[data-d]')).toHaveText('0');
  await expect(section.locator('[data-dl]')).toHaveText('días');
  await expect(section.locator('[data-h]')).toHaveText('06');
  await expect(section.locator('[data-m]')).toHaveText('00');
  await page.clock.runFor(61_000);
  await expect(section.locator('[data-h]')).toHaveText('05');
  await expect(section.locator('[data-m]')).toHaveText('58');
  // the line: today's robot is near the end, the deadline mark says 12 dic
  await expect(section.locator('[data-dl-t]')).toHaveText('12 dic');
  // four gifts: published, Navidad and "Más pedido", in catalog order, each linking to its page
  const gifts = section.locator('.gift');
  await expect(gifts).toHaveCount(4);
  await expect(gifts.first()).toHaveAttribute('href', '/producto/llaveros-con-nombre');
});

test('el 24 de diciembre dice "Hoy es Nochebuena." y el 25 desaparece', async ({ page }) => {
  await openHomeAt(page, '2026-12-24T12:00:00-06:00');
  await expect(page.locator('#navidad [data-k]')).toHaveText('Hoy es Nochebuena.');
  await expect(page.locator('#navidad [data-d]')).toHaveText('0');
  const other = await page.context().newPage();
  await other.setExtraHTTPHeaders({ 'x-test-now': '2026-12-25T00:00:00-06:00' });
  await other.goto('/');
  await expect(other.locator('#navidad')).toHaveCount(0);
});

test('flujo E: cambiar la portada en el panel se ve en el inicio, de escritorio y de celular', async ({
  page,
}, info) => {
  await page.goto('/admin/portada');
  await expect(page.getByRole('heading', { name: 'Portada del inicio' })).toBeVisible({
    timeout: 30_000,
  });
  // start from the default hero, then upload a desktop and a phone photo and center them
  await page.getByRole('button', { name: 'Volver a la foto original' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Sí, volver' }).click();
  await expect(page.getByText('Usa la foto por defecto')).toBeVisible();
  await page
    .getByLabel('Arrastra fotos aquí')
    .setInputFiles(await makePhoto('jpeg', 2400, 1350, '#00ae42'));
  await expect(page.locator('.sl')).toHaveCount(1);
  await expect(page.locator('.sl .d i[role=progressbar]')).toHaveCount(0, { timeout: 40_000 });
  await page
    .locator('.sl')
    .first()
    .getByLabel('Subir la de celular')
    .setInputFiles(await makePhoto('jpeg', 1200, 1600, '#6b3fd4'));
  await expect(page.locator('.sl .m img')).toBeVisible({ timeout: 40_000 });
  await page.locator('.sl').first().getByRole('button', { name: 'Centrar', exact: true }).click();
  await page
    .getByRole('dialog', { name: 'Centrar la foto' })
    .getByRole('button', { name: 'Listo' })
    .click();
  await expect(page.locator('.sl .d i[role=progressbar]')).toHaveCount(0, { timeout: 40_000 });
  const desktopId = /\/ph\/([a-z0-9]+)\//.exec(
    (await page.locator('.sl .d img').getAttribute('src')) ?? '',
  )?.[1];
  const mobileId = /\/ph\/([a-z0-9]+)\//.exec(
    (await page.locator('.sl .m img').getAttribute('src')) ?? '',
  )?.[1];
  expect(desktopId && mobileId && desktopId !== mobileId).toBeTruthy();
  await page.getByRole('button', { name: 'Guardar portada' }).click();
  await expect(
    page.locator('[data-sonner-toast]').filter({ hasText: 'Portada guardada' }).first(),
  ).toBeVisible();

  await page.goto('/');
  const img = page.locator('section.hero img').first();
  await expect(img).toBeVisible();
  const phone = (page.viewportSize()?.width ?? 1440) <= 760;
  await expect
    .poll(async () => img.evaluate((el) => (el as HTMLImageElement).currentSrc))
    .toContain(`/ph/${phone ? mobileId : desktopId}/`);
  expect(info.project.name).toMatch(/admin-w/);
});
