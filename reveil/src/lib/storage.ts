import type { Alarm, Preferences, SnoozeState } from '@/types';
import { DEFAULT_PREFERENCES } from '@/types';
import { normalizeAlarm } from '@/lib/recurrence';

const LEGACY_ALARMS_KEY = 'reveil-alarms';
const LEGACY_PREFS_KEY = 'reveil-preferences';
const LEGACY_SNOOZE_KEY = 'reveil-snooze';

function alarmsKey(userId: string): string {
  return `reveil-alarms-${userId}`;
}

function prefsKey(userId: string): string {
  return `reveil-preferences-${userId}`;
}

function snoozeKey(userId: string): string {
  return `reveil-snooze-${userId}`;
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function migrateLegacyData(userId: string): void {
  if (typeof window === 'undefined') return;
  const uid = alarmsKey(userId);
  if (localStorage.getItem(uid)) return;

  const legacyAlarms = localStorage.getItem(LEGACY_ALARMS_KEY);
  const legacyPrefs = localStorage.getItem(LEGACY_PREFS_KEY);
  const legacySnooze = localStorage.getItem(LEGACY_SNOOZE_KEY);

  if (legacyAlarms) {
    localStorage.setItem(uid, legacyAlarms);
    localStorage.removeItem(LEGACY_ALARMS_KEY);
  }
  if (legacyPrefs) {
    localStorage.setItem(prefsKey(userId), legacyPrefs);
    localStorage.removeItem(LEGACY_PREFS_KEY);
  }
  if (legacySnooze) {
    localStorage.setItem(snoozeKey(userId), legacySnooze);
    localStorage.removeItem(LEGACY_SNOOZE_KEY);
  }
}

export function loadAlarms(userId: string): Alarm[] {
  if (typeof window === 'undefined') return [];
  migrateLegacyData(userId);
  const raw = safeParse<Record<string, unknown>[]>(localStorage.getItem(alarmsKey(userId)), []);
  return raw.map((item) => normalizeAlarm(item));
}

export function saveAlarms(userId: string, alarms: Alarm[]): void {
  localStorage.setItem(alarmsKey(userId), JSON.stringify(alarms));
}

export function loadPreferences(userId: string): Preferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  migrateLegacyData(userId);
  return {
    ...DEFAULT_PREFERENCES,
    ...safeParse<Partial<Preferences>>(localStorage.getItem(prefsKey(userId)), {}),
  };
}

export function savePreferences(userId: string, prefs: Preferences): void {
  localStorage.setItem(prefsKey(userId), JSON.stringify(prefs));
}

export function loadSnooze(userId: string): SnoozeState | null {
  if (typeof window === 'undefined') return null;
  migrateLegacyData(userId);
  return safeParse<SnoozeState | null>(localStorage.getItem(snoozeKey(userId)), null);
}

export function saveSnooze(userId: string, state: SnoozeState | null): void {
  if (state) {
    localStorage.setItem(snoozeKey(userId), JSON.stringify(state));
  } else {
    localStorage.removeItem(snoozeKey(userId));
  }
}

const firedAlarmsKey = (userId: string) => `reveil-fired-${userId}`;

export function markAlarmFired(userId: string, fireKey: string): void {
  const today = new Date().toISOString().slice(0, 10);
  const store = safeParse<Record<string, string>>(localStorage.getItem(firedAlarmsKey(userId)), {});
  const cleaned: Record<string, string> = {};
  for (const [key, date] of Object.entries(store)) {
    if (date === today) cleaned[key] = date;
  }
  cleaned[fireKey] = today;
  localStorage.setItem(firedAlarmsKey(userId), JSON.stringify(cleaned));
}

export function hasAlarmFired(userId: string, fireKey: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  const store = safeParse<Record<string, string>>(localStorage.getItem(firedAlarmsKey(userId)), {});
  return store[fireKey] === today;
}

export function createAlarmId(): string {
  return `alarm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
