/** Admin actions to list, read, save, publish, reorder, duplicate and delete products. */

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

/** Product admin actions: each checks the admin session, then delegates to `src/server/`. */
export const products = {
  /** Every product, published or not, for the panel's list. */
  listProducts: defineAction({
    handler: async (_input, context) => {
      await guard(context);
      return ok(await listAllProductsForAdmin());
    },
  }),
  /** One product with everything the editor needs; `NOT_FOUND` when the id does not exist. */
  getProduct: defineAction({
    input: idSchema,
    handler: async ({ id }, context) => {
      await guard(context);
      const product = await getProductForAdmin(id);
      return product ? ok(product) : fail('NOT_FOUND');
    },
  }),
  /** Creates or updates a product from the editor form. */
  saveProduct: defineAction({
    input: productInputSchema,
    handler: async (input, context) => {
      await guard(context);
      return saveProduct(realDeps(), input);
    },
  }),
  /** Shows or hides a product in the catalog; publishing is refused while required data is missing. */
  setPublished: defineAction({
    input: setPublishedSchema,
    handler: async (input, context) => {
      await guard(context);
      return setPublished(realDeps(), input);
    },
  }),
  /** Rewrites the catalog order from the full list of ids. */
  reorderProducts: defineAction({
    input: reorderSchema,
    handler: async (input, context) => {
      await guard(context);
      return reorderProducts(realDeps(), input);
    },
  }),
  /** Copies a product's data (not its photos); the copy starts hidden, at the end of the list. */
  duplicateProduct: defineAction({
    input: idSchema,
    handler: async (input, context) => {
      await guard(context);
      return duplicateProduct(realDeps(), input);
    },
  }),
  /** Deletes a product with its rows and photos. */
  deleteProduct: defineAction({
    input: idSchema,
    handler: async (input, context) => {
      await guard(context);
      return deleteProduct(realDeps(), input);
    },
  }),
};
