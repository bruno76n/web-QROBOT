import { actions } from 'astro:actions';
import type { HeroInput, ProductInput } from '@/lib/schemas';
import { callAction } from './call';

/** The admin actions as the panel uses them: every call answers a `Result` (docs/10 §3). */
export const api = {
  listProducts: () => callAction(() => actions.admin.listProducts()),
  getProduct: (id: string) => callAction(() => actions.admin.getProduct({ id })),
  saveProduct: (input: ProductInput) => callAction(() => actions.admin.saveProduct(input)),
  setPublished: (id: string, published: boolean) =>
    callAction(() => actions.admin.setPublished({ id, published })),
  reorderProducts: (ids: string[]) => callAction(() => actions.admin.reorderProducts({ ids })),
  duplicateProduct: (id: string) => callAction(() => actions.admin.duplicateProduct({ id })),
  deleteProduct: (id: string) => callAction(() => actions.admin.deleteProduct({ id })),
  getHero: () => callAction(() => actions.admin.getHero()),
  saveHero: (input: HeroInput) => callAction(() => actions.admin.saveHero(input)),
  resetHero: () => callAction(() => actions.admin.resetHero()),
  exportBackup: () => callAction(() => actions.admin.exportBackup()),
  clickStats: (days = 30) => callAction(() => actions.admin.clickStats({ days })),
  cleanupPending: () => callAction(() => actions.admin.cleanupPending()),
};
