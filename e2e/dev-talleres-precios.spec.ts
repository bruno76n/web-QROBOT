import { test, expect, type Page } from '@playwright/test';

// Flow N of the page for workshops (docs/25 §12): the pricing page with the monthly or yearly
// toggle and ¿Qué plan te toca?. Needs the development server: the page is hidden outside
// `pnpm dev` while `site.system.enabled` is false (docs/25 §2).

const URL = '/talleres/precios';

/** Moves a slider of the plan finder to a value, as a person would with the keyboard or a drag. */
async function slide(page: Page, label: string, value: number) {
  await page.getByRole('slider', { name: label }).fill(String(value));
}

test.describe('precios con JavaScript', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  test('Anual cambia los planes y el resultado del buscador', async ({ page }) => {
    const shop = page.locator('[data-plan-price="shop"]');
    await expect(shop).toContainText('$149');
    await page.getByRole('button', { name: /Anual/ }).click();
    await expect(page.getByRole('button', { name: /Anual/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.getByRole('button', { name: 'Mensual' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    await expect(shop.locator('b')).toHaveText('$1,490');
    await expect(shop.locator('span')).toHaveText('al año');
    await expect(shop.locator('xpath=following-sibling::p[1]')).toHaveText(
      'Equivale a $124 al mes',
    );
    await expect(page.locator('[data-f-name]')).toHaveText('Taller');
    await expect(page.locator('[data-f-amt]')).toHaveText('$1,490 al año');

    await page.getByRole('button', { name: 'Mensual' }).click();
    await expect(shop.locator('b')).toHaveText('$149');
    await expect(page.locator('[data-f-amt]')).toHaveText('$149 al mes');
  });

  test('1 impresora, 1 persona y 10 ventas → Gratis', async ({ page }) => {
    await slide(page, 'Impresoras', 1);
    await slide(page, 'Personas que lo usan', 1);
    await slide(page, 'Ventas y pedidos al mes', 10);
    await expect(page.locator('[data-f-name]')).toHaveText('Gratis');
    await expect(page.locator('[data-f-amt]')).toHaveText('$0, siempre');
    await expect(page.locator('[data-f-why] li')).toHaveText([
      'Hasta 2 impresoras, 1 persona y 15 ventas y pedidos al mes',
    ]);
    await expect(page.locator('[data-f-cta]')).toHaveText('Empezar gratis');
  });

  test('12 impresoras → Taller; 3 personas → Negocio; 10 personas → escríbenos', async ({
    page,
  }) => {
    await slide(page, 'Ventas y pedidos al mes', 10);
    await slide(page, 'Impresoras', 12);
    await expect(page.locator('[data-f-name]')).toHaveText('Taller');
    await expect(page.locator('[data-f-why]')).toContainText(
      'Con 12 impresoras pagas lo mismo que con 1',
    );
    await expect(page.locator('[data-f-cta]')).toHaveText('Probar 14 días gratis');

    await slide(page, 'Personas que lo usan', 3);
    await expect(page.locator('[data-f-name]')).toHaveText('Negocio');
    await expect(page.locator('[data-f-why]')).toContainText(
      'Más de 2 personas: roles para que cada quien vea lo suyo',
    );

    await slide(page, 'Personas que lo usan', 10);
    await expect(page.locator('[data-f-name]')).toHaveText('Negocio');
    await expect(page.locator('[data-f-why]')).toContainText(
      'Para más de 8 personas, escríbenos por WhatsApp',
    );
    await expect(page.locator('output[for="f-people"]')).toHaveText('10 o más');
  });

  test('el teclado mueve los deslizadores y el tope se lee «20 o más»', async ({ page }) => {
    const printers = page.getByRole('slider', { name: 'Impresoras' });
    await printers.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('output[for="f-printers"]')).toHaveText('4');
    await page.keyboard.press('End');
    await expect(page.locator('output[for="f-printers"]')).toHaveText('20 o más');
    await expect(page.locator('[data-f-why]')).toContainText(
      'Con 20 o más impresoras pagas lo mismo que con 1',
    );
  });
});

test.describe('precios sin JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('mensual con su línea anual y el buscador en Taller sin motivos', async ({ page }) => {
    await page.goto(URL);
    const shop = page.locator('[data-plan-price="shop"]');
    await expect(shop.locator('b')).toHaveText('$149');
    await expect(shop.locator('xpath=following-sibling::p[1]')).toHaveText('o $1,490 al año');
    await expect(page.locator('[data-f-name]')).toHaveText('Taller');
    await expect(page.locator('[data-f-amt]')).toHaveText('$149 al mes');
    await expect(page.locator('[data-f-why] li')).toHaveCount(0);
  });
});
