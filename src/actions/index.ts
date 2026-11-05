import { backup } from './admin/backup';
import { categories } from './admin/categories';
import { clicks } from './admin/clicks';
import { hero } from './admin/hero';
import { products } from './admin/products';

/** Admin actions live under `admin.*`: `/_actions/admin.<name>` (docs/10 §3, docs/13 §2). */
export const server = {
  admin: { ...products, ...categories, ...hero, ...backup, ...clicks },
};
