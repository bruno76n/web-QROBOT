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

export const categories = {
  listCategories: defineAction({
    handler: async (_input, context) => {
      await guard(context);
      return ok(await listCategories());
    },
  }),
  createCategory: defineAction({
    input: categoryCreateSchema,
    handler: async (input, context) => {
      await guard(context);
      return createCategory(realDeps(), input);
    },
  }),
  renameCategory: defineAction({
    input: categoryRenameSchema,
    handler: async (input, context) => {
      await guard(context);
      return renameCategory(realDeps(), input);
    },
  }),
  reorderCategories: defineAction({
    input: categoryReorderSchema,
    handler: async (input, context) => {
      await guard(context);
      return reorderCategories(realDeps(), input);
    },
  }),
  deleteCategory: defineAction({
    input: categoryDeleteSchema,
    handler: async (input, context) => {
      await guard(context);
      return deleteCategory(realDeps(), input);
    },
  }),
};
