import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * Key–value pairs editable from the panel (docs/09 › settings).
 * Phase 1 only has this table; products, photos and hero come in phase 2.
 */
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

export type Setting = typeof settings.$inferSelect;
