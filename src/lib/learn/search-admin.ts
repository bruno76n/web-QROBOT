/** Formatting for the search block of the panel's «Aprende» tab (docs/22 §10). Pure. */

/**
 * Date and time of the last index sync as the panel shows it, read in `timeZone`:
 * «14 de noviembre de 2026, 10:32» (24-hour clock). An unreadable date gives `null`.
 */
export function formatSyncedAt(iso: string, timeZone: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat('es-MX', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '';
  return `${get('day')} de ${get('month')} de ${get('year')}, ${get('hour')}:${get('minute')}`;
}
