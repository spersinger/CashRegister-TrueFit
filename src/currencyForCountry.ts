const EUR_COUNTRIES = new Set([
  "AT", "BE", "HR", "CY", "EE", "FI", "FR", "DE", "GR", "IE",
  "IT", "LV", "LT", "LU", "MT", "NL", "PT", "SK", "SI", "ES",
]);

const GBP_COUNTRIES = new Set(["GB"]);

const USD_COUNTRIES = new Set(["US"]);

type Currency = "USD" | "EUR" | "GBP";

export function currencyForCountry(countryCode: string | null): Currency {
  if (!countryCode) return "USD";

  if (GBP_COUNTRIES.has(countryCode)) return "GBP";
  if (EUR_COUNTRIES.has(countryCode)) return "EUR";
  if (USD_COUNTRIES.has(countryCode)) return "USD";

  return "USD"; // fallback for anything else (JP, IN, CA, etc.)
}
