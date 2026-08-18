import { CURRENCY_DENOMINATIONS } from "../types/currency";

const EUR_COUNTRIES = new Set([
  "AT", "BE", "HR", "CY", "EE", "FI", "FR", "DE", "GR", "IE",
  "IT", "LV", "LT", "LU", "MT", "NL", "PT", "SK", "SI", "ES",
]);

export function currencyForCountry(countryCode: string | null): string {
  // If no country code is provided, default to USD
  if (!countryCode) return "US";

  // Check if the country code is in the EUR_COUNTRIES set
  if (EUR_COUNTRIES.has(countryCode)) return "EUR";

  // Otherwise use the CURRENCY_DENOMINATIONS object to look up the currency code
  const hasCurrency = (code: string) => code in CURRENCY_DENOMINATIONS;
  if (hasCurrency(countryCode)) {
    return countryCode;
  }

  return "US"; // fallback for anything else not set in EUR_COUNTRIES or CURRENCY_DENOMINATIONS
}
