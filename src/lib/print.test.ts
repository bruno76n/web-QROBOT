import { describe, expect, it } from 'vitest';
import { isDone, layerOf, printProgress, timeLabel } from './print';

const g = { sectionHeight: 2000, viewportHeight: 900, headerHeight: 68 };

describe('print progress', () => {
  it('is 0 before the section sticks and 1 near its end', () => {
    expect(printProgress({ ...g, sectionTop: 500 })).toBe(0);
    expect(printProgress({ ...g, sectionTop: 68 })).toBe(0);
    expect(printProgress({ ...g, sectionTop: 68 - 1168 })).toBe(1);
    expect(printProgress({ ...g, sectionTop: -5000 })).toBe(1);
  });
  it('grows with the scroll', () => {
    const a = printProgress({ ...g, sectionTop: -100 });
    const b = printProgress({ ...g, sectionTop: -500 });
    expect(b).toBeGreaterThan(a);
    expect(a).toBeGreaterThan(0);
  });
  it('layer counter and time label', () => {
    expect(layerOf(0)).toBe(1);
    expect(layerOf(0.5)).toBe(320);
    expect(layerOf(1)).toBe(640);
    expect(timeLabel(0)).toBe('faltan 2 h 8 min');
    expect(timeLabel(0.5)).toBe('faltan 1 h 4 min');
    expect(timeLabel(0.95)).toBe('faltan 6 min');
    expect(timeLabel(1)).toBe('listo');
    expect(isDone(0.9995)).toBe(true);
  });
});
