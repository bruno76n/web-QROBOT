import { drizzle } from 'drizzle-orm/d1';
import { getEnv } from '../env';
import * as schema from './schema';

/** Drizzle client over the D1 binding. Only src/server/ may use it (docs/07 §6). */
export function getDb(db: D1Database = getEnv().DB) {
  return drizzle(db, { schema });
}

export type Db = ReturnType<typeof getDb>;
export { schema };
