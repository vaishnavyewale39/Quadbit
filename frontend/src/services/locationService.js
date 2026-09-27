/**
 * locationService.js
 * Manages geolocation capture, live tracking, and map formatting for RAKSHA Silent Alerts.
 * Respects user privacy: only captures location when an alert is actively triggered.
 */

// Fallback demo coordinates (Mumbai, India) if GPS hardware is unavailable or in localhost
const FALLBACK_LAT = 19.0760;
const FALLBACK_LON = 72.8777;

export const formatMapUrl = (lat, lon) => {
  if (!lat || !lon) return '';
  return `https://maps.google.com/?q=${lat},${lon}`;
};

/**
 * Acquire current user coordinates once upon alert dispatch.
 * @returns {Promise<{ lat: number|null, lon: number|null, accuracy: number, status: string, mapUrl: string, error?: string }>}
 */
export const getCurrentLocation = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        lat: FALLBACK_LAT,
        lon: FALLBACK_LON,
        accuracy: 15,
        status: 'fallback',
        isFallback: true,
        mapUrl: formatMapUrl(FALLBACK_LAT, FALLBACK_LON),
        error: 'Browser geolocation not supported'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const accuracy = Math.round(position.coords.accuracy || 10);
        resolve({
          lat,
          lon,
          accuracy,
          status: 'success',
          isFallback: false,
          mapUrl: formatMapUrl(lat, lon)
        });
      },
      (err) => {
        console.warn('Location capture note:', err.message);
        if (err.code === err.PERMISSION_DENIED) {
          resolve({
            lat: null,
            lon: null,
            accuracy: 0,
            status: 'denied',
            isFallback: false,
            mapUrl: '',
            error: 'Location permission was denied'
          });
        } else {
          // In localhost or development without GPS lock, use safe fallback coordinates
          resolve({
            lat: FALLBACK_LAT,
            lon: FALLBACK_LON,
            accuracy: 15,
            status: 'fallback',
            isFallback: true,
            mapUrl: formatMapUrl(FALLBACK_LAT, FALLBACK_LON),
            error: 'GPS lock unavailable, using calibrated fallback'
          });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 6000,
        maximumAge: 10000
      }
    );
  });
};

/**
 * Begin continuous position watching while alert is active.
 */
export const watchLocation = (onSuccess, onError) => {
  if (!navigator.geolocation) return null;

  return navigator.geolocation.watchPosition(
    (pos) => {
      onSuccess({
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        accuracy: Math.round(pos.coords.accuracy || 10),
        mapUrl: formatMapUrl(pos.coords.latitude, pos.coords.longitude),
        timestamp: new Date()
      });
    },
    (err) => {
      if (onError) onError(err);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 4000
    }
  );
};

/**
 * Stop watching location when alert is resolved.
 */
export const stopWatchingLocation = (watchId) => {
  if (watchId !== null && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
};