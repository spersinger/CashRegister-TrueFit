import { useState, useEffect, useCallback } from 'react';

interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationData extends Coordinates {
  countryCode: string | null;
  countryName: string | null;
}

const STORAGE_KEY = 'user-location-data';

function useGeolocation() {
  const [location, setLocation] = useState<LocationData | null>(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    return cached ? JSON.parse(cached) : null;
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [permissionState, setPermissionState] = useState<PermissionState | null>(null);

  const fetchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await res.json();

          const result: LocationData = {
            latitude,
            longitude,
            countryCode: data.countryCode ?? null,
            countryName: data.countryName ?? null,
          };

          setLocation(result);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
        } catch {
          const result: LocationData = {
            latitude,
            longitude,
            countryCode: null,
            countryName: null,
          };
          setLocation(result);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
        } finally {
          setLoading(false);
        }
      },
      (err: GeolocationPositionError) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    // Already have cached data — nothing to do on load
    if (location) return;

    if (!navigator.permissions) {
      // Permissions API not supported (e.g. Safari) — fall back to
      // calling getCurrentPosition directly, which triggers the browser prompt
      fetchLocation();
      return;
    }

    navigator.permissions.query({ name: 'geolocation' }).then((status) => {
      setPermissionState(status.state);

      // If permission was already granted previously, fetch immediately
      if (status.state === 'granted') {
        fetchLocation();
      }

      // Watch for the user responding to the permission prompt
      status.onchange = () => {
        setPermissionState(status.state);
        if (status.state === 'granted') {
          fetchLocation();
        }
      };
    });
  }, [location, fetchLocation]);

  return { location, error, loading, permissionState, requestLocation: fetchLocation };
}

export default useGeolocation;
