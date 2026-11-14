/**
 * Plans of the system for workshops (docs/25 §4–5): which plan fits a workshop, why, and its price
 * by period. Pure: the plans come from `site.system.plans`, cheapest first.
 */

export type PlanId = 'free' | 'shop' | 'business';
export type Period = 'monthly' | 'yearly';

/** A plan and its limits; `null` means no limit. Prices in whole pesos, VAT included. */
export interface Plan {
  id: PlanId;
  monthly: number;
  yearly: number;
  people: number;
  printers: number | null;
  orders: number | null;
  workshops: number;
  recommended?: boolean;
}

/** What the workshop uses: printers, people and sales plus orders per month. */
export interface Usage {
  printers: number;
  people: number;
  orders: number;
}

/** Whether a plan's limits cover the usage (limits are «up to»). */
function covers(plan: Plan, u: Usage): boolean {
  return (
    (plan.printers === null || u.printers <= plan.printers) &&
    u.people <= plan.people &&
    (plan.orders === null || u.orders <= plan.orders)
  );
}

/**
 * The cheapest plan whose limits cover printers, people and orders. When none does, the last
 * (biggest) one with `contact: true`: the workshop has to write to ask for more.
 */
export function recommendPlan(u: Usage, plans: readonly Plan[]): { plan: Plan; contact: boolean } {
  const fit = plans.find((p) => covers(p, u));
  if (fit) return { plan: fit, contact: false };
  const last = plans[plans.length - 1];
  if (!last) throw new Error('recommendPlan: no plans');
  return { plan: last, contact: true };
}

/** One reason shown under the recommended plan; `n` is the number the text needs. */
export type PlanReason =
  | { key: 'freeLimits'; printers: number; people: number; orders: number }
  | { key: 'printers'; n: number; orMore: boolean }
  | { key: 'twoPeople' }
  | { key: 'roles' }
  | { key: 'orders'; n: number }
  | { key: 'contact'; n: number };

/**
 * Why a plan was recommended, in the order they are shown. `maxPrinters` is the top of the printers
 * slider: at the top the number is read «or more».
 */
export function planReasons(
  u: Usage,
  plans: readonly Plan[],
  maxPrinters = Number.POSITIVE_INFINITY,
): PlanReason[] {
  const free = plans[0];
  const last = plans[plans.length - 1];
  if (!free || !last) return [];
  const { plan, contact } = recommendPlan(u, plans);
  const out: PlanReason[] = [];
  if (plan.id === free.id)
    out.push({
      key: 'freeLimits',
      printers: free.printers ?? 0,
      people: free.people,
      orders: free.orders ?? 0,
    });
  if (free.printers !== null && u.printers > free.printers)
    out.push({ key: 'printers', n: u.printers, orMore: u.printers >= maxPrinters });
  if (u.people > 2) out.push({ key: 'roles' });
  else if (u.people > free.people) out.push({ key: 'twoPeople' });
  if (free.orders !== null && u.orders > free.orders) out.push({ key: 'orders', n: free.orders });
  if (contact) out.push({ key: 'contact', n: last.people });
  return out;
}

/** The price of a plan for a period. */
export function planPrice(plan: Plan, period: Period): number {
  return period === 'monthly' ? plan.monthly : plan.yearly;
}

/** What the yearly price comes to per month, rounded to the peso. */
export function yearlyPerMonth(plan: Plan): number {
  return Math.round(plan.yearly / 12);
}
