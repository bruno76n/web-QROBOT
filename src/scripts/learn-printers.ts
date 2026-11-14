/**
 * Behavior of ¿Cabe mi pieza? and the printers table of Aprende (docs/21 §6.2). The two can be on
 * the same page or apart: the tool counts the printers of the table (only the ones the table
 * filters show) or, without a table, every printer it carries in `data-sizes`. The fit rule is the
 * pure one of src/lib/learn/fit.ts. Starts on `astro:page-load` and removes its listeners on
 * `astro:before-swap` (docs/07 §1). Only `textContent` and `hidden` change: no `innerHTML`.
 */
import { fitPiece, toMm, type Dims, type FitUnit } from '@/lib/learn/fit';
import { fillText } from '@/lib/learn/tables';
import { parseAmount } from '@/lib/number';

let stop: AbortController | null = null;

/** A size from the dataset attributes of a row. */
function rowDims(tr: HTMLElement): Dims {
  return {
    widthMm: Number(tr.dataset.w),
    depthMm: Number(tr.dataset.d),
    heightMm: Number(tr.dataset.h),
  };
}

function setup() {
  stop?.abort();
  stop = new AbortController();
  const signal = stop.signal;

  const tool = document.querySelector<HTMLElement>('[data-fit]');
  const table = document.querySelector<HTMLElement>('[data-printers]');
  const rows = table
    ? (Array.prototype.slice.call(table.querySelectorAll('tbody tr')) as HTMLElement[])
    : [];
  const margin = tool ? Number(tool.dataset.margin) || 0 : 5;
  const inputs = tool
    ? (Array.prototype.slice.call(tool.querySelectorAll('[data-fit-in]')) as HTMLInputElement[])
    : [];
  let unit: FitUnit = 'cm';
  const filter = { size: 'todas', brand: '', enclosed: false };

  /** The piece in mm, or null while a side is missing or not above zero. */
  const piece = (): Dims | null => {
    const v = inputs.map((i) => toMm(parseAmount(i.value), unit));
    return v.every((x) => x > 0) ? { widthMm: v[0]!, depthMm: v[1]!, heightMm: v[2]! } : null;
  };

  /** Applies the table filters and the fit of the piece, then writes both counts. */
  const apply = () => {
    const p = piece();
    let shown = 0;
    let fitting = 0;
    rows.forEach((tr) => {
      const visible =
        (filter.size === 'todas' || tr.dataset.size === filter.size) &&
        (!filter.brand || tr.dataset.brand === filter.brand) &&
        (!filter.enclosed || tr.dataset.enclosed === '1');
      tr.hidden = !visible;
      if (visible) shown++;
      const cell = tr.querySelector<HTMLElement>('.fitcell');
      tr.classList.remove('nofit');
      if (!cell) return;
      cell.textContent = '';
      if (!p) {
        cell.textContent = '—';
        return;
      }
      const result = fitPiece(p, rowDims(tr), margin);
      const tag = document.createElement('span');
      tag.className = result === 'standing' ? 'tag g' : result === 'lying' ? 'tag p' : 'tag';
      tag.textContent =
        (result === 'standing'
          ? cell.dataset.standing
          : result === 'lying'
            ? cell.dataset.lying
            : cell.dataset.no) || '';
      cell.appendChild(tag);
      if (result === 'no') tr.classList.add('nofit');
      else if (visible) fitting++;
    });
    if (table) {
      const count = table.querySelector<HTMLElement>('[data-pt-count]');
      if (count)
        count.textContent = fillText((shown === 1 ? count.dataset.one : count.dataset.many) || '', {
          n: shown,
        });
    }
    if (!tool) return;
    const out = tool.querySelector<HTMLElement>('[data-fit-out]');
    if (!out) return;
    if (!table) {
      const sizes = JSON.parse(tool.dataset.sizes || '[]') as number[][];
      shown = sizes.length;
      fitting = p
        ? sizes.filter(
            (s) =>
              fitPiece(p, { widthMm: s[0]!, depthMm: s[1]!, heightMm: s[2]! }, margin) !== 'no',
          ).length
        : 0;
    }
    if (!p) out.textContent = tool.dataset.prompt || '';
    else if (fitting === 0) out.textContent = tool.dataset.none || '';
    else out.textContent = fillText(tool.dataset.count || '', { n: fitting, m: shown });
  };

  inputs.forEach((i) => i.addEventListener('input', apply, { signal }));
  const unitBox = tool ? tool.querySelector<HTMLElement>('[data-fit-unit]') : null;
  unitBox?.addEventListener(
    'click',
    (e) => {
      const b = (e.target as Element).closest('button');
      if (!b) return;
      const next = (b.getAttribute('data-u') || 'cm') as FitUnit;
      unitBox
        .querySelectorAll('button')
        .forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      // Typed values are converted so the piece keeps its size.
      if (next !== unit)
        inputs.forEach((i) => {
          const v = parseAmount(i.value);
          if (v > 0) i.value = String(Math.round((next === 'cm' ? v / 10 : v * 10) * 10) / 10);
        });
      unit = next;
      apply();
    },
    { signal },
  );

  if (table) {
    const chips = table.querySelector<HTMLElement>('[data-pt-chips]');
    chips?.addEventListener(
      'click',
      (e) => {
        const b = (e.target as Element).closest('button');
        if (!b) return;
        chips
          .querySelectorAll('button')
          .forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        filter.size = b.getAttribute('data-id') || 'todas';
        apply();
      },
      { signal },
    );
    (table.querySelector('[data-pt-brand]') as HTMLSelectElement | null)?.addEventListener(
      'change',
      (e) => {
        filter.brand = (e.target as HTMLSelectElement).value;
        apply();
      },
      { signal },
    );
    table.querySelector<HTMLInputElement>('[data-pt-enclosed]')?.addEventListener(
      'change',
      (e) => {
        filter.enclosed = (e.target as HTMLInputElement).checked;
        apply();
      },
      { signal },
    );
    const sort = table.querySelector<HTMLButtonElement>('[data-pt-sort]');
    const body = table.querySelector('tbody');
    let bySize = false;
    sort?.addEventListener(
      'click',
      () => {
        bySize = !bySize;
        sort.textContent = (bySize ? sort.dataset.byBrand : sort.dataset.bySize) || '';
        rows
          .slice()
          .sort((a, b) =>
            bySize
              ? Number(b.dataset.l) - Number(a.dataset.l)
              : Number(a.dataset.i) - Number(b.dataset.i),
          )
          .forEach((tr) => body?.appendChild(tr));
      },
      { signal },
    );
  }
  if (tool || table) apply();
}

document.addEventListener('astro:page-load', setup);
document.addEventListener('astro:before-swap', () => {
  stop?.abort();
  stop = null;
});
