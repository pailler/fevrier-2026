'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Alarm } from '@/types';
import { createAlarmId, loadAlarms, loadPreferences, saveAlarms, savePreferences } from '@/lib/storage';
import { fetchUserData, pushUserData } from '@/lib/syncService';

export function useAlarms(userId: string | null, token: string | null) {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [ready, setReady] = useState(false);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleSync = useCallback(
    (nextAlarms: Alarm[]) => {
      if (!userId || !token) return;
      if (syncTimer.current) clearTimeout(syncTimer.current);
      syncTimer.current = setTimeout(() => {
        const preferences = loadPreferences(userId);
        void pushUserData(token, { alarms: nextAlarms, preferences });
      }, 800);
    },
    [userId, token]
  );

  useEffect(() => {
    if (!userId || !token) return;
    let cancelled = false;

    const load = async () => {
      const local = loadAlarms(userId);
      const remote = await fetchUserData(token);

      if (cancelled) return;

      if (remote.ok && remote.data) {
        setAlarms(remote.data.alarms);
        saveAlarms(userId, remote.data.alarms);
        savePreferences(userId, remote.data.preferences);
      } else if (local.length > 0) {
        setAlarms(local);
        void pushUserData(token, {
          alarms: local,
          preferences: loadPreferences(userId),
        });
      } else {
        setAlarms([]);
      }
      setReady(true);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [userId, token]);

  const persist = useCallback(
    (next: Alarm[]) => {
      if (!userId) return;
      setAlarms(next);
      saveAlarms(userId, next);
      scheduleSync(next);
    },
    [userId, scheduleSync]
  );

  const addAlarm = useCallback(
    (partial: Omit<Alarm, 'id'>) => {
      persist([...alarms, { ...partial, id: createAlarmId() }]);
    },
    [alarms, persist]
  );

  const updateAlarm = useCallback(
    (id: string, patch: Partial<Alarm>) => {
      persist(alarms.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    },
    [alarms, persist]
  );

  const deleteAlarm = useCallback(
    (id: string) => {
      persist(alarms.filter((a) => a.id !== id));
    },
    [alarms, persist]
  );

  const toggleAlarm = useCallback(
    (id: string) => {
      persist(alarms.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)));
    },
    [alarms, persist]
  );

  const replaceAlarms = useCallback(
    (next: Alarm[]) => {
      if (!userId) return;
      setAlarms(next);
      saveAlarms(userId, next);
    },
    [userId]
  );

  return { alarms, ready, addAlarm, updateAlarm, deleteAlarm, toggleAlarm, replaceAlarms };
}
