/** Admin actions for maintenance: JSON backup export and the sweep of stale pending uploads. */

import { defineAction } from 'astro:actions';
import { ok } from '@/lib/result';
import { realDeps } from '@/server/admin/context';
import { exportBackup } from '@/server/admin/backup';
import { cleanupPending } from '@/server/cleanup';
import { guard } from './guard';

/** Backup-related admin actions; each one checks the admin session first. */
export const backup = {
  /** Returns all catalog data as JSON for the panel to download; the photo files stay in R2. */
  exportBackup: defineAction({
    handler: async (_input, context) => {
      await guard(context);
      return ok(await exportBackup(realDeps()));
    },
  }),
  /** Removes photos uploaded more than 24 h ago that were never attached to anything (the panel calls it on open). */
  cleanupPending: defineAction({
    handler: async (_input, context) => {
      await guard(context);
      return ok(await cleanupPending(realDeps()));
    },
  }),
};
