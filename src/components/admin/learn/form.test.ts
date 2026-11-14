import { describe, expect, it } from 'vitest';
import {
  addTag,
  learnFormError,
  learnFormSchema,
  markOf,
  toLearnInput,
  valuesFromPage,
} from './form';

/** A page as the editor receives it. */
const page = {
  title: 'PLA',
  subtitle: 'El más fácil',
  summary: 'Corto',
  bodyMd: '## Uso\n\nTexto',
  tags: ['pla'],
  related: ['filamentos/petg'],
  sources: ['prusa'],
  faqs: [{ q: '¿Sí?', a: 'Sí.' }],
  cta: 'whatsapp' as const,
  ctaText: '',
};

describe('learn form values', () => {
  it('copies the page and builds the save input with id and published', () => {
    const values = valuesFromPage(page);
    expect(values).toEqual(page);
    expect(values.tags).not.toBe(page.tags);
    expect(toLearnInput(values, 'learn-x', true)).toEqual({
      ...page,
      id: 'learn-x',
      published: true,
    });
  });

  it('validates with the server rules and Spanish messages', () => {
    const bad = learnFormSchema.safeParse(
      { ...page, title: '', subtitle: 'x'.repeat(301), faqs: [{ q: '', a: 'a' }] },
      { error: learnFormError },
    );
    expect(bad.success).toBe(false);
    const byPath = Object.fromEntries(
      (bad.error?.issues ?? []).map((i) => [i.path.join('.'), i.message]),
    );
    expect(byPath.title).toBe('Este dato es obligatorio.');
    expect(byPath.subtitle).toBe('Máximo 300 caracteres.');
    expect(byPath['faqs.0.q']).toBe('Este dato es obligatorio.');
  });

  it('says how many fit in a list and falls back to the general text', () => {
    expect(learnFormError({ code: 'too_big', origin: 'array', maximum: 40 })).toBe(
      'Caben hasta 40.',
    );
    expect(learnFormError({ code: 'invalid_value' })).toBe('Revisa los campos marcados.');
  });
});

describe('addTag', () => {
  it('trims, drops a trailing comma and skips empty or repeated tags', () => {
    expect(addTag(['pla'], ' petg, ')).toEqual(['pla', 'petg']);
    expect(addTag(['pla'], 'PLA')).toEqual(['pla']);
    expect(addTag(['pla'], '   ')).toEqual(['pla']);
  });
});

describe('markOf', () => {
  it('reads the name of a paragraph that is only a block mark', () => {
    expect(markOf('[[tabla:filamentos]]')).toBe('tabla:filamentos');
    expect(markOf(' [[desconocida]] ')).toBe('desconocida');
    expect(markOf('ver [[x]] aquí')).toBeNull();
  });
});
