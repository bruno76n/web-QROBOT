import { defineAction } from 'astro:actions';
import { ok } from '@/lib/result';
import { realDeps } from '@/server/admin/context';
import { exportBackup } from '@/server/admin/backup';
import { cleanupPending } from '@/server/cleanup';
import { guard } from './guard';

export const backup = {
  exportBackup: defineAction({
    handler: async (_input, context) => {
      await guard(context);
      return ok(await exportBackup(realDeps()));
    },
  }),
  cleanupPending: defineAction({
    handler: async (_input, context) => {
      await guard(context);
      return ok(await cleanupPending(realDeps()));
    },
  }),
};
