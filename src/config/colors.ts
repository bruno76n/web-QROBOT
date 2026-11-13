/** Product colors (docs/03 §2): the dots of the color selector. */
export const colors = [
  { id: 'morado', label: 'Morado', hex: '#6b3fd4' },
  { id: 'verde', label: 'Verde', hex: '#00ae42' },
  { id: 'negro', label: 'Negro', hex: '#1c1c22' },
  { id: 'blanco', label: 'Blanco', hex: '#f3f3f6' },
  { id: 'lila', label: 'Lila', hex: '#b49af5' },
  { id: 'rojo', label: 'Rojo', hex: '#e5352b' },
  { id: 'azul', label: 'Azul', hex: '#2f6fe0' },
  { id: 'amarillo', label: 'Amarillo', hex: '#ffc21a' },
  { id: 'naranja', label: 'Naranja', hex: '#ff7a30' },
  { id: 'rosa', label: 'Rosa', hex: '#ff8fb3' },
  { id: 'gris', label: 'Gris', hex: '#9b9ba5' },
  { id: 'cafe', label: 'Café', hex: '#a8683c' },
] as const;

/** Id of one of the product colors. */
export type ColorId = (typeof colors)[number]['id'];

/** The color ids as a non-empty tuple, as Zod enums require. */
export const colorIds = colors.map((c) => c.id) as [ColorId, ...ColorId[]];

/** Type guard for a string that is a known color id. */
export function isColorId(value: string): value is ColorId {
  return colors.some((c) => c.id === value);
}
