/**
 * Island of the order section: a WhatsApp-style chat whose sentence has fill-in blanks (name,
 * quantity, piece, extras, deadline) and details. It builds the `wa.me` link from that state and
 * reacts to `#pedido=<id>` addresses to preload a preset.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { pieces, whenOptions, withOptions } from '@/config/order';
import { es } from '@/i18n/es';
import { defaultOrder, orderStateMessage, parseOrderHash, type OrderState } from '@/lib/order';
import { normalizeQuantity } from '@/lib/plural';
import { waLink } from '@/lib/whatsapp';

const t = es.home.order;

// The island's only input is the number the message goes to.
interface Props {
  /** WhatsApp number from `site.ts`. */
  whatsapp: string;
}

/** Width of a text in the field's font, for fields that grow with what is written. */
function measure(el: HTMLElement, text: string): number {
  const cs = getComputedStyle(el);
  const canvas = measure.canvas ?? (measure.canvas = document.createElement('canvas'));
  const ctx = canvas.getContext('2d');
  if (!ctx) return 0;
  ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  return ctx.measureText(text).width;
}
measure.canvas = undefined as HTMLCanvasElement | undefined;

/**
 * The order as a WhatsApp message with fill-in blanks (docs/04 §2.8). Ideas and "Apartar un
 * regalo" are links to `#pedido=<id>`: this island listens to `hashchange` and fills the fields.
 */
export default function OrderComposer({ whatsapp }: Props) {
  const [state, setState] = useState<OrderState>(defaultOrder);
  const [quantityText, setQuantityText] = useState(String(defaultOrder.quantity));
  const [time, setTime] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);
  const detailsRef = useRef<HTMLTextAreaElement>(null);
  const root = useRef<HTMLFormElement>(null);

  // Applies a preset's quantity, piece, extras and deadline, keeping the name and details.
  const apply = (preset: Pick<OrderState, 'quantity' | 'piece' | 'with' | 'when'>) => {
    setState((s) => ({ ...s, ...preset }));
    setQuantityText(String(preset.quantity));
  };

  // Fills the blanks from `#pedido=<id>` on mount and on every `hashchange`.
  useEffect(() => {
    const fromHash = () => {
      const preset = parseOrderHash(window.location.hash);
      if (!preset) return;
      apply(preset);
      // Focus the first thing left to fill, after the scroll to the section.
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.setTimeout(
        () =>
          (state.name.trim() ? detailsRef.current : nameRef.current)?.focus({
            preventScroll: true,
          }),
        reduce ? 0 : 650,
      );
    };
    // The first read happens right after mount (not inside the effect body), like a user event.
    const first = window.setTimeout(() => {
      const now = new Date();
      setTime(
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      );
      fromHash();
    }, 0);
    window.addEventListener('hashchange', fromHash);
    return () => {
      window.clearTimeout(first);
      window.removeEventListener('hashchange', fromHash);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Quantity as a valid number (the text field may hold a partial value while typing).
  const quantity = normalizeQuantity(quantityText);
  const piece = pieces[state.piece] ?? pieces[0];
  const href = waLink(whatsapp, orderStateMessage({ ...state, quantity }));

  // The blanks grow with what they hold (field-sizing: content has no support everywhere yet).
  useLayoutEffect(() => {
    root.current?.querySelectorAll<HTMLElement>('[data-fit]').forEach((el) => {
      const cs = getComputedStyle(el);
      const text =
        el instanceof HTMLSelectElement
          ? (el.options[el.selectedIndex]?.text ?? '')
          : (el as HTMLInputElement).value || (el as HTMLInputElement).placeholder || '0';
      const pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) + 6;
      const max = (el.closest('.say') as HTMLElement | null)?.clientWidth ?? 9999;
      el.style.width = `${Math.min(max - 48, Math.ceil(measure(el, text) + pad))}px`;
    });
  });

  return (
    <form ref={root} className="chat" onSubmit={(e) => e.preventDefault()} noValidate>
      <div className="chat-top">
        <img src="/favicon.svg" width="40" height="35" alt="" />
        <div>
          <b>{t.contact}</b>
          <span>{t.reply}</span>
        </div>
      </div>
      <div className="chat-body">
        <p className="msg in">
          {t.greeting}
          <span className="t">{time}</span>
        </p>
        <p className="msg out say">
          {state.name.trim() ? t.helloName : t.hello}{' '}
          <input
            ref={nameRef}
            data-fit
            className="f"
            type="text"
            placeholder={t.namePlaceholder}
            aria-label={t.nameLabel}
            autoComplete="organization"
            value={state.name}
            onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
          />{' '}
          {state.name.trim() ? t.and : t.and.replace('y ', '')}{' '}
          <input
            data-fit
            className="f qty"
            type="text"
            inputMode="numeric"
            aria-label={t.quantityLabel}
            value={quantityText}
            onChange={(e) => setQuantityText(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
            onBlur={() => setQuantityText(String(quantity))}
          />{' '}
          <select
            data-fit
            className="f"
            aria-label={t.pieceLabel}
            value={state.piece}
            onChange={(e) => setState((s) => ({ ...s, piece: Number(e.target.value) }))}
          >
            {pieces.map((p, i) => (
              <option key={p[0]} value={i}>
                {quantity === 1 ? p[0] : p[1]}
              </option>
            ))}
          </select>{' '}
          {t.withWord}{' '}
          <span className="nw">
            <select
              data-fit
              className="f"
              aria-label={t.withLabel}
              value={state.with}
              onChange={(e) => setState((s) => ({ ...s, with: Number(e.target.value) }))}
            >
              {withOptions.map((o, i) => (
                <option key={o} value={i}>
                  {o}
                </option>
              ))}
            </select>
            .
          </span>{' '}
          {t.neededWord}{' '}
          <span className="nw">
            <select
              data-fit
              className="f"
              aria-label={t.whenLabel}
              value={state.when}
              onChange={(e) => setState((s) => ({ ...s, when: Number(e.target.value) }))}
            >
              {whenOptions.map((o, i) => (
                <option key={o} value={i}>
                  {o}
                </option>
              ))}
            </select>
            .
          </span>
          <span className="t">{time}</span>
        </p>
        <div className="msg out det">
          <label className="vh" htmlFor="q-det">
            {t.detailsLabel}
          </label>
          <textarea
            ref={detailsRef}
            id="q-det"
            rows={2}
            placeholder={t.detailsPlaceholder}
            value={state.details}
            onChange={(e) => setState((s) => ({ ...s, details: e.target.value }))}
          />
        </div>
      </div>
      <div className="send">
        <a className="order-send" data-click="order" href={href} target="_blank" rel="noopener">
          {t.send}
          <span aria-hidden="true">→</span>
        </a>
        <p>{t.sendNote}</p>
      </div>
      <span className="vh" aria-live="polite">
        {piece[0]}
      </span>
    </form>
  );
}
