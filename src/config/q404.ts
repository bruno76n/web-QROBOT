/** The six color combinations of Q-404 and their renders (docs/04 §2.6, assets/q404). */
export interface Q404Combo {
  id: string;
  label: string;
  /** Chip gradient colors. */
  a: string;
  b: string;
  /** Render: `/brand/q404/<file>-<width>.webp`. */
  file: string;
}

/** The combinations in display order. */
export const q404Combos: readonly Q404Combo[] = [
  {
    id: 'morado-verde',
    label: 'Morado y verde',
    a: '#6b3fd4',
    b: '#00ae42',
    file: 'q404-morado-verde',
  },
  {
    id: 'morado-amarillo',
    label: 'Morado y amarillo',
    a: '#6b3fd4',
    b: '#ffc21a',
    file: 'q404-morado-amarillo',
  },
  { id: 'azul-lima', label: 'Azul y lima', a: '#2f5bff', b: '#c6f24a', file: 'q404-azul-lima' },
  {
    id: 'naranja-turquesa',
    label: 'Naranja y turquesa',
    a: '#ff7a30',
    b: '#2fc4b2',
    file: 'q404-naranja-turquesa',
  },
  { id: 'rosa-menta', label: 'Rosa y menta', a: '#ff8fb3', b: '#82e0c8', file: 'q404-rosa-menta' },
  {
    id: 'amarillo-azul',
    label: 'Amarillo y azul',
    a: '#ffc21a',
    b: '#2f6fe0',
    file: 'q404-amarillo-azul',
  },
];
