/** The 7 ideas of "¿Qué se te antoja?" (docs/05 §3). Fixed content, not edited in the panel. */
export interface Idea {
  id: string;
  name: string;
  phrase: string;
  /** Brand image: `/brand/ideas/<file>-<width>.webp` (largest version, never enlarged). */
  image: { file: string; width: number; height: number };
  /** What the order fills in (indexes into `src/config/order.ts`). */
  order: { quantity: number; piece: number; with: number; when: number };
}

export const ideas: readonly Idea[] = [
  {
    id: 'servilleteros',
    name: 'Servilleteros',
    phrase: 'Que tu logo esté en cada mesa.',
    image: { file: 'servilleteros', width: 480, height: 363 },
    order: { quantity: 20, piece: 0, with: 0, when: 0 },
  },
  {
    id: 'numeros-de-mesa',
    name: 'Números de mesa',
    phrase: 'Del 1 a la última mesa, con tu marca.',
    image: { file: 'numeros-de-mesa', width: 231, height: 480 },
    order: { quantity: 15, piece: 1, with: 0, when: 0 },
  },
  {
    id: 'porta-qr',
    name: 'Porta QR',
    phrase: 'Tu menú, a un escaneo de distancia.',
    image: { file: 'porta-qr', width: 357, height: 480 },
    order: { quantity: 10, piece: 2, with: 0, when: 0 },
  },
  {
    id: 'llaveros',
    name: 'Llaveros',
    phrase: 'Un regalo que tus clientes sí van a usar.',
    image: { file: 'llaveros', width: 239, height: 480 },
    order: { quantity: 10, piece: 3, with: 1, when: 0 },
  },
  {
    id: 'figuras',
    name: 'Figuras',
    phrase: 'Tu hijo, tu perro o tú, en miniatura y a partir de una foto.',
    image: { file: 'figuras', width: 480, height: 328 },
    order: { quantity: 1, piece: 4, with: 2, when: 0 },
  },
  {
    id: 'adornos-de-navidad',
    name: 'Adornos de Navidad',
    phrase: 'El que tu hijo quiere y no encuentras en ninguna tienda.',
    image: { file: 'adornos-de-navidad', width: 480, height: 409 },
    order: { quantity: 1, piece: 5, with: 3, when: 1 },
  },
  {
    id: 'lo-que-se-te-ocurra',
    name: 'Lo que se te ocurra',
    phrase: 'Esa pieza que se rompió o la idea que traes en la cabeza.',
    image: { file: 'lo-que-se-te-ocurra', width: 442, height: 480 },
    order: { quantity: 1, piece: 6, with: 3, when: 0 },
  },
];

/** `#pedido=navidad` ("Apartar un regalo"): 1 · figura · una foto · antes de Navidad. */
export const christmasOrder = { quantity: 1, piece: 4, with: 2, when: 1 } as const;
