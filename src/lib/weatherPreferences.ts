export const WEATHER_PREFERENCES_STORAGE_KEY = 'ninho-weather-preferences';
export const WEATHER_PREFERENCES_UPDATED_EVENT = 'weather:preferences-updated';

export type WeatherMethod = 'gps' | 'ip' | 'manual' | null;

export interface WeatherPreferences {
  consentGiven: boolean;
  useApproximateLocation: boolean;
  manualCity: string;
  method: WeatherMethod;
  coords: {
    latitude: number;
    longitude: number;
  } | null;
}

const DEFAULT_WEATHER_PREFERENCES: WeatherPreferences = {
  consentGiven: false,
  useApproximateLocation: false,
  manualCity: '',
  method: null,
  coords: null,
};

export function getWeatherPreferences(): WeatherPreferences {
  const raw = localStorage.getItem(WEATHER_PREFERENCES_STORAGE_KEY);

  if (!raw) return { ...DEFAULT_WEATHER_PREFERENCES };

  try {
    const parsed = JSON.parse(raw) as Partial<WeatherPreferences>;
    return {
      consentGiven: Boolean(parsed.consentGiven),
      useApproximateLocation: Boolean(parsed.useApproximateLocation),
      manualCity: typeof parsed.manualCity === 'string' ? parsed.manualCity : '',
      method: parsed.method === 'gps' || parsed.method === 'ip' || parsed.method === 'manual' ? parsed.method : null,
      coords:
        parsed.coords &&
        typeof parsed.coords.latitude === 'number' &&
        typeof parsed.coords.longitude === 'number'
          ? {
            latitude: parsed.coords.latitude,
            longitude: parsed.coords.longitude,
          }
          : null,
    };
  } catch {
    return { ...DEFAULT_WEATHER_PREFERENCES };
  }
}

export function saveWeatherPreferences(next: Partial<WeatherPreferences>): WeatherPreferences {
  const current = getWeatherPreferences();
  const merged: WeatherPreferences = {
    ...current,
    ...next,
    manualCity: (next.manualCity ?? current.manualCity).trim(),
    coords: typeof next.coords === 'undefined' ? current.coords : next.coords,
  };

  localStorage.setItem(WEATHER_PREFERENCES_STORAGE_KEY, JSON.stringify(merged));
  window.dispatchEvent(new CustomEvent(WEATHER_PREFERENCES_UPDATED_EVENT));

  return merged;
}
