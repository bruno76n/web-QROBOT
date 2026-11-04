/** Prices are stored in cents; the site shows whole pesos like "$1,250". */
export function formatMoney(cents: number): string {
  const pesos = cents / 100;
  const whole = Number.isInteger(pesos);
  return (
    '$' +
    pesos.toLocaleString('en-US', {
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: 2,
    })
  );
}

/**
 * Reads what a person types in the price field ("50", "1,250", "$1250.50") and returns cents,
 * or null when it is empty or not a valid amount.
 */
export function parsePesos(input: string): number | null {
  const cleaned = input.replace(/[\s$,]/g, '');
  if (cleaned === '' || !/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  return Math.round(Number(cleaned) * 100);
}

/** Cents → the plain number shown inside the price field ("1250", "1250.5"). */
export function centsToInput(cents: number | null): string {
  if (cents === null) return '';
  const pesos = cents / 100;
  return Number.isInteger(pesos) ? String(pesos) : pesos.toFixed(2);
}
