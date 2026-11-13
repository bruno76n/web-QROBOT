/** Builds the Drizzle client for D1. */

import { drizzle } from 'drizzle-orm/d1';
import { getEnv } from '../env';
import * as schema from './schema';

/** Drizzle client over the D1 binding. Only src/server/ may use it (docs/07 §6). */
export function getDb(db: D1Database = getEnv().DB) {
  return drizzle(db, { schema });
}

/** The Drizzle client type used by queries and admin actions. */
export type Db = ReturnType<typeof getDb>;
export { schema };
