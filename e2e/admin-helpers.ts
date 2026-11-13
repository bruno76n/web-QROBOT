/**
 * Helpers shared by the panel flow specs: make test photos, reseed the database, open the panel
 * and wait for uploads to finish.
 */
import { expect, type Locator, type Page } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import sharp from 'sharp';

/** A solid-color photo as a file buffer (JPG or PNG), with a bright square so crops are visible. */
export async function makePhoto(
  type: 'jpeg' | 'png',
  width: number,
  height: number,
  color = '#6b3fd4',
) {
  const base = sharp({ create: { width, height, channels: 3, background: color } });
  const square = await sharp({
    create: {
      width: Math.round(width / 5),
      height: Math.round(width / 5),
      channels: 3,
      background: '#00ae42',
    },
  })
    .png()
    .toBuffer();
  const composed = base.composite([{ input: square, left: 20, top: 20 }]);
  const buffer =
    type === 'jpeg' ? await composed.jpeg().toBuffer() : await composed.png().toBuffer();
  return { name: `foto.${type === 'jpeg' ? 'jpg' : 'png'}`, mimeType: `image/${type}`, buffer };
}

/** Each spec file starts from the seed, whatever ran before (the three widths share one database). */
export function reseed() {
  const r = spawnSync('node', ['scripts/seed.ts'], { stdio: 'ignore' });
  if (r.status !== 0) throw new Error('seed failed');
}

/**
 * Opens the panel. On a phone the list and the editor are separate screens, so with `?p=` the
 * editor is what shows first.
 */
export async function openAdmin(page: Page, query = '') {
  await page.goto(`/admin${query}`);
  const ready = query.includes('p=')
    ? page.getByLabel('Nombre', { exact: true })
    : page.locator('.list > li').first();
  await expect(ready).toBeVisible({ timeout: 30_000 });
}

/** Waits until every thumbnail finished uploading. */
export async function waitForUploads(page: Page) {
  await expect(page.locator('.ph .prog')).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator('.ph.fail')).toHaveCount(0);
}

/**
 * Moves a sortable row one place down with the keyboard, the way dnd-kit expects it: Space picks
 * it up, ArrowDown moves it, Space drops it. Instead of fixed pauses it waits for what the page
 * shows: the row gets the `drag` class when picked up, and the row below shifts up once dnd-kit has
 * taken it as the new place (dropping before that would leave the order as it was). dnd-kit starts
 * listening for arrows a moment after the pick-up, so an arrow that changed nothing is pressed again;
 * a missed arrow moves nothing, so the row never moves two places.
 */
export async function moveDownWithKeyboard(page: Page, grip: Locator) {
  const row = grip.locator('xpath=ancestor::li[1]');
  const below = row.locator('xpath=following-sibling::li[1]');
  const shiftedUp = () => below.evaluate((el) => (el as HTMLElement).style.transform);
  await grip.focus();
  await page.keyboard.press('Space');
  await expect(row).toHaveClass(/\bdrag\b/);
  await expect(async () => {
    if (!/translate3d\(0px, -[1-9]/.test(await shiftedUp())) await page.keyboard.press('ArrowDown');
    await expect.poll(shiftedUp, { timeout: 1000 }).toMatch(/translate3d\(0px, -[1-9]/);
  }).toPass({ timeout: 10_000 });
  await page.keyboard.press('Space');
  await expect(row).not.toHaveClass(/\bdrag\b/);
}
