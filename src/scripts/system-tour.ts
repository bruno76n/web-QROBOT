/**
 * Behavior of the tour of the page for workshops (FeatureTour.astro, docs/25 §7.1). Marks the tour
 * `data-ready` (its tabs layout applies from then on) and leaves only the first topic open.
 * Desktop (≥ 1100 px): tabs, one topic always open; clicking one opens it and closes the rest.
 * Phone and tablet: accordion, one open at a time, and clicking the open one closes it. ↑ ↓ move
 * the focus between topics in any width. On going to desktop with every topic closed, the first
 * one opens. Starts on `astro:page-load` and removes its listeners on `astro:before-swap`
 * (docs/07 §1); only `hidden` and `aria-expanded` change.
 */

let tourStop: AbortController | null = null;

function setup() {
  tourStop?.abort();
  tourStop = null;
  const tour = document.querySelector<HTMLElement>('[data-tour]');
  if (!tour) return;
  tourStop = new AbortController();
  const signal = tourStop.signal;

  const items = Array.prototype.slice.call(
    tour.querySelectorAll('.t-item'),
  ) as HTMLButtonElement[];
  if (!items.length) return;
  const wide = window.matchMedia('(min-width: 1100px)');

  /** Opens or closes one topic: its button state and its panel. */
  const show = (btn: HTMLButtonElement, open: boolean) => {
    btn.setAttribute('aria-expanded', String(open));
    const panel = document.getElementById(btn.getAttribute('aria-controls') || '');
    if (panel) panel.hidden = !open;
  };
  /** Opens one topic and closes every other one. */
  const openOnly = (btn: HTMLButtonElement) => items.forEach((b) => show(b, b === btn));
  const isOpen = (btn: HTMLButtonElement) => btn.getAttribute('aria-expanded') === 'true';

  // Start state: the first topic open, the others closed; then the tabs layout may apply.
  openOnly(items[0]!);
  tour.setAttribute('data-ready', '');

  tour.addEventListener(
    'click',
    (e) => {
      const btn = (e.target as Element).closest<HTMLButtonElement>('.t-item');
      if (!btn || !tour.contains(btn)) return;
      if (!wide.matches && isOpen(btn)) show(btn, false);
      else openOnly(btn);
    },
    { signal },
  );

  // Up and down arrows move between topics (wrapping around).
  tour.addEventListener(
    'keydown',
    (e) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      const btn = (e.target as Element).closest<HTMLButtonElement>('.t-item');
      if (!btn) return;
      const i = items.indexOf(btn);
      if (i < 0) return;
      const step = e.key === 'ArrowDown' ? 1 : -1;
      const to = items[(i + step + items.length) % items.length];
      if (!to) return;
      e.preventDefault();
      to.focus();
    },
    { signal },
  );

  // On reaching desktop one topic is always open.
  const onWide = () => {
    if (wide.matches && !items.some(isOpen)) openOnly(items[0]!);
  };
  if (wide.addEventListener) wide.addEventListener('change', onWide, { signal });
  else {
    wide.addListener(onWide);
    signal.addEventListener('abort', () => wide.removeListener(onWide));
  }
}

document.addEventListener('astro:page-load', setup);
document.addEventListener('astro:before-swap', () => {
  tourStop?.abort();
  tourStop = null;
});
