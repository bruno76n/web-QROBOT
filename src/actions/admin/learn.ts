/** Admin actions of Aprende: list and read pages, save one, switch it on or off, search misses and index. */

import { defineAction } from 'astro:actions';
import { site } from '@/config/site';
import { fail, ok } from '@/lib/result';
import {
  learnIdInputSchema,
  learnPageInputSchema,
  learnSearchMissesInputSchema,
  learnSetPublishedSchema,
} from '@/lib/schemas';
import {
  learnSearchReport,
  realLearnDeps,
  saveLearnPage,
  setLearnPublished,
  syncLearnIndexNow,
} from '@/server/admin/learn';
import { getLearnPageForAdmin, listLearnPagesForAdmin } from '@/server/queries/learn';
import { guard } from './guard';

/** Learning admin actions: each checks the admin session, then delegates to `src/server/`. */
export const learn = {
  /** Every page, published or not: id, slug, title, topic, kind, published, edited in the panel. */
  listLearnPages: defineAction({
    handler: async (_input, context) => {
      await guard(context);
      return ok(await listLearnPagesForAdmin());
    },
  }),
  /** One page with its Markdown body, questions and the sources it can cite; `NOT_FOUND` otherwise. */
  getLearnPage: defineAction({
    input: learnIdInputSchema,
    handler: async ({ id }, context) => {
      await guard(context);
      const page = await getLearnPageForAdmin(id);
      return page ? ok(page) : fail('NOT_FOUND');
    },
  }),
  /** Saves the editable fields of a page and its questions, then updates it in the search index. */
  saveLearnPage: defineAction({
    input: learnPageInputSchema,
    handler: async (input, context) => {
      await guard(context);
      return saveLearnPage(realLearnDeps(), input);
    },
  }),
  /** Shows or hides a page in Aprende and in the search. */
  setLearnPublished: defineAction({
    input: learnSetPublishedSchema,
    handler: async (input, context) => {
      await guard(context);
      return setLearnPublished(realLearnDeps(), input);
    },
  }),
  /** Searches without results of the last `days` days, added up, plus the state of the index. */
  learnSearchMisses: defineAction({
    input: learnSearchMissesInputSchema,
    handler: async ({ days }, context) => {
      await guard(context);
      return ok(await learnSearchReport(realLearnDeps(), days, site.timeZone));
    },
  }),
  /** Rebuilds the whole search index from D1; `SEARCH_UNAVAILABLE` when Meilisearch fails. */
  syncLearnIndex: defineAction({
    handler: async (_input, context) => {
      await guard(context);
      return syncLearnIndexNow(realLearnDeps());
    },
  }),
};
