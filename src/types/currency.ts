import currencyData from "../currencyDenominations.json";

/** A single cash denomination (bill or coin) for a currency. */
export type Denomination = {
  /** Display name (e.g. "quarter", "50 pence"). */
  name: string;
  /** Value in minor currency units (cents, pence, etc.). */
  value: number;
};

// Denominations are in minor units (cents/pence), largest first.
/**
 * Denomination data keyed by currency code (e.g. "US", "GB", "EUR").
 * Each array is ordered largest to smallest. Values are in minor units
 * (cents/pence). Data sourced from currencyDenominations.json.
 */
export const CURRENCY_DENOMINATIONS: Record<string, Denomination[]> = currencyData as Record<string, Denomination[]>;
