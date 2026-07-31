export type AlarmMusic =
  | 'serene-morning'
  | 'acoustic-dawn'
  | 'lofi-glow'
  | 'soft-piano'
  | 'sunny-day'
  | 'custom';

export type AlarmRecurrence = 'once' | 'daily' | 'weekdays' | 'weekends' | 'custom';

export type MessageTone = 'formal' | 'casual' | 'humorous';
export type SchoolZone = 'A' | 'B' | 'C';

export interface Alarm {
  id: string;
  label: string;
  time: string;
  recurrence: AlarmRecurrence;
  days: number[];
  onceDate?: string;
  enabled: boolean;
  music: AlarmMusic;
  customSoundId?: string;
}

export interface CustomSound {
  id: string;
  label: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

export interface Preferences {
  cityName: string;
  latitude: number;
  longitude: number;
  messagesEnabled: boolean;
  tone: MessageTone;
  nightMode: boolean;
  wakeLockEnabled: boolean;
  schoolZone: 'auto' | SchoolZone;
  customSounds?: CustomSound[];
}

export interface SchoolVacationInfo {
  isVacation: boolean;
  periodName?: string;
  zone: SchoolZone;
  daysRemaining?: number;
  isRentreeSoon?: boolean;
  isRentreeToday?: boolean;
}

export interface HourlyForecast {
  time: string;
  hourLabel: string;
  temp: number;
  condition: WeatherCondition;
  precipProbability: number;
  isNow?: boolean;
}

export interface WeatherData {
  temp: number;
  feelsLike: number;
  condition: WeatherCondition;
  precipitation: number;
  windSpeed: number;
  todayMin: number;
  todayMax: number;
  hourly: HourlyForecast[];
}

export type WeatherCondition =
  | 'clear'
  | 'partly_cloudy'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'thunderstorm'
  | 'unknown';

export interface WakeContext {
  date: Date;
  weather: WeatherData | null;
  isHoliday: boolean;
  holidayName?: string;
  dayOfWeek: number;
  message: string;
  weatherLabel: string;
  weatherEmoji: string;
  schoolVacation?: SchoolVacationInfo | null;
  schoolVacationLabel?: string | null;
}

export interface SnoozeState {
  alarmId: string;
  until: number;
}

export const DEFAULT_PREFERENCES: Preferences = {
  cityName: 'Paris',
  latitude: 48.8566,
  longitude: 2.3522,
  messagesEnabled: true,
  tone: 'casual',
  nightMode: true,
  wakeLockEnabled: true,
  schoolZone: 'auto',
};

/** Coordonnées par défaut (Paris) — la météo suit lat/lon, pas le nom de ville seul */
export function isDefaultCoords(latitude: number, longitude: number): boolean {
  return (
    Math.abs(latitude - DEFAULT_PREFERENCES.latitude) < 0.02 &&
    Math.abs(longitude - DEFAULT_PREFERENCES.longitude) < 0.02
  );
}

export const DAY_LABELS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'] as const;
