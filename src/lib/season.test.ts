import { describe, expect, it } from 'vitest';
import {
  countdown,
  deadlineMark,
  isChristmasSeason,
  localParts,
  timelinePosition,
  type SeasonConfig,
} from './season';

const cfg: SeasonConfig = {
  seasonStart: '10-01',
  eve: '12-24',
  orderDeadline: '12-12',
  timeZone: 'America/Mexico_City',
};
// Guadalajara is UTC−6 all year: local 23:59 = 05:59 UTC next day.
const at = (iso: string) => new Date(iso + '-06:00');

describe('isChristmasSeason (hora de Guadalajara)', () => {
  it('30 Sep 23:59 → out; 1 Oct 00:00 → in', () => {
    expect(isChristmasSeason(at('2026-09-30T23:59:59'), cfg)).toBe(false);
    expect(isChristmasSeason(at('2026-10-01T00:00:00'), cfg)).toBe(true);
  });
  it('24 Dec 23:59 → in; 25 Dec 00:00 → out', () => {
    expect(isChristmasSeason(at('2026-12-24T23:59:59'), cfg)).toBe(true);
    expect(isChristmasSeason(at('2026-12-25T00:00:00'), cfg)).toBe(false);
  });
  it('uses Guadalajara time, not UTC', () => {
    // 1 Oct 04:00 UTC is still 30 Sep 22:00 in Guadalajara
    expect(isChristmasSeason(new Date('2026-10-01T04:00:00Z'), cfg)).toBe(false);
    expect(isChristmasSeason(new Date('2026-10-01T06:00:00Z'), cfg)).toBe(true);
  });
  it('is out of season in the middle of the year', () => {
    expect(isChristmasSeason(at('2026-06-15T12:00:00'), cfg)).toBe(false);
  });
});

describe('countdown', () => {
  it('23 Dec 18:00 → 0 days, 6 hours', () => {
    expect(countdown(at('2026-12-23T18:00:00'), cfg)).toEqual({
      days: 0,
      hours: 6,
      minutes: 0,
      seconds: 0,
      isEve: false,
    });
  });
  it('counts days, hours, minutes and seconds', () => {
    expect(countdown(at('2026-12-01T00:00:00'), cfg)).toMatchObject({
      days: 23,
      hours: 0,
      isEve: false,
    });
    expect(countdown(at('2026-12-23T23:59:30'), cfg)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 30,
      isEve: false,
    });
  });
  it('on 24 Dec it is Nochebuena and everything is zero', () => {
    expect(countdown(at('2026-12-24T00:00:00'), cfg)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isEve: true,
    });
    expect(countdown(at('2026-12-24T15:00:00'), cfg).isEve).toBe(true);
  });
});

describe('timeline', () => {
  it('position runs from 0 on 1 Oct to 100 on 24 Dec', () => {
    expect(timelinePosition(at('2026-10-01T00:00:00'), cfg)).toBe(0);
    expect(timelinePosition(at('2026-12-24T00:00:00'), cfg)).toBe(100);
    const mid = timelinePosition(at('2026-11-12T12:00:00'), cfg);
    expect(mid).toBeGreaterThan(40);
    expect(mid).toBeLessThan(60);
  });
  it('is clamped outside the season', () => {
    expect(timelinePosition(at('2026-08-01T00:00:00'), cfg)).toBe(0);
    expect(timelinePosition(at('2026-12-30T00:00:00'), cfg)).toBe(100);
  });
  it('places the deadline mark and its label', () => {
    const mark = deadlineMark(at('2026-11-01T00:00:00'), cfg);
    expect(mark.label).toBe('12 dic');
    expect(mark.position).toBeGreaterThan(80);
    expect(mark.position).toBeLessThan(100);
  });
});

describe('localParts', () => {
  it('reads wall-clock fields in the zone', () => {
    expect(localParts(new Date('2026-12-24T06:00:00Z'), cfg.timeZone)).toEqual({
      year: 2026,
      month: 12,
      day: 24,
      hour: 0,
      minute: 0,
      second: 0,
    });
  });
});
