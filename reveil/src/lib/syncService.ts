import type { Alarm, Preferences } from '@/types';
import { DEFAULT_PREFERENCES, isDefaultCoords } from '@/types';
import { normalizeAlarm } from '@/lib/recurrence';

export interface ReveilUserData {
  alarms: Alarm[];
  preferences: Preferences;
  updatedAt?: string;
}

export interface SyncResult<T> {
  ok: boolean;
  data: T | null;
  error?: string;
}

const fetchCache = new Map<string, Promise<SyncResult<ReveilUserData>>>();

export function invalidateUserDataCache(token?: string): void {
  if (token) fetchCache.delete(token);
  else fetchCache.clear();
}

function hasMeaningfulPreferences(prefs: Partial<Preferences> | undefined): boolean {
  if (!prefs || typeof prefs !== 'object') return false;
  if (prefs.cityName && prefs.cityName !== DEFAULT_PREFERENCES.cityName && prefs.cityName !== 'Ma position') {
    return true;
  }
  if (
    typeof prefs.latitude === 'number' &&
    typeof prefs.longitude === 'number' &&
    !isDefaultCoords(prefs.latitude, prefs.longitude)
  ) {
    return true;
  }
  return Object.keys(prefs).some((key) => {
    const k = key as keyof Preferences;
    return prefs[k] !== undefined && prefs[k] !== DEFAULT_PREFERENCES[k];
  });
}

function hasRemotePayload(data: {
  alarms?: unknown[];
  preferences?: Partial<Preferences>;
  updatedAt?: string;
}): boolean {
  if (data.updatedAt) return true;
  if (Array.isArray(data.alarms) && data.alarms.length > 0) return true;
  return hasMeaningfulPreferences(data.preferences);
}

export async function fetchUserData(token: string): Promise<SyncResult<ReveilUserData>> {
  const cached = fetchCache.get(token);
  if (cached) return cached;

  const promise = (async (): Promise<SyncResult<ReveilUserData>> => {
    try {
      const res = await fetch('/api/sync', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        return { ok: false, data: null, error: body.error ?? `HTTP ${res.status}` };
      }

      const data = (await res.json()) as {
        alarms?: Record<string, unknown>[];
        preferences?: Partial<Preferences>;
        updatedAt?: string;
      };

      if (!hasRemotePayload(data)) {
        return { ok: true, data: null };
      }

      return {
        ok: true,
        data: {
          alarms: Array.isArray(data.alarms) ? data.alarms.map((a) => normalizeAlarm(a)) : [],
          preferences: { ...DEFAULT_PREFERENCES, ...(data.preferences ?? {}) },
          updatedAt: data.updatedAt,
        },
      };
    } catch (err) {
      return {
        ok: false,
        data: null,
        error: err instanceof Error ? err.message : 'Sync indisponible',
      };
    }
  })();

  fetchCache.set(token, promise);
  return promise;
}

export async function pushUserData(
  token: string,
  payload: { alarms: Alarm[]; preferences: Preferences }
): Promise<SyncResult<true>> {
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      return { ok: false, data: null, error: body.error ?? `HTTP ${res.status}` };
    }

    invalidateUserDataCache(token);
    return { ok: true, data: true };
  } catch (err) {
    return {
      ok: false,
      data: null,
      error: err instanceof Error ? err.message : 'Sync indisponible',
    };
  }
}
