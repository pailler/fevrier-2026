import type { HourlyForecast, WeatherCondition } from '@/types';

/** WMO weather codes → condition simplifiée */
export function wmoToCondition(code: number): WeatherCondition {
  if (code === 0) return 'clear';
  if (code === 1 || code === 2) return 'partly_cloudy';
  if (code === 3) return 'cloudy';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 51 && code <= 57) return 'drizzle';
  if (code >= 61 && code <= 67) return 'rain';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 80 && code <= 82) return 'rain';
  if (code >= 85 && code <= 86) return 'snow';
  if (code >= 95) return 'thunderstorm';
  return 'unknown';
}

export const WEATHER_EMOJI: Record<WeatherCondition, string> = {
  clear: '☀️',
  partly_cloudy: '⛅',
  cloudy: '☁️',
  fog: '🌫️',
  drizzle: '🌦️',
  rain: '🌧️',
  snow: '❄️',
  thunderstorm: '⛈️',
  unknown: '🌡️',
};

export const WEATHER_LABELS: Record<WeatherCondition, string> = {
  clear: 'Ensoleillé',
  partly_cloudy: 'Partiellement nuageux',
  cloudy: 'Nuageux',
  fog: 'Brouillard',
  drizzle: 'Bruine',
  rain: 'Pluie',
  snow: 'Neige',
  thunderstorm: 'Orage',
  unknown: 'Variable',
};

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    weather_code: number;
    precipitation: number;
    wind_speed_10m: number;
  };
  hourly?: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    precipitation_probability?: number[];
  };
  daily?: {
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

function localDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function buildTodayHourly(data: OpenMeteoResponse, now: Date): HourlyForecast[] {
  const hourly = data.hourly;
  if (!hourly?.time?.length) return [];

  const todayKey = localDateKey(now);
  const currentHour = now.getHours();
  const slots: HourlyForecast[] = [];

  for (let i = 0; i < hourly.time.length; i++) {
    const time = hourly.time[i];
    if (!time.startsWith(todayKey)) continue;

    const hour = Number(time.slice(11, 13));
    if (Number.isNaN(hour) || hour < currentHour) continue;

    slots.push({
      time,
      hourLabel: `${hour}h`,
      temp: Math.round(hourly.temperature_2m[i]),
      condition: wmoToCondition(hourly.weather_code[i]),
      precipProbability: Math.round(hourly.precipitation_probability?.[i] ?? 0),
      isNow: hour === currentHour,
    });
  }

  return slots;
}

export async function fetchWeather(lat: number, lon: number): Promise<{
  temp: number;
  feelsLike: number;
  condition: WeatherCondition;
  precipitation: number;
  windSpeed: number;
  todayMin: number;
  todayMax: number;
  hourly: HourlyForecast[];
}> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set(
    'current',
    'temperature_2m,apparent_temperature,weather_code,precipitation,wind_speed_10m'
  );
  url.searchParams.set('hourly', 'temperature_2m,weather_code,precipitation_probability');
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min');
  url.searchParams.set('forecast_days', '1');
  url.searchParams.set('temperature_unit', 'celsius');
  url.searchParams.set('wind_speed_unit', 'kmh');
  url.searchParams.set('timezone', 'Europe/Paris');

  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) throw new Error('Météo indisponible');

  const data = (await res.json()) as OpenMeteoResponse;
  const c = data.current;
  const now = new Date();

  const todayMin = Math.round(data.daily?.temperature_2m_min?.[0] ?? c.temperature_2m);
  const todayMax = Math.round(data.daily?.temperature_2m_max?.[0] ?? c.temperature_2m);

  return {
    temp: Math.round(c.temperature_2m),
    feelsLike: Math.round(c.apparent_temperature),
    condition: wmoToCondition(c.weather_code),
    precipitation: c.precipitation,
    windSpeed: c.wind_speed_10m,
    todayMin,
    todayMax,
    hourly: buildTodayHourly(data, now),
  };
}
