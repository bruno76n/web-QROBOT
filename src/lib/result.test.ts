import { describe, expect, it } from 'vitest';
import { errorCodes, fail, ok } from './result';

describe('Result', () => {
  it('ok carries data', () => {
    expect(ok(5)).toEqual({ ok: true, data: 5 });
  });
  it('fail carries a code and optional details', () => {
    expect(fail('NOT_FOUND')).toEqual({ ok: false, code: 'NOT_FOUND' });
    expect(fail('CANNOT_PUBLISH', { missing: ['photo'] })).toEqual({
      ok: false,
      code: 'CANNOT_PUBLISH',
      details: { missing: ['photo'] },
    });
  });
  it('has the eleven codes of docs/10 §5', () => {
    expect(errorCodes).toHaveLength(15);
  });
});
