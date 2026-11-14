import { describe, expect, it } from 'vitest';
import { formatSyncedAt } from './search-admin';

const TZ = 'America/Mexico_City';

describe('formatSyncedAt', () => {
  it('shows the date and the 24-hour time in the business time zone', () => {
    expect(formatSyncedAt('2026-11-14T16:32:00.000Z', TZ)).toBe('14 de noviembre de 2026, 10:32');
  });
  it('uses the local day, not the UTC one', () => {
    // 05:07 UTC on 3 January is still 2 January, 23:07, in Guadalajara (UTC−6).
    expect(formatSyncedAt('2026-01-03T05:07:00.000Z', TZ)).toBe('2 de enero de 2026, 23:07');
  });
  it('pads minutes and early hours with a zero', () => {
    expect(formatSyncedAt('2026-03-01T06:05:00.000Z', TZ)).toBe('1 de marzo de 2026, 00:05');
  });
  it('an unreadable date gives null', () => {
    expect(formatSyncedAt('not a date', TZ)).toBeNull();
    expect(formatSyncedAt('', TZ)).toBeNull();
  });
});
