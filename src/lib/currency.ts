// Currency formatting utility for Kenyan Shillings (KES)

/**
 * Format amount in Kenyan Shillings
 * @param amount - The amount to format
 * @param includeDecimals - Whether to include decimal places (default: true)
 * @returns Formatted currency string (e.g., "KES 1,234.56")
 */
export const formatCurrency = (amount: number | string, includeDecimals = true): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]/g, '')) : amount;

  if (isNaN(numAmount)) return 'KES 0.00';

  const formatter = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  });

  return formatter.format(numAmount);
};

/**
 * Format amount in compact notation (e.g., "KES 1.2K")
 * @param amount - The amount to format
 * @returns Compact formatted currency string
 */
export const formatCurrencyCompact = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]/g, '')) : amount;

  if (isNaN(numAmount)) return 'KES 0';

  const formatter = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    notation: 'compact',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });

  return formatter.format(numAmount);
};

/**
 * Parse currency string to number
 * @param currencyString - Currency string to parse
 * @returns Numeric value
 */
export const parseCurrency = (currencyString: string): number => {
  return parseFloat(currencyString.replace(/[^0-9.-]/g, '')) || 0;
};
