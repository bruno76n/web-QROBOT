/** Heat level of a filament from its HDT (docs/21 §6.1, `heatLevels` of datos/filamentos.json). */
export interface HeatLevel {
  id: string;
  label: string;
  /** Highest HDT (°C) of the level; `null` = no limit. */
  maxC: number | null;
}

/**
 * First level whose ceiling is at or above `hdtC`; levels must come ordered from lowest to highest.
 * Returns `undefined` when the filament has no known HDT.
 */
export function heatLevel<T extends HeatLevel>(
  hdtC: number | null,
  levels: readonly T[],
): T | undefined {
  if (hdtC === null) return undefined;
  return levels.find((l) => l.maxC === null || hdtC <= l.maxC);
}
