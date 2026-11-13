import { describe, expect, it } from 'vitest';
import { heatLevel, type HeatLevel } from './heat';

const levels: HeatLevel[] = [
  { id: 'low', label: 'Bajo', maxC: 59 },
  { id: 'mid', label: 'Medio', maxC: 90 },
  { id: 'high', label: 'Alto', maxC: 150 },
  { id: 'very-high', label: 'Muy alto', maxC: null },
];

describe('heatLevel', () => {
  it.each([
    [57, 'low'],
    [59, 'low'],
    [60, 'mid'],
    [74, 'mid'],
    [90, 'mid'],
    [110, 'high'],
    [150, 'high'],
    [151, 'very-high'],
    [250, 'very-high'],
  ])('%s °C → %s', (hdt, id) => {
    expect(heatLevel(hdt, levels)?.id).toBe(id);
  });
});
