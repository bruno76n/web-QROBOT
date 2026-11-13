/**
 * Live search box of Aprende (docs/22 §9): a WAI-ARIA combobox over `/api/aprende/buscar`. Searches
 * from 2 characters, 150 ms after the last key, cancelling the previous request; ↑ ↓ move, Enter
 * opens, Esc closes; ⌘K / Ctrl+K and «/» focus the box from any Aprende page. On phones the results
 * open as a full-screen sheet and the page behind stops scrolling (`html.lock`). Results are built
 * with DOM nodes and text: the highlight comes as parts and only `<mark>` wraps them, never
 * `innerHTML`. Starts on `astro:page-load` and removes everything on `astro:before-swap`
 * (docs/07 §1); Safari 14 rules of docs/24 §5.
 */
import type { HighlightPart } from '@/lib/learn/search-docs';
import { countText, fillText } from '@/lib/learn/tables';
import { learnMissMessage, waLink } from '@/lib/whatsapp';

/** Texts and settings the component writes into `data-config` (es.ts and site.ts). */
interface Config {
  whatsapp: string;
  q404: string;
  topics: { id: string; label: string }[];
  t: {
    all: string;
    searching: string;
    results: { one: string; many: string };
    noResults: string;
    seeAll: string;
    types: Record<string, string>;
    empty: string;
    emptyHint: string;
    ask: string;
    error: string;
  };
}

interface Hit {
  type: string;
  url: string;
  topic: string;
  topicLabel: string;
  title: HighlightPart[];
  text: HighlightPart[];
}

const minChars = 2;
const waitMs = 150;
const showSearchingAfterMs = 300;

let stop: AbortController | null = null;

/** A node with the highlight parts: marked ones in `<mark>`, the rest as text. */
function marked(parts: HighlightPart[]): DocumentFragment {
  const frag = document.createDocumentFragment();
  parts.forEach((p) => {
    if (p.m) {
      const m = document.createElement('mark');
      m.textContent = p.t;
      frag.appendChild(m);
    } else frag.appendChild(document.createTextNode(p.t));
  });
  return frag;
}

/** An element with a class and text (text is always set with `textContent`). */
function el(tag: string, cls: string, text?: string): HTMLElement {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

/** Appends several children in order. */
function add(parent: Node, ...children: Node[]) {
  children.forEach((c) => parent.appendChild(c));
}

/** Wires one search box. Every listener uses the page's abort signal. */
function wire(form: HTMLFormElement, signal: AbortSignal) {
  const input = form.querySelector<HTMLInputElement>('input[name="q"]');
  const panel = form.querySelector<HTMLElement>('.sp');
  const list = form.querySelector<HTMLElement>('.sp-list');
  const count = form.querySelector<HTMLElement>('.sp-n');
  const chips = form.querySelector<HTMLElement>('.sp-chips');
  const close = form.querySelector<HTMLButtonElement>('.sf-close');
  if (!input || !panel || !list || !count || !chips) return;
  const config = JSON.parse(form.dataset.config || '{}') as Config;
  const phone = window.matchMedia('(max-width: 760px)');
  let topic = '';
  let active = -1;
  let timer = 0;
  let request: AbortController | null = null;

  /** Opens or closes the results; on phones the open panel is a full-screen sheet. */
  const open = (on: boolean) => {
    panel.hidden = !on;
    input.setAttribute('aria-expanded', String(on));
    const sheet = on && phone.matches;
    form.classList.toggle('open', sheet);
    document.documentElement.classList.toggle('lock', sheet);
    if (!on) {
      input.removeAttribute('aria-activedescendant');
      active = -1;
    }
  };

  /** Removes the results, the empty state and any message. */
  const clear = () => {
    list.textContent = '';
    panel.querySelectorAll('.q-empty, .sp-msg').forEach((n) => n.remove());
  };

  /** Topic chips: «Todo» and every topic; the pressed one filters the next search. */
  const drawChips = () => {
    chips.textContent = '';
    [{ id: '', label: config.t.all }, ...config.topics].forEach((c) => {
      const b = el('button', '', c.label) as HTMLButtonElement;
      b.type = 'button';
      b.setAttribute('aria-pressed', String(c.id === topic));
      b.addEventListener(
        'click',
        () => {
          topic = c.id;
          void run();
          input.focus();
        },
        { signal },
      );
      chips.appendChild(b);
    });
  };

  /** One result row: title, phrase and «Tipo · Tema». */
  const row = (h: Hit, i: number) => {
    const li = el('li', 'sp-item');
    li.setAttribute('role', 'option');
    li.setAttribute('aria-selected', 'false');
    const a = el('a', '') as HTMLAnchorElement;
    a.href = h.url;
    a.id = `${list.id}-o${i}`;
    const title = el('span', 'sp-t');
    title.appendChild(marked(h.title));
    const text = el('span', 'sp-x');
    text.appendChild(marked(h.text));
    add(a, title, text, el('span', 'sp-k', `${config.t.types[h.type] || ''} · ${h.topicLabel}`));
    li.appendChild(a);
    return li;
  };

  /** No results: Q-404, the message and «¿Lo preguntamos por ti?» to WhatsApp. */
  const empty = (q: string) => {
    const box = el('div', 'q-empty');
    const img = document.createElement('img');
    img.src = config.q404;
    img.alt = '';
    img.width = 92;
    img.height = 146;
    const body = el('div', '');
    const link = el('a', 'btn wa sm', config.t.ask) as HTMLAnchorElement;
    link.href = waLink(config.whatsapp, learnMissMessage(q));
    link.target = '_blank';
    link.rel = 'noopener';
    const action = el('div', '');
    action.appendChild(link);
    add(
      body,
      el('b', '', fillText(config.t.empty, { q })),
      el('span', 'small mute', config.t.emptyHint),
      action,
    );
    add(box, img, body);
    panel.appendChild(box);
  };

  /** Asks the server and paints the answer; a newer search cancels this one. */
  const run = async () => {
    const q = input.value.trim();
    if (q.length < minChars) {
      request?.abort();
      open(false);
      return;
    }
    request?.abort();
    request = new AbortController();
    const mine = request;
    const slow = setTimeout(() => {
      clear();
      panel.appendChild(el('p', 'sp-msg', config.t.searching));
      open(true);
    }, showSearchingAfterMs);
    try {
      const params = new URLSearchParams({ q });
      if (topic) params.set('tema', topic);
      const res = await fetch(`/api/aprende/buscar?${params.toString()}`, { signal: mine.signal });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { total: number; hits: Hit[] };
      clearTimeout(slow);
      if (mine !== request) return;
      clear();
      drawChips();
      data.hits.forEach((h, i) => list.appendChild(row(h, i)));
      if (data.total > data.hits.length) {
        const more = el('li', 'sp-item sp-more');
        more.setAttribute('role', 'option');
        more.setAttribute('aria-selected', 'false');
        const a = el('a', '') as HTMLAnchorElement;
        a.id = `${list.id}-more`;
        a.href = `/aprende/buscar?${params.toString()}`;
        a.appendChild(el('span', 'sp-t', fillText(config.t.seeAll, { n: data.total })));
        more.appendChild(a);
        list.appendChild(more);
      }
      if (data.hits.length === 0) empty(q);
      count.textContent =
        data.total > 0 ? countText(data.total, config.t.results) : config.t.noResults;
      active = -1;
      open(true);
    } catch (e) {
      clearTimeout(slow);
      if ((e as Error).name === 'AbortError' || mine !== request) return;
      clear();
      count.textContent = '';
      panel.appendChild(el('p', 'sp-msg', config.t.error));
      open(true);
    }
  };

  input.addEventListener(
    'input',
    () => {
      clearTimeout(timer);
      timer = window.setTimeout(() => void run(), waitMs);
    },
    { signal },
  );
  input.addEventListener(
    'focus',
    () => {
      if (input.value.trim().length >= minChars) void run();
    },
    { signal },
  );
  input.addEventListener(
    'keydown',
    (e) => {
      const options = Array.prototype.slice.call(
        list.querySelectorAll('.sp-item'),
      ) as HTMLElement[];
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (panel.hidden || options.length === 0) return;
        e.preventDefault();
        active = (active + (e.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
        options.forEach((o, i) => o.setAttribute('aria-selected', String(i === active)));
        const link = options[active]?.querySelector('a');
        if (link) {
          input.setAttribute('aria-activedescendant', link.id);
          link.scrollIntoView({ block: 'nearest' });
        }
      } else if (e.key === 'Enter' && active > -1 && !panel.hidden) {
        const link = options[active]?.querySelector('a');
        if (link) {
          e.preventDefault();
          link.click();
        }
      } else if (e.key === 'Escape') {
        open(false);
        input.blur();
      }
    },
    { signal },
  );
  close?.addEventListener('click', () => open(false), { signal });
  document.addEventListener(
    'click',
    (e) => {
      if (!phone.matches && !form.contains(e.target as Node)) open(false);
    },
    { signal },
  );
  // Rotating the phone or resizing turns the sheet into a list and back.
  const onMedia = () => {
    if (!panel.hidden) open(true);
  };
  if (phone.addEventListener) phone.addEventListener('change', onMedia, { signal });
  else phone.addListener(onMedia);
  // Suggestions under the home search box fill it in and search.
  document.querySelectorAll<HTMLButtonElement>('[data-q]').forEach((b) =>
    b.addEventListener(
      'click',
      () => {
        input.value = b.dataset.q || '';
        input.focus();
        void run();
      },
      { signal },
    ),
  );
  signal.addEventListener('abort', () => {
    clearTimeout(timer);
    request?.abort();
    document.documentElement.classList.remove('lock');
  });
}

function setup() {
  stop?.abort();
  stop = new AbortController();
  const signal = stop.signal;
  const forms = Array.prototype.slice.call(
    document.querySelectorAll('form[data-search]'),
  ) as HTMLFormElement[];
  forms.forEach((f) => wire(f, signal));
  if (forms.length === 0) return;
  // ⌘K / Ctrl+K anywhere, and «/» when not typing, focus the first search box of the page.
  document.addEventListener(
    'keydown',
    (e) => {
      const target = e.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (
        ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) ||
        (e.key === '/' && !typing)
      ) {
        const input = forms[0]?.querySelector<HTMLInputElement>('input[name="q"]');
        if (input) {
          e.preventDefault();
          input.focus();
        }
      }
    },
    { signal },
  );
}

document.addEventListener('astro:page-load', setup);
document.addEventListener('astro:before-swap', () => {
  stop?.abort();
  stop = null;
});
