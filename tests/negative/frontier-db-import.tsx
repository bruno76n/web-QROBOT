// NEGATIVE FIXTURE: a component importing the database must break the lint (docs/07 §6).
import { drizzle } from 'drizzle-orm/d1';

export function Bad() {
  return <p>{String(drizzle)}</p>;
}
