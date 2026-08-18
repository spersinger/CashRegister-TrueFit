import { CURRENCY_DENOMINATIONS } from "../types/currency.ts";

export function getSupportedCurrencies(): string[] {
  return Object.keys(CURRENCY_DENOMINATIONS) as string[];
}
