/** Options of the order composer (docs/05 §2 › Pedido). [singular, plural] of each piece. */
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

export const withOptions = ['mi logo', 'un nombre', 'una foto', 'una idea mía'] as const;
export const whenOptions = ['lo antes posible', 'antes de Navidad', 'sin prisa'] as const;
