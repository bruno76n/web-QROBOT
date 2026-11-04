import { describe, expect, it } from 'vitest';
import { defaultMaker, letterTone, makerColorIds, makerMessage, sanitizeName } from './customizer';

describe('sanitizeName', () => {
  it('uppercases and keeps Ñ, accents and Ü', () => {
    expect(sanitizeName('sofía ñandú')).toBe('SOFÍA ÑANDÚ'.slice(0, 10));
    expect(sanitizeName('pingüino')).toBe('PINGÜINO');
  });
  it('removes everything else and limits to 10', () => {
    expect(sanitizeName('a<b>&c!d@e#f')).toBe('ABCDEF');
    expect(sanitizeName('abcdefghijklmnop')).toBe('ABCDEFGHIJ');
    expect(sanitizeName('  hola')).toBe('HOLA');
    expect(sanitizeName('mesa 12')).toBe('MESA 12');
  });
});

describe('maker message', () => {
  it('flow C: green star "SOFI"', () => {
    expect(makerMessage({ shape: 'estrella', color: 'verde', name: 'SOFI' })).toBe(
      'Hola, quiero una estrella verde que diga “SOFI”. ¿Cuánto cuesta y para cuándo lo tendrían?',
    );
  });
  it('the default is a purple keychain', () => {
    expect(makerMessage(defaultMaker)).toContain('un llavero morado que diga “SOFI”');
  });
  it('has no message without a name', () => {
    expect(makerMessage({ ...defaultMaker, name: '' })).toBeNull();
  });
  it('offers the seven colors of docs/04', () => {
    expect(makerColorIds).toEqual(['morado', 'verde', 'negro', 'lila', 'rojo', 'azul', 'blanco']);
    expect(letterTone('blanco')).toBe('dark');
    expect(letterTone('rojo')).toBe('light');
  });
});
