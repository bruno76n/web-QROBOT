/**
 * Behavior of ¿Qué plan te toca? on the pricing page (docs/25 §7.2). Reads the three sliders, writes
 * each reading («20 o más» at the top) and its track fill (`--p`), and shows the plan that fits with
 * the pure `recommendPlan` and `planReasons` (src/lib/system/plans.ts): its name, its price in the
 * chosen period (the toggle sends it with the `system:period` event), why it fits and the button
 * label. Plans and texts come from `data-finder-data` (JSON written by PlanFinder.astro). Only
 * `textContent`, `createElement` and a style property change: no `innerHTML`. Starts on
 * `astro:page-load` and removes its listeners on `astro:before-swap` (docs/07 §1).
 */
import {
  planReasons,
  recommendPlan,
  type Period,
  type Plan,
  type PlanId,
  type PlanReason,
  type Usage,
} from '@/lib/system/plans';
import { PERIOD_EVENT } from '@/scripts/system-period';

/** What PlanFinder.astro serializes into `data-finder-data`. */
interface FinderData {
  plans: Plan[];
  maxPrinters: number;
  names: Record<PlanId, string>;
  amounts: Record<PlanId, Record<Period, string>>;
  reasons: {
    freeLimits: string;
    printers: Record<string, string>;
    twoPeople: string;
    roles: string;
    orders: string;
    contact: string;
  };
  cta: { free: string; paid: string };
}

let stop: AbortController | null = null;

/** The text of one reason; the numbers are the ones the page wrote for the same plans. */
function reasonText(r: PlanReason, data: FinderData): string {
  switch (r.key) {
    case 'printers':
      return data.reasons.printers[String(r.n)] || '';
    case 'freeLimits':
      return data.reasons.freeLimits;
    case 'twoPeople':
      return data.reasons.twoPeople;
    case 'roles':
      return data.reasons.roles;
    case 'orders':
      return data.reasons.orders;
    case 'contact':
      return data.reasons.contact;
  }
}

function setup() {
  stop?.abort();
  stop = null;
  const root = document.querySelector<HTMLElement>('[data-finder-data]');
  const form = root?.querySelector<HTMLFormElement>('[data-finder]');
  if (!root || !form) return;
  let data: FinderData;
  try {
    data = JSON.parse(root.dataset.finderData || '') as FinderData;
  } catch {
    return;
  }
  if (!data.plans || !data.plans.length) return;
  stop = new AbortController();
  const signal = stop.signal;

  const inputs = Array.prototype.slice.call(
    form.querySelectorAll('input[type="range"]'),
  ) as HTMLInputElement[];
  const name = root.querySelector<HTMLElement>('[data-f-name]');
  const amount = root.querySelector<HTMLElement>('[data-f-amt]');
  const why = root.querySelector<HTMLElement>('[data-f-why]');
  const cta = root.querySelector<HTMLElement>('[data-f-cta]');
  const pressed = document.querySelector<HTMLElement>('[data-period][aria-pressed="true"]');
  let period: Period = pressed && pressed.dataset.period === 'yearly' ? 'yearly' : 'monthly';

  /** The value of a slider by its name. */
  const value = (n: keyof Usage) => {
    const input = inputs.filter((i) => i.name === n)[0];
    return input ? Number(input.value) : 0;
  };

  /** Repaints the readings, the fills and the result. */
  const render = () => {
    inputs.forEach((i) => {
      const min = Number(i.min);
      const max = Number(i.max);
      const v = Number(i.value);
      i.style.setProperty('--p', `${((v - min) / (max - min)) * 100}%`);
      const text = v >= max ? i.dataset.maxLabel || String(v) : String(v);
      const out = form.querySelector<HTMLElement>(`output[for="${i.id}"]`);
      if (out) out.textContent = text;
      i.setAttribute('aria-valuetext', text);
    });
    const usage: Usage = {
      printers: value('printers'),
      people: value('people'),
      orders: value('orders'),
    };
    const { plan } = recommendPlan(usage, data.plans);
    if (name) name.textContent = data.names[plan.id] || '';
    const prices = data.amounts[plan.id];
    if (amount) amount.textContent = prices ? prices[period] : '';
    if (why) {
      while (why.firstChild) why.removeChild(why.firstChild);
      planReasons(usage, data.plans, data.maxPrinters).forEach((r) => {
        const li = document.createElement('li');
        li.textContent = reasonText(r, data);
        why.appendChild(li);
      });
    }
    if (cta) cta.textContent = plan.monthly === 0 ? data.cta.free : data.cta.paid;
  };

  form.addEventListener('input', render, { signal });
  form.addEventListener('submit', (e) => e.preventDefault(), { signal });
  document.addEventListener(
    PERIOD_EVENT,
    (e) => {
      period = (e as CustomEvent<Period>).detail === 'yearly' ? 'yearly' : 'monthly';
      render();
    },
    { signal },
  );
  render();
}

document.addEventListener('astro:page-load', setup);
document.addEventListener('astro:before-swap', () => {
  stop?.abort();
  stop = null;
});
