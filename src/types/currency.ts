import currencyData from "../currencyDenominations.json";

export type Denomination = { name: string; value: number };

// Denominations are in minor units (cents/pence), largest first.
export const CURRENCY_DENOMINATIONS: Record<string, Denomination[]> = currencyData as Record<string, Denomination[]>;
