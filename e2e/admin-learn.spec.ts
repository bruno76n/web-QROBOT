import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { spawnSync } from 'node:child_process';
import { moveDownWithKeyboard } from './admin-helpers';

// Panel · Aprende (docs/fases/fase-8.md 8.2, docs/12 §5c): list, editor, quick publish switch and
// errors. Runs on `pnpm dev`, one test after another; the local pages are reloaded from
// `content/aprende/` before and after, so the database is left as the files say.
test.describe.configure({ mode: 'serial' });
test.beforeAll(() => reloadLearnContent());
test.afterAll(() => reloadLearnContent());

/** Page every test edits, and its public address. */
const PAGE_ID = 'learn-filamentos-pla';
const PUBLIC_URL = '/aprende/filamentos/pla';

/** Loads `content/aprende/` into the local D1 again, replacing what the panel changed. */
function reloadLearnContent() {
  const r = spawnSync('pnpm', ['exec', 'tsx', 'scripts/learn-import.ts', '--overwrite'], {
    stdio: 'ignore',
  });
  if (r.status !== 0) throw new Error('learn import failed');
}

const toast = (page: Page, text: string | RegExp) =>
  expect(page.locator('[data-sonner-toast]').filter({ hasText: text }).first()).toBeVisible();

/** No serious accessibility violations on what the page shows (docs/16 §4). */
async function expectNoSeriousA11y(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  const serious = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
}

/** Opens the editor of the test page straight from the URL. */
async function openEditor(page: Page) {
  await page.goto(`/admin/aprende?p=${PAGE_ID}`);
  await expect(page.getByLabel('Título', { exact: true })).toBeVisible({ timeout: 30_000 });
}

/** The list row whose title is exactly `title`. */
const row = (page: Page, title: string) =>
  page
    .locator('.learn-it')
    .filter({ has: page.locator('b', { hasText: new RegExp(`^${title}$`) }) });

test('la pestaña lista las páginas, se busca, se filtra y se abre una en la URL', async ({
  page,
}) => {
  await page.goto('/admin');
  await page.getByRole('link', { name: 'Aprende', exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/aprende$/);
  await expect(page.locator('.learn-it').first()).toBeVisible({ timeout: 30_000 });

  await page.getByPlaceholder('Buscar página').fill('pla');
  await expect(row(page, 'PLA')).toHaveCount(1);
  await page.getByPlaceholder('Buscar página').fill('');

  await page.getByLabel('Tema').selectOption('encargar');
  await page.getByRole('button', { name: 'Ocultas' }).click();
  // The files have two hidden pages, both in «Si vas a encargar una pieza».
  await expect(page.locator('.learn-it')).toHaveCount(2);
  await page.getByRole('button', { name: 'Editadas aquí' }).click();
  await expect(page.getByText('Ninguna página coincide.')).toBeVisible();
  await page.getByRole('button', { name: 'Todas' }).click();
  await page.getByLabel('Tema').selectOption('');

  await page.getByPlaceholder('Buscar página').fill('pla');
  await row(page, 'PLA').locator('.row-main').click();
  await expect(page).toHaveURL(new RegExp(`\\?p=${PAGE_ID}$`));
  await expect(page.getByLabel('Título', { exact: true })).toHaveValue('PLA');
  await expect(page.getByText('/aprende/filamentos/pla')).toBeVisible();

  await expectNoSeriousA11y(page);
});

test('cambiar el título y las preguntas, guardar y verlo en la página pública', async ({
  page,
}) => {
  await openEditor(page);
  const q1 = page.getByLabel('Pregunta 1', { exact: true });
  const q2 = page.getByLabel('Pregunta 2', { exact: true });
  const first = await q1.inputValue();
  const second = await q2.inputValue();

  await page.getByLabel('Título', { exact: true }).fill('PLA editado');
  await expect(page.getByText('Sin guardar').first()).toBeVisible();
  // The first question goes below the second one, then it gets new words.
  await moveDownWithKeyboard(page, page.getByRole('button', { name: /^Arrastrar la pregunta 1 / }));
  await expect(q1).toHaveValue(second);
  await expect(q2).toHaveValue(first);
  await q2.fill('¿PLA o PETG para una figura de escritorio?');

  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await toast(page, 'Guardado');
  await expect(page.getByText('Sin guardar')).toHaveCount(0);
  await expect(page.getByLabel('Título', { exact: true })).toHaveValue('PLA editado');

  await page.goto(PUBLIC_URL);
  await expect(page.getByRole('heading', { level: 1, name: 'PLA editado' })).toBeVisible();
  const questions = page.locator('.faq summary');
  await expect(questions.nth(0)).toHaveText(second);
  await expect(questions.nth(1)).toHaveText('¿PLA o PETG para una figura de escritorio?');

  // The list marks the page as edited in the panel.
  await page.goto('/admin/aprende');
  await page.getByRole('button', { name: 'Editadas aquí' }).click();
  await expect(row(page, 'PLA editado')).toHaveCount(1);
});

test('el interruptor oculta y publica la página al momento', async ({ page }) => {
  await page.goto('/admin/aprende');
  await page.getByPlaceholder('Buscar página').fill('pla editado');
  const listSwitch = page.getByRole('checkbox', { name: 'Publicada: PLA editado' });
  await expect(listSwitch).toBeChecked({ timeout: 30_000 });
  await listSwitch.uncheck();
  await toast(page, 'Página oculta');
  expect((await page.request.get(PUBLIC_URL)).status()).toBe(404);

  await openEditor(page);
  const editorSwitch = page.getByRole('checkbox', { name: 'Publicada', exact: true });
  await expect(editorSwitch).not.toBeChecked();
  await expect(page.getByRole('link', { name: 'Ver página ↗' })).toHaveCount(0);
  await editorSwitch.check();
  await toast(page, 'Página publicada');
  await expect(page.getByRole('link', { name: 'Ver página ↗' })).toHaveAttribute(
    'href',
    PUBLIC_URL,
  );
  // The switch saves on its own: nothing is left unsaved.
  await expect(page.getByText('Sin guardar')).toHaveCount(0);
  expect((await page.request.get(PUBLIC_URL)).status()).toBe(200);
});

test('un bloque [[…]] que no existe se ve en la vista previa y no se guarda', async ({ page }) => {
  await openEditor(page);
  const body = page.getByLabel('Cuerpo', { exact: true });
  await body.fill(`${await body.inputValue()}\n\n[[desconocida]]\n`);

  await page.getByRole('button', { name: 'Vista previa' }).click();
  await expect(page.getByTestId('learn-preview')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('Este bloque no existe: [[desconocida]]')).toBeVisible();
  await expect(page.getByText('Aquí va el bloque [[tabla:filamentos]]')).toHaveCount(0);
  await expectNoSeriousA11y(page);

  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  const message =
    'El cuerpo usa un bloque que no existe: [[desconocida]]. Revisa lo que escribiste entre [[ ]].';
  await toast(page, message);
  // The editor goes back to the text and names the problem under it; nothing was lost.
  await expect(page.getByRole('alert').filter({ hasText: message })).toBeVisible();
  await expect(body).toHaveValue(/\[\[desconocida\]\]/);
  await expect(page.getByText('Sin guardar').first()).toBeVisible();
});

test('los cambios sin guardar avisan antes de salir', async ({ page }) => {
  await openEditor(page);
  const title = page.getByLabel('Título', { exact: true });
  await title.fill('PLA a medias');
  await page.getByRole('link', { name: 'Productos' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('Tienes cambios sin guardar. ¿Salir sin guardar?')).toBeVisible();
  await dialog.getByRole('button', { name: 'Seguir editando' }).click();
  await expect(title).toHaveValue('PLA a medias');
  await expect(page).toHaveURL(new RegExp(`/admin/aprende\\?p=${PAGE_ID}$`));

  // Going back to the list (or to another page) asks too.
  const width = page.viewportSize()?.width ?? 0;
  if (width > 860) await row(page, 'Acabado').locator('.row-main').click();
  else await page.getByRole('button', { name: 'Volver a la lista' }).click();
  await expect(dialog.getByText('Tienes cambios sin guardar. ¿Salir sin guardar?')).toBeVisible();
  await dialog.getByRole('button', { name: 'Salir' }).click();
  await expect(page).not.toHaveURL(new RegExp(`p=${PAGE_ID}`));
});
