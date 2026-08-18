/** Geographic coordinates. */
interface Coordinates {
  /** North-south position in decimal degrees. */
  latitude: number;
  /** East-west position in decimal degrees. */
  longitude: number;
}

/** Resolved location from browser geolocation and reverse geocoding. */
export interface LocationData extends Coordinates {
  /** ISO 3166-1 alpha-2 country code, or null if geocoding failed. */
  countryCode: string | null;
  /** Human-readable country name, or null if geocoding failed. */
  countryName: string | null;
}
