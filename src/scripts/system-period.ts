/**
 * Monthly or yearly on the pricing page for workshops (docs/25 §6.2, §7.2). A click on a period
 * button of `PeriodToggle` marks it pressed and copies, for each price of `PlanBand`
 * (`[data-plan-price]`), the texts of that period from its `data-{period}-{amount|per|note}`
 * attributes to its `b`, its `span` and the `.price-yr` line next to it. It only swaps text
 * (`textContent`): the money is formatted on the server. Starts on `astro:page-load` and removes
 * its listeners on `astro:before-swap` (docs/07 §1).
 */
import type { Period } from '@/lib/system/plans';

let stop: AbortController | null = null;

/** Writes the texts of the period on every plan price of the page. */
function paint(period: Period) {
  document.querySelectorAll<HTMLElement>('[data-plan-price]').forEach((price) => {
    const amount = price.querySelector('b');
    const per = price.querySelector('span');
    const note = price.parentElement ? price.parentElement.querySelector('.price-yr') : null;
    const read = (part: string) => price.getAttribute(`data-${period}-${part}`) ?? '';
    if (amount) amount.textContent = read('amount');
    if (per) per.textContent = read('per');
    if (note) note.textContent = read('note');
  });
}

function setup() {
  if (stop) stop.abort();
  const buttons = Array.prototype.slice.call(
    document.querySelectorAll('[data-period]'),
  ) as HTMLButtonElement[];
  if (buttons.length === 0) {
    stop = null;
    return;
  }
  stop = new AbortController();
  const signal = stop.signal;
  buttons.forEach((button) => {
    button.addEventListener(
      'click',
      () => {
        const period: Period = button.dataset.period === 'yearly' ? 'yearly' : 'monthly';
        buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
        paint(period);
      },
      { signal },
    );
  });
}

document.addEventListener('astro:page-load', setup);
document.addEventListener('astro:before-swap', () => {
  if (stop) stop.abort();
  stop = null;
});
