/** Heat level of a filament from its HDT (docs/21 §6.1, `heatLevels` of datos/filamentos.json). */
export interface HeatLevel {
  id: string;
  label: string;
  /** Highest HDT (°C) of the level; `null` = no limit. */
  maxC: number | null;
}

export function heatLevel<T extends HeatLevel>(hdtC: number, levels: readonly T[]): T | undefined {
  return levels.find((l) => l.maxC === null || hdtC <= l.maxC);
}
