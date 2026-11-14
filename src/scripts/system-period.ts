/**
 * Behavior of the monthly or yearly toggle of the pricing page (docs/25 §7.2). A press marks its
 * button, swaps the texts of every plan price (`[data-plan-price]`, from its `data-monthly-*` or
 * `data-yearly-*` attributes) and of its `.price-yr` line, and announces the period with the
 * `system:period` event so the plan finder can repaint its price. Only `textContent` changes: no
 * `innerHTML`, no money formatting here. Starts on `astro:page-load` and removes its listeners on
 * `astro:before-swap` (docs/07 §1).
 */
import type { Period } from '@/lib/system/plans';

/** Name of the event that carries the chosen period (`detail`) to the plan finder. */
export const PERIOD_EVENT = 'system:period';

let stop: AbortController | null = null;

/** Writes the texts of one period into every plan price of the page. */
function paint(period: Period) {
  const prices = document.querySelectorAll<HTMLElement>('[data-plan-price]');
  Array.prototype.forEach.call(prices, (el: HTMLElement) => {
    const amount = el.querySelector('b');
    const per = el.querySelector('span');
    const yr = el.nextElementSibling;
    const d = el.dataset;
    if (amount) amount.textContent = (period === 'yearly' ? d.yearlyAmount : d.monthlyAmount) || '';
    if (per) per.textContent = (period === 'yearly' ? d.yearlyPer : d.monthlyPer) || '';
    if (yr && yr.classList.contains('price-yr'))
      yr.textContent = (period === 'yearly' ? d.yearlyNote : d.monthlyNote) || '';
  });
}

function setup() {
  stop?.abort();
  stop = null;
  const toggle = document.querySelector<HTMLElement>('[data-period-toggle]');
  if (!toggle) return;
  stop = new AbortController();
  const signal = stop.signal;
  const buttons = Array.prototype.slice.call(
    toggle.querySelectorAll('[data-period]'),
  ) as HTMLButtonElement[];

  buttons.forEach((btn) => {
    btn.addEventListener(
      'click',
      () => {
        const period: Period = btn.dataset.period === 'yearly' ? 'yearly' : 'monthly';
        buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        paint(period);
        document.dispatchEvent(new CustomEvent(PERIOD_EVENT, { detail: period }));
      },
      { signal },
    );
  });
}

document.addEventListener('astro:page-load', setup);
document.addEventListener('astro:before-swap', () => {
  stop?.abort();
  stop = null;
});
