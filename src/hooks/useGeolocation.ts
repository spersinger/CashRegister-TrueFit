import { useState, useEffect, useCallback } from 'react';

import type { LocationData } from '../types/locationData.ts';

const STORAGE_KEY = 'user-location-data';

// Written mostly by Claude, edits to preserve proper practice were made by spersinger
// Claude generated some duplicated code and forgot to handle unmount (Or I just wasn't specific enough, regardless)
function useGeolocation() {
  const [location, setLocation] = useState<LocationData | null>(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    try {
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
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

        let countryCode: string | null = "US";
        let countryName: string | null = "United States";

        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await res.json();
          countryCode = data.countryCode ?? null;
          countryName = data.countryName ?? null;
        } catch {
          // Reverse geocoding failed, fall back to US
        }

        const result: LocationData = { latitude, longitude, countryCode, countryName };
        setLocation(result);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
        setLoading(false);
      },
      (err: GeolocationPositionError) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    if (location) return;

    let statusRef: PermissionStatus | null = null;

    if (!navigator.permissions) {
      // queueMicrotask to not handle the permission state within useEffect potentially causing rerenders
      // Claude wrote this, I was stuck on how to handle this without refactoring
      queueMicrotask(() => {
          fetchLocation();
      });
      return;
    }

    navigator.permissions.query({ name: 'geolocation' }).then((status) => {
      statusRef = status;
      setPermissionState(status.state);
      if (status.state === 'granted') {
        fetchLocation();
      }
      status.onchange = () => {
        setPermissionState(status.state);
        if (status.state === 'granted') {
          fetchLocation();
        }
      };
    });

    return () => {
      if (statusRef) {
        statusRef.onchange = null;
      }
    };
  }, [location, fetchLocation]);

  return { location, error, loading, permissionState, requestLocation: fetchLocation };
}

export default useGeolocation;
