import { test, expect, type Page } from '@playwright/test';
import { makePhoto, openAdmin, waitForUploads, reseed } from './admin-helpers';

// Panel · productos (docs/fases/fase-2.md §2.7–2.9). Flows D and F of docs/04 §6 up to "guardar".
// They run on `pnpm dev` with the seed loaded, one after another.
test.describe.configure({ mode: 'serial' });
test.beforeAll(() => reseed());

const toast = (page: Page, text: string | RegExp) =>
  expect(page.locator('[data-sonner-toast]').filter({ hasText: text }).first()).toBeVisible();

/** On a phone the list and the editor are separate screens: go back to the list. */
async function backToList(page: Page) {
  const back = page.getByRole('button', { name: 'Volver a la lista' });
  if (await back.isVisible()) await back.click();
}

test('la lista trae los 14 productos y se puede buscar y filtrar', async ({ page }) => {
  await openAdmin(page);
  await expect(page.locator('.list > li')).toHaveCount(14);
  await expect(page.getByText('Arrastra ⋮⋮ para cambiar el orden en el catálogo.')).toBeVisible();

  await page.getByPlaceholder('Buscar producto').fill('gato');
  await expect(page.locator('.list > li')).toHaveCount(1);
  await expect(page.getByText('Para ordenar, quita la búsqueda y el filtro.')).toBeVisible();
  await page.getByPlaceholder('Buscar producto').fill('');

  await page.getByRole('button', { name: 'Ocultos' }).click();
  await expect(page.getByText('Ningún producto coincide.')).toBeVisible();
  await page.getByRole('button', { name: 'Publicados' }).click();
  await expect(page.locator('.list > li')).toHaveCount(14);
});

test('editar el nombre y guardar se conserva al recargar', async ({ page }) => {
  await page.goto('/admin?p=seed-gato');
  const name = page.getByLabel('Nombre', { exact: true });
  await expect(name).toHaveValue('Gato', { timeout: 30_000 });
  await name.fill('Gato editado');
  await expect(page.getByText('Sin guardar').first()).toBeVisible();
  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await toast(page, 'Guardado');
  await expect(page.getByText('Sin guardar')).toHaveCount(0);
  await page.reload();
  await expect(page.getByLabel('Nombre', { exact: true })).toHaveValue('Gato editado');
  // the address of a published product does not follow the name (docs/09 §3)
  await expect(page.getByLabel('Dirección de la página')).toHaveValue('gato');
});

test('cambios sin guardar piden confirmación antes de salir', async ({ page }) => {
  await page.goto('/admin?p=seed-buho');
  const name = page.getByLabel('Nombre', { exact: true });
  await expect(name).toHaveValue('Búho', { timeout: 30_000 });
  await name.fill('Búho a medias');
  await page.getByRole('link', { name: 'Portada' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('Tienes cambios sin guardar. ¿Salir sin guardar?')).toBeVisible();
  await dialog.getByRole('button', { name: 'Seguir editando' }).click();
  await expect(name).toHaveValue('Búho a medias');
  await expect(page).toHaveURL(/\/admin\?p=seed-buho/);
  // leaving for real
  await page.getByRole('link', { name: 'Portada' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Salir' }).click();
  await expect(page).toHaveURL(/\/admin\/portada/);
});

test('flujo D: producto nuevo con dos fotos, se centra, se publica y se ve en la lista', async ({
  page,
}) => {
  await page.goto('/admin?p=new');
  const publish = page.getByLabel('Publicado', { exact: true });
  await expect(publish).toBeDisabled({ timeout: 30_000 });
  await expect(
    page.getByText('Para publicarlo falta: una foto, una categoría, el precio desde y el nombre'),
  ).toBeVisible();

  await page.getByLabel('Nombre', { exact: true }).fill('Producto e2e');
  await expect(page.getByLabel('Dirección de la página')).toHaveValue('producto-e2e');
  await page.getByLabel('Precio desde (por pieza)').fill('75');
  await page.getByText('Para la casa', { exact: true }).click();
  await page.getByText('Verde', { exact: true }).click();

  const jpg = await makePhoto('jpeg', 1000, 800);
  const png = await makePhoto('png', 600, 600, '#ffc21a');
  await page.getByLabel('Arrastra fotos aquí').setInputFiles([jpg, png]);
  await waitForUploads(page);
  await expect(page.locator('.ph')).toHaveCount(2);
  await expect(page.locator('.ph').first().getByText('Portada')).toBeVisible();
  // the 600 px photo is under the 800 px threshold: it is flagged as small
  await expect(page.locator('.ph .warn')).toHaveCount(1);

  await expect(publish).toBeEnabled();
  await publish.check();
  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await toast(page, 'Guardado');
  await expect(page).toHaveURL(/\/admin\?p=(?!new)/);
  await expect(page.locator('.ph')).toHaveCount(2);

  await page.reload();
  await expect(page.getByLabel('Nombre', { exact: true })).toHaveValue('Producto e2e');
  await expect(page.getByLabel('Precio desde (por pieza)')).toHaveValue('75');
  await expect(page.locator('.ph')).toHaveCount(2);
  await backToList(page);
  const row = page.locator('.list > li').filter({ hasText: /Producto e2e/ });
  await expect(row).toContainText('Publicado');
  await expect(row).toContainText('$75');
});

test('centrar una foto guarda el recorte elegido y borra la versión vieja', async ({
  page,
  request,
}) => {
  await openAdmin(page);
  await page
    .locator('.list > li')
    .filter({ hasText: /Producto e2e/ })
    .locator('.row-main')
    .click();
  const first = page.locator('.ph').first();
  await expect(first).toHaveAttribute('data-crop', /.+/, { timeout: 30_000 });
  const before = {
    crop: await first.getAttribute('data-crop'),
    version: await first.getAttribute('data-version'),
    id: await first.getAttribute('data-photo-id'),
  };
  // the 1000 × 800 JPG starts centered: 800 × 800 at x = 100
  expect(before.crop).toBe('100,0,800,800');
  await first.getByRole('button', { name: 'Centrar' }).click({ force: true });

  const dialog = page.getByRole('dialog', { name: 'Centrar la foto' });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel('Acercar').fill('2');
  const stage = dialog.locator('.crop-stage');
  const box = await stage.boundingBox();
  if (!box) throw new Error('no stage');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 90, box.y + box.height / 2 + 40, { steps: 8 });
  await page.mouse.up();
  await dialog.getByRole('button', { name: 'Listo' }).click();
  await waitForUploads(page);

  const after = {
    crop: await first.getAttribute('data-crop'),
    version: await first.getAttribute('data-version'),
  };
  expect(after.crop).not.toBe(before.crop);
  expect(after.version).not.toBe(before.version);

  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await toast(page, 'Guardado');
  await page.reload();
  const saved = page.locator('.ph').first();
  await expect(saved).toHaveAttribute('data-crop', after.crop ?? '');
  await expect(saved).toHaveAttribute('data-version', after.version ?? '');

  // old versions are gone from R2, the new ones are there
  expect((await request.get(`/img/ph/${before.id}/${before.version}/400.webp`)).status()).toBe(404);
  expect((await request.get(`/img/ph/${before.id}/${after.version}/400.webp`)).status()).toBe(200);
  expect((await request.get(`/img/ph/${before.id}/${after.version}/og.jpg`)).status()).toBe(200);
});

test('quitar una foto la borra al guardar', async ({ page, request }) => {
  await page.goto('/admin');
  await openAdmin(page);
  await page
    .locator('.list > li')
    .filter({ hasText: /Producto e2e/ })
    .locator('.row-main')
    .click();
  const second = page.locator('.ph').nth(1);
  await expect(second).toHaveAttribute('data-photo-id', /.+/, { timeout: 30_000 });
  const id = await second.getAttribute('data-photo-id');
  const version = await second.getAttribute('data-version');
  await second.getByRole('button', { name: 'Quitar' }).click({ force: true });
  await expect(page.locator('.ph')).toHaveCount(1);
  expect((await request.get(`/img/ph/${id}/${version}/400.webp`)).status()).toBe(200); // not yet
  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await toast(page, 'Guardado');
  expect((await request.get(`/img/ph/${id}/${version}/400.webp`)).status()).toBe(404);
});

test('flujo F: ocultar un producto y reordenar la lista con el teclado', async ({ page }) => {
  await page.goto('/admin?p=seed-dinosaurio');
  const publish = page.getByLabel('Publicado', { exact: true });
  await expect(publish).toBeChecked({ timeout: 30_000 });
  await publish.uncheck();
  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await toast(page, 'Guardado');
  await backToList(page);
  await expect(page.locator('.list > li').filter({ hasText: /Dinosaurio/ })).toContainText(
    'Oculto',
  );

  // keyboard sorting with dnd-kit: Space picks up, arrows move, Space drops
  const names = async () =>
    (await page.locator('.list > li').locator('b').allTextContents()).slice(0, 3);
  const before = await names();
  const grip = page
    .locator('.list > li')
    .first()
    .getByRole('button', { name: 'Arrastrar para cambiar el orden' });
  await grip.focus();
  await page.keyboard.press('Space');
  await page.waitForTimeout(250); // dnd-kit attaches its key listeners on the next tick
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(250);
  await page.keyboard.press('Space');
  await toast(page, 'Orden guardado');
  const after = await names();
  expect(after[0]).toBe(before[1]);
  expect(after[1]).toBe(before[0]);
  await page.reload();
  await expect(page.locator('.list > li').first()).toBeVisible();
  expect((await names())[0]).toBe(before[1]);
});

test('duplicar y eliminar con confirmación', async ({ page }) => {
  await page.goto('/admin?p=seed-macetas');
  await expect(page.getByLabel('Nombre', { exact: true })).toHaveValue('Macetas', {
    timeout: 30_000,
  });
  await page.getByRole('button', { name: 'Duplicar' }).click();
  await toast(page, 'Copia creada');
  await expect(page.getByLabel('Nombre', { exact: true })).toHaveValue('Macetas (copia)');
  await expect(page.getByLabel('Publicado', { exact: true })).not.toBeChecked();
  await expect(page.locator('.ph')).toHaveCount(0); // the copy has no photos

  await page.getByRole('button', { name: 'Eliminar' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('¿Eliminar este producto?')).toBeVisible();
  await dialog.getByRole('button', { name: 'No' }).click();
  await expect(page.getByLabel('Nombre', { exact: true })).toHaveValue('Macetas (copia)');
  await page.getByRole('button', { name: 'Eliminar' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Sí, eliminar' }).click();
  await toast(page, 'Producto eliminado');
  await backToList(page);
  await expect(page.locator('.list > li').filter({ hasText: /Macetas \(copia\)/ })).toHaveCount(0);
});

test('fotos que no se pueden usar se rechazan con un texto claro', async ({ page }) => {
  await page.goto('/admin?p=new');
  const input = page.getByLabel('Arrastra fotos aquí');
  await expect(input).toBeAttached({ timeout: 30_000 });
  // an SVG never gets in
  await input.setInputFiles({
    name: 'logo.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'),
  });
  await toast(page, 'Esa foto no se puede usar. Sube JPG, PNG, WEBP o una foto del iPhone.');
  await expect(page.locator('.ph')).toHaveCount(0);
  // "iPhone" photo that is not really HEIC: the conversion path runs and fails with the same text
  const jpg = await makePhoto('jpeg', 400, 400);
  await input.setInputFiles({ name: 'IMG_0001.heic', mimeType: 'image/heic', buffer: jpg.buffer });
  await expect(page.locator('.ph.fail')).toContainText('No se subió', { timeout: 30_000 });
  await expect(page.locator('.ph.fail')).toContainText('Esa foto no se puede usar');
});

// docs/13 §10 (injection): markup in text fields is stored and shown as text, never run.
test('un nombre con marcado se guarda y se muestra como texto', async ({ page }) => {
  const nasty = `"><img src=x onerror="window.__xss=1"><script>window.__xss=1</script>`;
  await page.goto('/admin?p=new');
  await page.getByLabel('Nombre', { exact: true }).fill(nasty);
  await page.getByLabel('Frase corta').fill("'; DROP TABLE products; --");
  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await toast(page, 'Guardado');
  await page.reload();
  await expect(page.getByLabel('Nombre', { exact: true })).toHaveValue(nasty);
  await expect(page.getByLabel('Frase corta')).toHaveValue("'; DROP TABLE products; --");
  await backToList(page);
  // the list shows it as text too, and the catalog is intact
  await expect(page.locator('.list > li').filter({ hasText: '<script>' })).toHaveCount(1);
  await expect(page.locator('.list > li')).not.toHaveCount(0);
  expect(
    await page.evaluate(() => (window as unknown as { __xss?: number }).__xss),
  ).toBeUndefined();
});
