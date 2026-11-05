import { describe, expect, it } from 'vitest';
import {
  categoryIdFromLabel,
  isProtectedCategory,
  publishedLeftWithout,
  reorderIds,
} from './categories';

describe('categoryIdFromLabel', () => {
  it('folds accents and spaces', () => {
    expect(categoryIdFromLabel('Para la oficina', [])).toBe('para-la-oficina');
    expect(categoryIdFromLabel('Niños y niñas', [])).toBe('ninos-y-ninas');
  });
  it('is unique among the taken ids', () => {
    expect(categoryIdFromLabel('Casa', ['casa'])).toBe('casa-2');
    expect(categoryIdFromLabel('Casa', ['casa', 'casa-2'])).toBe('casa-3');
  });
  it('falls back when nothing usable is left', () => {
    expect(categoryIdFromLabel('¡¡¡', [])).toBe('categoria');
  });
  it('stays within the id length', () => {
    expect(categoryIdFromLabel('a'.repeat(100), []).length).toBeLessThanOrEqual(40);
  });
});

describe('isProtectedCategory', () => {
  it('only Navidad is protected', () => {
    expect(isProtectedCategory('navidad')).toBe(true);
    expect(isProtectedCategory('casa')).toBe(false);
  });
});

describe('publishedLeftWithout', () => {
  const list = [
    { id: 'a', published: true, categories: ['casa'] },
    { id: 'b', published: true, categories: ['casa', 'negocio'] },
    { id: 'c', published: false, categories: ['casa'] },
    { id: 'd', published: true, categories: ['negocio'] },
  ];
  it('returns the published products whose only category is the removed one', () => {
    expect(publishedLeftWithout('casa', list).map((p) => p.id)).toEqual(['a']);
  });
});

describe('reorderIds', () => {
  it('follows the wanted order', () => {
    expect(reorderIds(['a', 'b', 'c'], ['c', 'a', 'b'])).toEqual(['c', 'a', 'b']);
  });
  it('drops unknown ids and keeps missing ones at the end', () => {
    expect(reorderIds(['a', 'b', 'c'], ['c', 'x'])).toEqual(['c', 'a', 'b']);
  });
});
