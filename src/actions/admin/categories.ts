/** Admin actions to list, create, rename, reorder and delete categories. Input is validated by Zod. */

import { defineAction } from 'astro:actions';
import {
  categoryCreateSchema,
  categoryDeleteSchema,
  categoryRenameSchema,
  categoryReorderSchema,
} from '@/lib/schemas';
import { ok } from '@/lib/result';
import { realDeps } from '@/server/admin/context';
import {
  createCategory,
  deleteCategory,
  renameCategory,
  reorderCategories,
} from '@/server/admin/categories';
import { listCategories } from '@/server/queries/categories';
import { guard } from './guard';

/** Category admin actions: each checks the admin session, then delegates to `src/server/`. */
export const categories = {
  /** All categories in display order. */
  listCategories: defineAction({
    handler: async (_input, context) => {
      await guard(context);
      return ok(await listCategories());
    },
  }),
  /** Adds a category at the end of the list. */
  createCategory: defineAction({
    input: categoryCreateSchema,
    handler: async (input, context) => {
      await guard(context);
      return createCategory(realDeps(), input);
    },
  }),
  /** Changes a category's name; its id stays the same. */
  renameCategory: defineAction({
    input: categoryRenameSchema,
    handler: async (input, context) => {
      await guard(context);
      return renameCategory(realDeps(), input);
    },
  }),
  /** Rewrites the category order from the full list of ids. */
  reorderCategories: defineAction({
    input: categoryReorderSchema,
    handler: async (input, context) => {
      await guard(context);
      return reorderCategories(realDeps(), input);
    },
  }),
  /** Deletes a category unless it is protected or a published product would be left without one. */
  deleteCategory: defineAction({
    input: categoryDeleteSchema,
    handler: async (input, context) => {
      await guard(context);
      return deleteCategory(realDeps(), input);
    },
  }),
};
