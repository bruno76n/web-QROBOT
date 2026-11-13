/**
 * The topics of Aprende (docs/21 §3). Fixed, so they live here and not in the database (docs/09).
 * The order is the one of the home page and of the search filter. No topic may be called `buscar`.
 */
export const learnTopics = [
  {
    id: 'filamentos',
    name: 'Filamentos',
    blurb: 'PLA, PETG, TPU, ASA, nylon. Temperaturas, secado y cómo guardarlos.',
  },
  {
    id: 'problemas',
    name: 'Cuando algo sale mal',
    blurb: 'Primera capa que no pega, hilos, esquinas levantadas, boquilla tapada.',
  },
  {
    id: 'maquinas',
    name: 'Máquinas',
    blurb: 'Tipos de impresora, boquillas, placas, tamaño de impresión y cuál comprar.',
  },
  {
    id: 'laminado',
    name: 'Laminado',
    blurb: 'Altura de capa, paredes, relleno, soportes y orientación.',
  },
  {
    id: 'mantenimiento',
    name: 'Mantenimiento',
    blurb: 'Limpiar la cama, cambiar la boquilla, lubricar los ejes.',
  },
  {
    id: 'modelos',
    name: 'Modelos y diseño',
    blurb: 'Dónde conseguir modelos, licencias para vender y reglas de diseño.',
  },
  {
    id: 'acabado',
    name: 'Acabado',
    blurb: 'Quitar soportes, lijar, pintar y pegar.',
  },
  {
    id: 'seguridad',
    name: 'Seguridad',
    blurb: 'Ventilación, temperaturas, incendio y piezas para usos de riesgo.',
  },
  {
    id: 'encargar',
    name: 'Si vas a encargar una pieza',
    blurb: 'Qué mandar para cotizar, cuánto tarda y por qué cuesta más que su plástico.',
  },
  {
    id: 'negocio',
    name: 'Negocio',
    blurb: 'Costo de una pieza, precio, fallos e inventario de filamento.',
  },
  {
    id: 'glosario',
    name: 'Glosario',
    blurb: 'Palabras de impresión 3D en español y en inglés.',
  },
] as const;

/** Id of a topic of Aprende. */
export type LearnTopicId = (typeof learnTopics)[number]['id'];
/** The topic ids as a non-empty tuple, as Zod enums require. */
export const learnTopicIds = learnTopics.map((t) => t.id) as [LearnTopicId, ...LearnTopicId[]];

/** Display name of a topic; an empty string for an unknown id. */
export function learnTopicName(id: string): string {
  return learnTopics.find((t) => t.id === id)?.name ?? '';
}

/** Type guard for a string that is a known topic id. */
export function isLearnTopic(id: string): id is LearnTopicId {
  return learnTopics.some((t) => t.id === id);
}
