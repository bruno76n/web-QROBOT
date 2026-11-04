import { christmasOrder, ideas } from '@/config/ideas';
import { pieces, whenOptions, withOptions } from '@/config/order';
import { orderMessage } from './whatsapp';

/** State of the order composer on the home page (docs/04 §2.8). */
export interface OrderState {
  name: string;
  quantity: number;
  piece: number;
  with: number;
  when: number;
  details: string;
}

export const defaultOrder: OrderState = {
  name: '',
  quantity: 20,
  piece: 0,
  with: 0,
  when: 0,
  details: '',
};

export const clampIndex = (value: number, length: number) =>
  Number.isInteger(value) && value >= 0 && value < length ? value : 0;

/** `#pedido=<idea id>` or `#pedido=navidad` → the fields to fill; null for any other hash. */
export function parseOrderHash(
  hash: string,
): Pick<OrderState, 'quantity' | 'piece' | 'with' | 'when'> | null {
  const match = /^#pedido=([a-z0-9-]+)$/.exec(hash);
  if (!match) return null;
  const id = match[1];
  if (id === 'navidad') return { ...christmasOrder };
  const idea = ideas.find((i) => i.id === id);
  return idea ? { ...idea.order } : null;
}

/** The WhatsApp message for the composer (docs/05 §5). */
export function orderStateMessage(state: OrderState): string {
  const piece = pieces[clampIndex(state.piece, pieces.length)] ?? pieces[0];
  return orderMessage({
    name: state.name,
    quantity: Math.max(1, Math.min(9999, Math.trunc(state.quantity) || 1)),
    piece,
    con: withOptions[clampIndex(state.with, withOptions.length)] ?? withOptions[0],
    when: whenOptions[clampIndex(state.when, whenOptions.length)] ?? whenOptions[0],
    details: state.details,
  });
}
