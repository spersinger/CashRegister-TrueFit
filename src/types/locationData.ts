interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationData extends Coordinates {
  countryCode: string | null;
  countryName: string | null;
}
