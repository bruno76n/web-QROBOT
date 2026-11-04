import { defineAction } from 'astro:actions';
import { clickStatsInputSchema } from '@/lib/schemas';
import { ok } from '@/lib/result';
import { recentClickStats } from '@/server/clicks';
import { now } from '@/server/clock';
import { guard } from './guard';

export const clicks = {
  clickStats: defineAction({
    input: clickStatsInputSchema,
    handler: async ({ days }, context) => {
      await guard(context);
      return ok(await recentClickStats(days, now()));
    },
  }),
};
