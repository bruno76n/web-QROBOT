/** Admin actions to read, save and reset the home hero (slides and rotation interval). */

import { defineAction } from 'astro:actions';
import { heroInputSchema } from '@/lib/schemas';
import { ok } from '@/lib/result';
import { realDeps } from '@/server/admin/context';
import { resetHero, saveHero } from '@/server/admin/hero';
import { getHero } from '@/server/queries/hero';
import { guard } from './guard';

/** Hero admin actions: each checks the admin session, then delegates to `src/server/`. */
export const hero = {
  /** The saved hero as the panel edits it. */
  getHero: defineAction({
    handler: async (_input, context) => {
      await guard(context);
      return ok(await getHero());
    },
  }),
  /** Replaces the whole hero (slides, photos and interval). */
  saveHero: defineAction({
    input: heroInputSchema,
    handler: async (input, context) => {
      await guard(context);
      return saveHero(realDeps(), input);
    },
  }),
  /** Removes every slide and its photos so the home falls back to the default photo. */
  resetHero: defineAction({
    handler: async (_input, context) => {
      await guard(context);
      return resetHero(realDeps());
    },
  }),
};
