/** Options of the order composer (docs/05 §2 › Pedido). Each piece is `[singular, plural]`. */
export const pieces = [
  ['servilletero', 'servilleteros'],
  ['número de mesa', 'números de mesa'],
  ['porta QR', 'porta QR'],
  ['llavero', 'llaveros'],
  ['figura', 'figuras'],
  ['adorno de Navidad', 'adornos de Navidad'],
  ['pieza a la medida', 'piezas a la medida'],
  ['estrella navideña', 'estrellas navideñas'],
] as const satisfies readonly (readonly [string, string])[];

/** What the piece is made with; completes "con …" in the message. */
export const withOptions = ['mi logo', 'un nombre', 'una foto', 'una idea mía'] as const;
/** When the customer needs it; completes "Lo necesito …" in the message. */
export const whenOptions = ['lo antes posible', 'antes de Navidad', 'sin prisa'] as const;
