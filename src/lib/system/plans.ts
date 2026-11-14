/**
 * Plans of the system for workshops (docs/25 §4–5): the price of a plan by period, what the yearly
 * price comes to per month, and how a limit reads. Pure: the plans come from `site.system.plans`.
 */

export type PlanId = 'free' | 'shop' | 'business';
export type Period = 'monthly' | 'yearly';

/** A plan and its limits; `null` means no limit. Prices in whole pesos, VAT included. */
export interface Plan {
  id: PlanId;
  monthly: number;
  yearly: number;
  users: number;
  printers: number | null;
  orders: number | null;
  /** The users of this plan get roles (docs/25 §4). */
  roles?: boolean;
  recommended?: boolean;
}

/** Price of a plan in the period, in whole pesos. */
export function planPrice(plan: Plan, period: Period): number {
  return period === 'monthly' ? plan.monthly : plan.yearly;
}

/** What the yearly price comes to per month, rounded to the peso. */
export function yearlyPerMonth(plan: Plan): number {
  return Math.round(plan.yearly / 12);
}

/**
 * How a limit reads: the number as is, or the «no limit» word when it is `null`. The word comes
 * from the caller because it agrees with the row («Ilimitadas» impresoras, «Ilimitados» pedidos).
 */
export function limitLabel(value: number | null, unlimited: string): string {
  return value === null ? unlimited : String(value);
}
