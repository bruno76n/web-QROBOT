import { describe, expect, it } from 'vitest';
import { distance, highlightWords, wordMatches, words } from './fuzzy';

describe('words', () => {
  it('normalizes and splits', () => {
    expect(words('¿Cómo SECAR el PLA+?')).toEqual(['como', 'secar', 'el', 'pla+']);
  });
});

describe('distance', () => {
  it('counts edits and stops early', () => {
    expect(distance('petj', 'petg')).toBe(1);
    expect(distance('hilos', 'hilos')).toBe(0);
    expect(distance('a', 'abcdef', 2)).toBe(3);
  });
});

describe('wordMatches', () => {
  it('equal, prefix, one typo from 4 letters, two from 8', () => {
    expect(wordMatches('petg', 'petg')).toBe(true);
    expect(wordMatches('sec', 'secado')).toBe(true);
    expect(wordMatches('petj', 'petg')).toBe(true);
    expect(wordMatches('pet', 'pez')).toBe(false); // 3 letters: no typos
    expect(wordMatches('boquila', 'boquilla')).toBe(true);
    expect(wordMatches('mantenimeinto', 'mantenimiento')).toBe(true);
    expect(wordMatches('xyz', 'abs')).toBe(false);
  });
});

describe('highlightWords', () => {
  it('marks matching words and keeps the rest as text', () => {
    expect(highlightWords('El PETG aguanta', ['petj'])).toEqual([
      { t: 'El ', m: false },
      { t: 'PETG', m: true },
      { t: ' aguanta', m: false },
    ]);
  });
  it('markup stays text', () => {
    expect(highlightWords('<b>PLA</b>', ['pla'])).toEqual([{ t: '<b>PLA</b>', m: false }]);
    expect(highlightWords('<b> PLA', ['pla'])).toEqual([
      { t: '<b> ', m: false },
      { t: 'PLA', m: true },
    ]);
  });
  it('no searched words: one plain part', () => {
    expect(highlightWords('hola mundo', [])).toEqual([{ t: 'hola mundo', m: false }]);
  });
});
