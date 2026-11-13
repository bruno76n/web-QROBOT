import { unitFor } from './plural';

/** `https://wa.me/<number>?text=<encoded message>` (docs/05 §5). */
export function waLink(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export interface ProductMessageInput {
  quantity: number;
  unitSingular: string;
  unitPlural: string;
  productName: string;
  /** Lowercase color name, e.g. "verde". Omit when the product has no color chosen. */
  color?: string | undefined;
  /** The question asked to the customer and the answer, e.g. "Nombre (hasta 10 letras)" / "SOFI". */
  personal?: { hint: string; answer: string } | undefined;
  url: string;
}

export function productMessage(i: ProductMessageInput): string {
  const unit = unitFor(
    i.quantity,
    { singular: i.unitSingular, plural: i.unitPlural },
    i.productName,
  );
  const color = i.color ? ` en ${i.color}` : '';
  const personal =
    i.personal && i.personal.answer.trim()
      ? ` (${i.personal.hint}: ${i.personal.answer.trim()})`
      : '';
  return (
    `Hola, me interesa: ${i.quantity} ${unit}${color}${personal}. ` +
    `¿Cuánto me sale y para cuándo lo tendrían?\n${i.url}`
  );
}

export interface OrderMessageInput {
  name?: string | undefined;
  quantity: number;
  /** [singular, plural] of the chosen piece, e.g. ['figura', 'figuras']. */
  piece: readonly [string, string];
  con: string;
  when: string;
  details?: string | undefined;
}

export function orderMessage(i: OrderMessageInput): string {
  const name = i.name?.trim();
  const piece = i.quantity === 1 ? i.piece[0] : i.piece[1];
  let msg = `Hola${name ? `, soy ${name} y` : ','} necesito ${i.quantity} ${piece} con ${i.con}. Lo necesito ${i.when}.`;
  const details = i.details?.trim();
  if (details) msg += `\nDetalles: ${details}`;
  return `${msg}\n(Lo vi en su página.)`;
}

/** `combo` is the label as shown ("Rosa y menta"); the message uses it in lowercase. */
export function q404Message(combo: string): string {
  return `Hola, quiero un Q-404 en ${combo.toLowerCase()}. ¿Cuánto cuesta y cuándo lo tendrían?`;
}

/** From a page of Aprende: "Cotizar por WhatsApp" (docs/21 §4.6). */
export function learnQuoteMessage(title: string): string {
  return `Hola, vi «${title}» en su página y quiero cotizar una pieza.`;
}

/** From the search of Aprende without results (docs/22 §9). */
export function learnMissMessage(query: string): string {
  return `Hola, busqué «${query.trim()}» en Aprende y no encontré la respuesta.`;
}
