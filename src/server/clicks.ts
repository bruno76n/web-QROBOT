import { site } from '@/config/site';
import { and, eq, gte, sql } from 'drizzle-orm';
import { localParts } from '@/lib/season';
import type { ClickStats } from '@/lib/admin-types';
import { clickSources, type ClickSource } from '@/lib/schemas';
import { getDb, schema, type Db } from './db/client';

/** `YYYY-MM-DD` in the business time zone. */
export function dayKey(date: Date, timeZone: string): string {
  const p = localParts(date, timeZone);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

/** Adds one to today's counter. Nothing about the person is stored (docs/18 §2). */
export async function recordClick(
  db: Db,
  input: { source: ClickSource; productId?: string | undefined },
  now: Date,
  timeZone: string,
): Promise<boolean> {
  const productId = input.source === 'product' ? (input.productId ?? '') : '';
  if (productId) {
    const [found] = await db
      .select({ id: schema.products.id })
      .from(schema.products)
      .where(eq(schema.products.id, productId));
    if (!found) return false;
  }
  await db
    .insert(schema.whatsappClicks)
    .values({ day: dayKey(now, timeZone), source: input.source, productId, count: 1 })
    .onConflictDoUpdate({
      target: [
        schema.whatsappClicks.day,
        schema.whatsappClicks.source,
        schema.whatsappClicks.productId,
      ],
      set: { count: sql`${schema.whatsappClicks.count} + 1` },
    });
  return true;
}

/** Taps of the last `days` days (today included), by source and by product. */
export async function clickStats(
  db: Db,
  days: number,
  now: Date,
  timeZone: string,
): Promise<ClickStats> {
  const since = dayKey(new Date(now.getTime() - (days - 1) * 86_400_000), timeZone);
  const rows = await db
    .select({
      source: schema.whatsappClicks.source,
      productId: schema.whatsappClicks.productId,
      count: sql<number>`sum(${schema.whatsappClicks.count})`,
    })
    .from(schema.whatsappClicks)
    .where(and(gte(schema.whatsappClicks.day, since)))
    .groupBy(schema.whatsappClicks.source, schema.whatsappClicks.productId);
  const stats: ClickStats = {
    days,
    total: 0,
    bySource: { product: 0, order: 0, q404: 0, customizer: 0 },
    byProduct: {},
  };
  for (const r of rows) {
    const n = Number(r.count);
    if (!(clickSources as readonly string[]).includes(r.source)) continue;
    stats.bySource[r.source as ClickSource] += n;
    stats.total += n;
    if (r.productId) stats.byProduct[r.productId] = (stats.byProduct[r.productId] ?? 0) + n;
  }
  return stats;
}

/** Used by the route and the panel action: the real database, the business time zone. */
export const countClick = (
  input: { source: ClickSource; productId?: string | undefined },
  at: Date,
) => recordClick(getDb(), input, at, site.timeZone);

export const recentClickStats = (days: number, at: Date) =>
  clickStats(getDb(), days, at, site.timeZone);
