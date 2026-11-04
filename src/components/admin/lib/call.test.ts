import { describe, expect, it } from 'vitest';
import { ApiError, callAction, normalizeOutcome, unwrap } from './call';
import { errorText, missingList } from './error-text';

describe('normalizeOutcome', () => {
  it('passes business results through (ok and failures)', () => {
    expect(normalizeOutcome({ data: { ok: true, data: 5 } })).toEqual({ ok: true, data: 5 });
    expect(normalizeOutcome({ data: { ok: false, code: 'SLUG_TAKEN' } })).toEqual({
      ok: false,
      code: 'SLUG_TAKEN',
    });
  });
  it("turns Zod's BAD_REQUEST into VALIDATION with the fields", () => {
    expect(normalizeOutcome({ error: { code: 'BAD_REQUEST', fields: { name: ['x'] } } })).toEqual({
      ok: false,
      code: 'VALIDATION',
      details: { fields: { name: ['x'] } },
    });
  });
  it('UNAUTHORIZED stays UNAUTHORIZED; anything else is INTERNAL with the error id', () => {
    expect(normalizeOutcome({ error: { code: 'UNAUTHORIZED' } })).toEqual({
      ok: false,
      code: 'UNAUTHORIZED',
    });
    expect(
      normalizeOutcome({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'error a1b2c3d4' } }),
    ).toEqual({
      ok: false,
      code: 'INTERNAL',
      details: { errorId: 'a1b2c3d4' },
    });
    expect(normalizeOutcome({})).toMatchObject({ ok: false, code: 'INTERNAL' });
  });
});

describe('callAction', () => {
  it('a network failure while online means the Access session ended', async () => {
    const boom = () => Promise.reject(new TypeError('Failed to fetch'));
    expect(await callAction(boom, () => true)).toEqual({ ok: false, code: 'UNAUTHORIZED' });
  });
  it('a network failure while offline is OFFLINE', async () => {
    const boom = () => Promise.reject(new TypeError('Failed to fetch'));
    expect(await callAction(boom, () => false)).toEqual({ ok: false, code: 'OFFLINE' });
  });
  it('returns the normalized result when it works', async () => {
    expect(await callAction(async () => ({ data: { ok: true as const, data: 1 } }))).toEqual({
      ok: true,
      data: 1,
    });
  });
});

describe('unwrap and error texts', () => {
  it('unwrap returns data or throws ApiError', () => {
    expect(unwrap({ ok: true, data: 3 })).toBe(3);
    expect(() => unwrap({ ok: false, code: 'NOT_FOUND' })).toThrow(ApiError);
  });
  it('texts come from docs/12 §7', () => {
    expect(errorText({ ok: false, code: 'UNAUTHORIZED' })).toBe(
      'Tu sesión terminó. Vuelve a entrar.',
    );
    expect(errorText({ ok: false, code: 'SLUG_TAKEN' })).toBe(
      'Esa dirección ya la usa otro producto.',
    );
    expect(
      errorText({ ok: false, code: 'CANNOT_PUBLISH', details: { missing: ['photo', 'price'] } }),
    ).toBe('Para publicarlo falta: una foto y el precio desde.');
    expect(errorText({ ok: false, code: 'INTERNAL', details: { errorId: 'abc12345' } })).toBe(
      'Algo salió mal. Intenta de nuevo. (Código: abc12345)',
    );
    expect(errorText({ code: 'OFFLINE' })).toBe(
      'No hay conexión. Tus cambios siguen aquí; intenta guardar de nuevo.',
    );
  });
  it('lists missing pieces in plain Spanish', () => {
    expect(missingList(['photo'])).toBe('una foto');
    expect(missingList(['photo', 'category', 'price'])).toBe(
      'una foto, una categoría y el precio desde',
    );
  });
});
