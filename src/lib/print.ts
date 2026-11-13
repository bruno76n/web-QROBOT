/** Maths of "Imprimiendo": Q-404 appears layer by layer with the scroll (docs/04 §2.5). */

/** Number of layers of the printed model. */
export const TOTAL_LAYERS = 640;
/** Total print time shown by the section, in minutes. */
const TOTAL_MINUTES = 128;

export interface PrintGeometry {
  /** `getBoundingClientRect().top` of the section. */
  sectionTop: number;
  sectionHeight: number;
  viewportHeight: number;
  /** Height of the sticky header. */
  headerHeight: number;
}

/** 0 when the section reaches the header, 1 a little before its end (the 1.12 makes it finish early). */
export function printProgress(g: PrintGeometry): number {
  const span = g.sectionHeight - (g.viewportHeight - g.headerHeight);
  const raw = ((g.headerHeight - g.sectionTop) / Math.max(1, span)) * 1.12;
  return Math.min(1, Math.max(0, raw));
}

/** Layer shown for a progress value, from 1 to `TOTAL_LAYERS`. */
export const layerOf = (progress: number) => Math.max(1, Math.round(progress * TOTAL_LAYERS));

/** True once the print is complete (a hair under 1 absorbs rounding). */
export const isDone = (progress: number) => progress >= 0.999;

/** "listo" or "faltan 2 h 8 min". */
export function timeLabel(progress: number): string {
  if (isDone(progress)) return 'listo';
  const left = Math.round((1 - progress) * TOTAL_MINUTES);
  return `faltan ${left >= 60 ? `${Math.floor(left / 60)} h ` : ''}${left % 60} min`;
}
