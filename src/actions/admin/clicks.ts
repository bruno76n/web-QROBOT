/** Admin action that reports how many WhatsApp taps the public site recorded recently. */

import { defineAction } from 'astro:actions';
import { clickStatsInputSchema } from '@/lib/schemas';
import { ok } from '@/lib/result';
import { recentClickStats } from '@/server/clicks';
import { now } from '@/server/clock';
import { guard } from './guard';

/** Click-statistics admin actions. */
export const clicks = {
  /** Totals by source and by product for the last `days` days, counted up to the current instant. */
  clickStats: defineAction({
    input: clickStatsInputSchema,
    handler: async ({ days }, context) => {
      await guard(context);
      return ok(await recentClickStats(days, now()));
    },
  }),
};
