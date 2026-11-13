import { describe, expect, it } from 'vitest';
import { glossaryGroups, termId, termLetter } from './glossary';

describe('glossary', () => {
  it('letter without accents; Ñ stays Ñ; anything else goes to #', () => {
    expect(termLetter('Ábside')).toBe('A');
    expect(termLetter('ñandú')).toBe('Ñ');
    expect(termLetter('3D')).toBe('#');
  });
  it('anchor is the same slug the search index uses', () => {
    expect(termId('Volumen de impresión')).toBe('volumen-de-impresion');
    expect(termId('PETG')).toBe('petg');
  });
  it('groups by letter in order, terms alphabetical in Spanish', () => {
    const groups = glossaryGroups([
      { term: 'Boquilla', en: 'nozzle', definition: 'x' },
      { term: 'ABS', en: null, definition: 'y' },
      { term: 'Altura de capa', en: 'layer height', definition: 'z' },
      { term: 'Ñ', en: null, definition: 'w' },
    ]);
    expect(groups.map((g) => g.letter)).toEqual(['A', 'B', 'Ñ']);
    expect(groups[0]?.terms.map((t) => t.term)).toEqual(['ABS', 'Altura de capa']);
    expect(groups[0]?.terms[1]?.id).toBe('altura-de-capa');
  });
});
