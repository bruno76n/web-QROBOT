/**
 * Helpers shared by the panel flow specs: make test photos, reseed the database, open the panel
 * and wait for uploads to finish.
 */
import { expect, type Page } from '@playwright/test';
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
