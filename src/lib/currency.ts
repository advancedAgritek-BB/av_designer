/**
 * Currency Conversion Utilities
 *
 * Handles conversion between cents (database storage) and dollars (application display).
 * All monetary values are stored as integers (cents) in the database to avoid
 * floating-point precision issues.
 */

/**
 * Convert cents (integer) to dollars (number)
 * @example centsToDollars(1999) // returns 19.99
 */
export function centsToDollars(cents: number): number {
  return cents / 100;
}

/**
 * Convert dollars (number) to cents (integer)
 * Rounds to nearest cent to handle floating point precision
 * @example dollarsToCents(19.99) // returns 1999
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Format cents as currency string
 * @example formatCents(1999) // returns "$19.99"
 */
export function formatCents(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

/**
 * Format dollars as currency string
 * @example formatDollars(19.99) // returns "$19.99"
 */
export function formatDollars(dollars: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(dollars);
}

/**
 * Parse a currency string to cents
 * Handles various formats: "$19.99", "19.99", "$1,234.56"
 * @example parseToCents("$19.99") // returns 1999
 */
export function parseToCents(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const dollars = parseFloat(cleaned);
  return isNaN(dollars) ? 0 : dollarsToCents(dollars);
}

/**
 * Parse a currency string to dollars
 * @example parseToDollars("$19.99") // returns 19.99
 */
export function parseToDollars(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const dollars = parseFloat(cleaned);
  return isNaN(dollars) ? 0 : dollars;
}
