import type { Alarm, AlarmMusic, AlarmRecurrence } from '@/types';

const WEEKDAYS = [1, 2, 3, 4, 5];
const WEEKENDS = [0, 6];
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

export const RECURRENCE_LABELS: Record<AlarmRecurrence, string> = {
  once: 'Une seule fois',
  daily: 'Tous les jours',
  weekdays: 'Lun → Ven',
  weekends: 'Sam & Dim',
  custom: 'Jours choisis',
};

export function localDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function daysForRecurrence(recurrence: AlarmRecurrence, customDays: number[]): number[] {
  switch (recurrence) {
    case 'daily':
      return ALL_DAYS;
    case 'weekdays':
      return WEEKDAYS;
    case 'weekends':
      return WEEKENDS;
    case 'custom':
      return [...customDays].sort();
    case 'once':
      return [];
    default:
      return customDays;
  }
}

export function inferRecurrence(days: number[]): AlarmRecurrence {
  const sorted = [...days].sort().join(',');
  if (sorted === ALL_DAYS.join(',')) return 'daily';
  if (sorted === WEEKDAYS.join(',')) return 'weekdays';
  if (sorted === WEEKENDS.join(',')) return 'weekends';
  if (days.length === 0) return 'once';
  return 'custom';
}

export function formatRecurrenceSummary(alarm: Alarm): string {
  if (alarm.recurrence === 'once') {
    if (!alarm.onceDate) return 'Une fois (date à définir)';
    const [y, m, d] = alarm.onceDate.split('-');
    return `Une fois · ${d}/${m}/${y}`;
  }
  if (alarm.recurrence === 'daily') return 'Tous les jours';
  if (alarm.recurrence === 'weekdays') return 'Lun → Ven';
  if (alarm.recurrence === 'weekends') return 'Sam & Dim';
  const labels = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  return alarm.days.map((i) => labels[i]).join(' · ');
}

export function alarmMatchesDate(alarm: Alarm, now: Date): boolean {
  if (!alarm.enabled) return false;

  if (alarm.recurrence === 'once') {
    if (!alarm.onceDate) return false;
    return localDateKey(now) === alarm.onceDate;
  }

  const day = now.getDay();
  return alarm.days.includes(day);
}

export function defaultOnceDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return localDateKey(d);
}

const LEGACY_SOUND_TO_MUSIC: Record<string, AlarmMusic> = {
  gentle: 'serene-morning',
  classic: 'soft-piano',
  nature: 'acoustic-dawn',
};

export function normalizeAlarm(raw: Record<string, unknown>): Alarm {
  const days = Array.isArray(raw.days) ? (raw.days as number[]) : [1, 2, 3, 4, 5];
  const recurrence = (raw.recurrence as AlarmRecurrence) ?? inferRecurrence(days);
  const musicRaw = String(raw.music ?? raw.sound ?? 'serene-morning');
  const customSoundId = raw.customSoundId ? String(raw.customSoundId) : undefined;

  let music: AlarmMusic;
  if (musicRaw === 'custom') {
    music = 'custom';
  } else if (LEGACY_SOUND_TO_MUSIC[musicRaw]) {
    music = LEGACY_SOUND_TO_MUSIC[musicRaw];
  } else {
    music = musicRaw as AlarmMusic;
    if (music !== 'serene-morning' && music !== 'acoustic-dawn' && music !== 'lofi-glow' && music !== 'soft-piano' && music !== 'sunny-day') {
      music = 'serene-morning';
    }
  }

  return {
    id: String(raw.id ?? ''),
    label: String(raw.label ?? 'Réveil'),
    time: String(raw.time ?? '07:30'),
    recurrence,
    days: recurrence === 'once' ? [] : daysForRecurrence(recurrence, days),
    onceDate: raw.onceDate ? String(raw.onceDate) : recurrence === 'once' ? defaultOnceDate() : undefined,
    enabled: raw.enabled !== false,
    music,
    customSoundId: music === 'custom' ? customSoundId : undefined,
  };
}

export function shouldDisableAfterFire(alarm: Alarm): boolean {
  return alarm.recurrence === 'once';
}
