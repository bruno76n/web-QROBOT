import { test, expect, type Page } from '@playwright/test';
import { makePhoto, moveDownWithKeyboard, reseed } from './admin-helpers';

// Panel · portada (docs/12 §5). Flow E of docs/04 §6 up to saving (the public home is checked in the public flows).
test.describe.configure({ mode: 'serial' });
test.beforeAll(() => reseed());

const toast = (page: Page, text: string | RegExp) =>
  expect(page.locator('[data-sonner-toast]').filter({ hasText: text }).first()).toBeVisible();

async function openHero(page: Page) {
  await page.goto('/admin/portada');
  await expect(page.getByRole('heading', { name: 'Portada del inicio' })).toBeVisible({
    timeout: 30_000,
  });
}

test('muestra la portada de ejemplo con su vista previa', async ({ page }) => {
  await openHero(page);
  await expect(page.getByText('1 portada')).toBeVisible();
  await expect(page.locator('.sl')).toHaveCount(1);
  await expect(page.getByAltText('Vista previa de la portada')).toBeVisible();
  await expect(page.getByLabel('Cambiar cada')).toHaveValue('6');
});

test('subir una portada nueva con foto de celular, cambiar el intervalo y guardar', async ({
  page,
}) => {
  await openHero(page);
  const desktop = await makePhoto('jpeg', 2400, 1350, '#00ae42');
  await page.getByLabel('Arrastra fotos aquí').setInputFiles(desktop);
  await expect(page.locator('.sl')).toHaveCount(2);
  await expect(page.locator('.sl .d i[role=progressbar]')).toHaveCount(0, { timeout: 40_000 });
  await expect(page.getByText('Sin guardar')).toBeVisible();

  const mobile = await makePhoto('jpeg', 1200, 1600, '#6b3fd4');
  await page.locator('.sl').nth(1).getByLabel('Subir la de celular').setInputFiles(mobile);
  await expect(page.locator('.sl').nth(1).locator('.m img')).toBeVisible({ timeout: 40_000 });

  await page.getByLabel('Cambiar cada').selectOption('8');
  await page.getByRole('button', { name: 'Guardar portada' }).click();
  await toast(page, 'Portada guardada');
  await expect(page.getByText('Sin guardar')).toHaveCount(0);

  await page.reload();
  await expect(page.locator('.sl')).toHaveCount(2);
  await expect(page.locator('.sl').nth(1).locator('.m img')).toBeVisible();
  await expect(page.getByLabel('Cambiar cada')).toHaveValue('8');
  await expect(page.getByText('2 portadas')).toBeVisible();
});

test('se pueden ordenar las portadas con el teclado y quitar una', async ({ page }) => {
  await openHero(page);
  const firstId = await page.locator('.sl').first().locator('.d img').getAttribute('src');
  const grip = page
    .locator('.sl')
    .first()
    .getByRole('button', { name: /Arrastrar para cambiar el orden/ });
  await moveDownWithKeyboard(page, grip);
  await expect(page.locator('.sl').nth(1).locator('.d img')).toHaveAttribute('src', firstId ?? '');
  await page.getByRole('button', { name: 'Guardar portada' }).click();
  await toast(page, 'Portada guardada');

  await page.locator('.sl').nth(1).getByRole('button', { name: 'Quitar', exact: true }).click();
  await expect(page.locator('.sl')).toHaveCount(1);
  await page.getByRole('button', { name: 'Guardar portada' }).click();
  await toast(page, 'Portada guardada');
  await page.reload();
  await expect(page.locator('.sl')).toHaveCount(1);
});

test('centrar la foto de escritorio y volver a la foto original', async ({ page }) => {
  await openHero(page);
  const img = page.locator('.sl').first().locator('.d img');
  const before = await img.getAttribute('src');
  await page.locator('.sl').first().getByRole('button', { name: 'Centrar', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Centrar la foto' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Así se ve en el inicio')).toBeVisible();
  await dialog.getByLabel('Acercar').fill('1.5');
  await dialog.getByRole('button', { name: 'Listo' }).click();
  // The new crop is uploaded before the thumbnail changes; the progress bar may not have shown yet.
  await expect(img).not.toHaveAttribute('src', before ?? '', { timeout: 30_000 });
  await expect(page.locator('.sl .d i[role=progressbar]')).toHaveCount(0, { timeout: 30_000 });

  await page.getByRole('button', { name: 'Volver a la foto original' }).click();
  const confirm = page.getByRole('dialog');
  await expect(confirm.getByText('¿Volver a la foto original?')).toBeVisible();
  await confirm.getByRole('button', { name: 'Sí, volver' }).click();
  await toast(page, 'La portada volvió a la foto original');
  await expect(page.getByText('Usa la foto por defecto')).toBeVisible();
  await expect(page.locator('.sl')).toHaveCount(0);
});
