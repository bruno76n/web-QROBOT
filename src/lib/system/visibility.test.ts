import { describe, expect, it } from 'vitest';
import { isSystemPath, isSystemVisible } from './visibility';

describe('isSystemPath', () => {
  it.each([
    ['/talleres', true],
    ['/talleres/', true],
    ['/talleres/precios', true],
    ['/talleres/descargar', true],
    ['/talleresx', false],
    ['/aprende/talleres', false],
    ['/', false],
    ['/%74alleres', true],
    ['/talleres%2Fprecios', true],
    ['/%E0%A4%A', false],
  ])('%s → %s', (path, expected) => {
    expect(isSystemPath(path)).toBe(expected);
  });
});

describe('isSystemVisible', () => {
  it('only with the switch on or in dev', () => {
    expect(isSystemVisible({ enabled: false, dev: false })).toBe(false);
    expect(isSystemVisible({ enabled: false, dev: true })).toBe(true);
    expect(isSystemVisible({ enabled: true, dev: false })).toBe(true);
  });
});
