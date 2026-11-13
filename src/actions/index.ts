/** Registers every admin server action; each one runs behind the admin session check. */

import { backup } from './admin/backup';
import { categories } from './admin/categories';
import { clicks } from './admin/clicks';
import { hero } from './admin/hero';
import { products } from './admin/products';

/**
 * Astro Actions entry point. All actions are grouped under `admin.*`, so they are served at
 * `/_actions/admin.<name>` (docs/10 §3, docs/13 §2), the prefix the middleware protects.
 */
export const server = {
  admin: { ...products, ...categories, ...hero, ...backup, ...clicks },
};
