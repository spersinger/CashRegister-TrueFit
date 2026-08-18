import { CURRENCY_DENOMINATIONS } from "../types/currency.ts";

/** Set of currency codes present in CURRENCY_DENOMINATIONS. Used for config validation. */
export const SUPPORTED_CURRENCIES = new Set(Object.keys(CURRENCY_DENOMINATIONS));
