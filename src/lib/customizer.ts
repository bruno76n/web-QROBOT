import { colors, type ColorId } from '@/config/colors';
import { customizerMessage, type CustomizerShape } from './whatsapp';

/** The name customizer of the catalog (docs/04 §3 point 3). Pure: the view only paints this. */
export const makerShapes: CustomizerShape[] = ['llavero', 'estrella', 'corazón'];
export const makerColorIds: ColorId[] = [
  'morado',
  'verde',
  'negro',
  'lila',
  'rojo',
  'azul',
  'blanco',
];
export const MAKER_NAME_MAX = 10;

export interface MakerState {
  shape: CustomizerShape;
  color: ColorId;
  name: string;
}

export const defaultMaker: MakerState = { shape: 'llavero', color: 'morado', name: 'SOFI' };

/** Letters A–Z, Ñ, accented vowels, Ü, digits and spaces; capitals; at most 10 (docs/11 §3). */
export function sanitizeName(raw: string): string {
  return raw
    .toLocaleUpperCase('es-MX')
    .replace(/[^A-ZÑÁÉÍÓÚÜ0-9 ]/g, '')
    .replace(/^\s+/, '')
    .slice(0, MAKER_NAME_MAX);
}

/** Pale colors need dark letters; the rest take white ones. */
export const letterTone = (color: ColorId): 'dark' | 'light' =>
  color === 'lila' || color === 'blanco' ? 'dark' : 'light';

export const colorHex = (id: ColorId) => colors.find((c) => c.id === id)?.hex ?? '#6b3fd4';
export const colorLabel = (id: ColorId) => colors.find((c) => c.id === id)?.label ?? id;

/** WhatsApp message, or null while there is no name (the button stays off). */
export function makerMessage(state: MakerState): string | null {
  return customizerMessage({
    shape: state.shape,
    color: colorLabel(state.color),
    name: state.name,
  });
}
