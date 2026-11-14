/**
 * Checks of the data of the page for workshops (docs/25 §12): the invariants that must always hold
 * and the switch guard (with `enabled` on, every address of the system must be real). Each function
 * returns the problems found, as short codes; an empty list means all is right. Pure.
 */
import type { Plan } from './plans';

/** What the switch guard reads from `site.system`. */
export interface SystemSwitch {
  enabled: boolean;
  name: string;
  appUrl: string;
  downloads: Record<string, { url: string }>;
}

/** Top-level domains reserved for examples and tests (RFC 2606), like the provisional address. */
const reservedTld = /\.(example|test|invalid|localhost)$/;

/** An address that can be linked from the page: `https://` and a real host. */
function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname !== '' && !reservedTld.test(url.hostname);
  } catch {
    return false;
  }
}

/**
 * Invariants of the plans, the comparison and the money example: yearly = 10 × monthly, a single
 * recommended plan, cheapest first, every limit row reads a field the plans have, and the example
 * adds up to 100.00.
 */
export function dataProblems(input: {
  plans: readonly Plan[];
  limitRows: readonly string[];
  money: readonly { amount: number }[];
}): string[] {
  const problems: string[] = [];
  for (const p of input.plans) {
    if (p.yearly !== p.monthly * 10) problems.push(`yearly:${p.id}`);
  }
  if (input.plans.filter((p) => p.recommended).length !== 1) problems.push('recommended');
  input.plans.reduce<Plan | null>((prev, p) => {
    if (prev && p.monthly < prev.monthly) problems.push(`order:${p.id}`);
    return p;
  }, null);
  for (const limit of input.limitRows) {
    if (!input.plans.every((p) => limit in p)) problems.push(`limit:${limit}`);
  }
  const cents = input.money.reduce((s, m) => s + Math.round(m.amount * 100), 0);
  if (cents !== 10000) problems.push('money');
  return problems;
}

/** Switch guard: with the page on, the name and every address (system and installers) are real. */
export function switchProblems(system: SystemSwitch): string[] {
  if (!system.enabled) return [];
  const problems: string[] = [];
  if (system.name.trim() === '') problems.push('name');
  if (!isHttpsUrl(system.appUrl)) problems.push('appUrl');
  for (const [id, d] of Object.entries(system.downloads)) {
    if (!isHttpsUrl(d.url)) problems.push(`download:${id}`);
  }
  return problems;
}
