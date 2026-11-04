import { defineAction } from 'astro:actions';
import { idSchema, productInputSchema, reorderSchema, setPublishedSchema } from '@/lib/schemas';
import { realDeps } from '@/server/admin/context';
import {
  deleteProduct,
  duplicateProduct,
  reorderProducts,
  saveProduct,
  setPublished,
} from '@/server/admin/products';
import { getProductForAdmin } from '@/server/queries/products';
import { listAllProductsForAdmin } from '@/server/queries/products';
import { fail, ok } from '@/lib/result';
import { guard } from './guard';

export const products = {
  listProducts: defineAction({
    handler: async (_input, context) => {
      await guard(context);
      return ok(await listAllProductsForAdmin());
    },
  }),
  getProduct: defineAction({
    input: idSchema,
    handler: async ({ id }, context) => {
      await guard(context);
      const product = await getProductForAdmin(id);
      return product ? ok(product) : fail('NOT_FOUND');
    },
  }),
  saveProduct: defineAction({
    input: productInputSchema,
    handler: async (input, context) => {
      await guard(context);
      return saveProduct(realDeps(), input);
    },
  }),
  setPublished: defineAction({
    input: setPublishedSchema,
    handler: async (input, context) => {
      await guard(context);
      return setPublished(realDeps(), input);
    },
  }),
  reorderProducts: defineAction({
    input: reorderSchema,
    handler: async (input, context) => {
      await guard(context);
      return reorderProducts(realDeps(), input);
    },
  }),
  duplicateProduct: defineAction({
    input: idSchema,
    handler: async (input, context) => {
      await guard(context);
      return duplicateProduct(realDeps(), input);
    },
  }),
  deleteProduct: defineAction({
    input: idSchema,
    handler: async (input, context) => {
      await guard(context);
      return deleteProduct(realDeps(), input);
    },
  }),
};
