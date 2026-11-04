import { defineAction } from 'astro:actions';
import { heroInputSchema } from '@/lib/schemas';
import { ok } from '@/lib/result';
import { realDeps } from '@/server/admin/context';
import { resetHero, saveHero } from '@/server/admin/hero';
import { getHero } from '@/server/queries/hero';
import { guard } from './guard';

export const hero = {
  getHero: defineAction({
    handler: async (_input, context) => {
      await guard(context);
      return ok(await getHero());
    },
  }),
  saveHero: defineAction({
    input: heroInputSchema,
    handler: async (input, context) => {
      await guard(context);
      return saveHero(realDeps(), input);
    },
  }),
  resetHero: defineAction({
    handler: async (_input, context) => {
      await guard(context);
      return resetHero(realDeps());
    },
  }),
};
