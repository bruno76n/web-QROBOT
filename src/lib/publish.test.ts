import { describe, expect, it } from 'vitest';
import {
  isValidSlug,
  missingToPublish,
  slugForSave,
  slugFromName,
  uniqueSlug,
  type PublishInput,
} from './publish';

const complete: PublishInput = {
  name: 'Llaveros',
  slug: 'llaveros',
  photoCount: 1,
  categoryCount: 1,
  priceFromCents: 5000,
};

describe('missingToPublish', () => {
  it('has nothing missing when complete', () => {
    expect(missingToPublish(complete)).toEqual([]);
  });
  it('lists each missing piece in the order the panel shows them', () => {
    expect(
      missingToPublish({
        name: '',
        slug: '',
        photoCount: 0,
        categoryCount: 0,
        priceFromCents: null,
      }),
    ).toEqual(['photo', 'category', 'price', 'name']);
  });
  it('a price of $0 counts as a price; null does not', () => {
    expect(missingToPublish({ ...complete, priceFromCents: 0 })).toEqual([]);
    expect(missingToPublish({ ...complete, priceFromCents: null })).toEqual(['price']);
  });
  it('an invalid slug counts as missing the name', () => {
    expect(missingToPublish({ ...complete, slug: 'Con Espacios' })).toEqual(['name']);
  });
});

describe('slugs', () => {
  it('builds a slug from the name folding accents and ñ', () => {
    expect(slugFromName('Llaveros con nombre')).toBe('llaveros-con-nombre');
    expect(slugFromName('Búho')).toBe('buho');
    expect(slugFromName('Porta QR para el menú')).toBe('porta-qr-para-el-menu');
    expect(slugFromName('  ¡Piña & Ñandú!  ')).toMatch(/^[a-z0-9-]+$/);
  });
  it('validates slugs', () => {
    expect(isValidSlug('q-404')).toBe(true);
    for (const bad of ['', '-a', 'a-', 'a--b', 'A', 'a b', 'ñ'])
      expect(isValidSlug(bad), bad).toBe(false);
  });
  it('adds -2, -3 when it collides', () => {
    expect(uniqueSlug('gato', ['perro'])).toBe('gato');
    expect(uniqueSlug('gato', ['gato'])).toBe('gato-2');
    expect(uniqueSlug('gato', new Set(['gato', 'gato-2', 'gato-3']))).toBe('gato-4');
  });
  it('follows the name every time, unless a slug is typed', () => {
    const base = { name: 'Nombre nuevo', currentSlug: 'viejo' };
    expect(slugForSave({ ...base, typedSlug: undefined })).toBe('nombre-nuevo');
    expect(slugForSave({ ...base, typedSlug: '' })).toBe('nombre-nuevo');
    expect(slugForSave({ ...base, typedSlug: 'a-mano' })).toBe('a-mano');
    expect(slugForSave({ name: 'Nuevo', typedSlug: '', currentSlug: undefined })).toBe('nuevo');
  });
  it('keeps the current address when the name has nothing usable', () => {
    expect(slugForSave({ name: '¡¡¡', typedSlug: '', currentSlug: 'buho' })).toBe('buho');
  });
});
