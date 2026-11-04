/**
 * Christmas season, countdown and timeline (docs/04 §2.2). Pure: every function receives "now".
 * Dates come as `MM-DD` (docs/10 §6) and are read in the business time zone. Mexico has no daylight
 * saving time any more, so wall-clock differences equal real differences.
 */
export interface SeasonConfig {
  /** `MM-DD` of the first day of the season (10-01). */
  seasonStart: string;
  /** `MM-DD` of Nochebuena (12-24). */
  eve: string;
  /** `MM-DD` of the last day to order (12-12). */
  orderDeadline: string;
  timeZone: string;
}

export interface LocalParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export function localParts(date: Date, timeZone: string): LocalParts {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
    second: get('second'),
  };
}

const wallMs = (p: LocalParts) => Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);

function mmdd(value: string): { month: number; day: number } {
  const [m, d] = value.split('-').map(Number);
  return { month: m ?? 1, day: d ?? 1 };
}

/** Wall-clock ms of `MM-DD 00:00` in a given year. */
function dayStart(year: number, value: string): number {
  const { month, day } = mmdd(value);
  return Date.UTC(year, month - 1, day, 0, 0, 0);
}

/** Season runs from the start day 00:00 until the end of Nochebuena; the 25th is outside. */
export function isChristmasSeason(now: Date, cfg: SeasonConfig): boolean {
  const p = localParts(now, cfg.timeZone);
  const t = wallMs(p);
  const start = dayStart(p.year, cfg.seasonStart);
  const endExclusive = dayStart(p.year, cfg.eve) + 24 * 3600 * 1000;
  return t >= start && t < endExclusive;
}

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** True on Nochebuena itself: the counter is replaced by "Hoy es Nochebuena." */
  isEve: boolean;
}

/** Time left until Nochebuena 00:00; on the 24th everything is zero and `isEve` is true. */
export function countdown(now: Date, cfg: SeasonConfig): Countdown {
  const p = localParts(now, cfg.timeZone);
  const left = Math.max(0, dayStart(p.year, cfg.eve) - wallMs(p));
  const total = Math.floor(left / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    isEve: left === 0,
  };
}

/** Position 0–100 of a moment on the line from the season start to Nochebuena. */
export function timelinePosition(now: Date, cfg: SeasonConfig): number {
  const p = localParts(now, cfg.timeZone);
  const start = dayStart(p.year, cfg.seasonStart);
  const end = dayStart(p.year, cfg.eve);
  return Math.min(100, Math.max(0, ((wallMs(p) - start) / (end - start)) * 100));
}

/** Position of the "Último día para pedir" mark and its label ("12 dic"). */
export function deadlineMark(now: Date, cfg: SeasonConfig): { position: number; label: string } {
  const year = localParts(now, cfg.timeZone).year;
  const start = dayStart(year, cfg.seasonStart);
  const end = dayStart(year, cfg.eve);
  const dl = dayStart(year, cfg.orderDeadline);
  const months = [
    'ene',
    'feb',
    'mar',
    'abr',
    'may',
    'jun',
    'jul',
    'ago',
    'sep',
    'oct',
    'nov',
    'dic',
  ];
  const { month, day } = mmdd(cfg.orderDeadline);
  return {
    position: Math.min(100, Math.max(0, ((dl - start) / (end - start)) * 100)),
    label: `${day} ${months[month - 1] ?? ''}`,
  };
}
