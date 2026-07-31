'use client';

import { useEffect, useRef } from 'react';
import type { Alarm } from '@/types';
import { alarmMatchesDate, localDateKey } from '@/lib/recurrence';
import { hasAlarmFired, loadSnooze, markAlarmFired, saveSnooze } from '@/lib/storage';
import { showAlarmNotification } from '@/lib/alarmNotifications';
import { getNextAlarm } from '@/lib/alarmSchedulerUtils';

function parseTime(time: string): { h: number; m: number } {
  const [h, m] = time.split(':').map(Number);
  return { h: h ?? 0, m: m ?? 0 };
}

function fireKeyFor(alarm: Alarm, now: Date): string {
  const { h, m } = parseTime(alarm.time);
  return `${alarm.id}-${localDateKey(now)}-${h}-${String(m).padStart(2, '0')}`;
}

/** Alarme prévue à cette minute (toute la minute, pas seulement les 2 premières secondes). */
function alarmMatchesMinute(alarm: Alarm, now: Date): boolean {
  if (!alarmMatchesDate(alarm, now)) return false;
  const { h, m } = parseTime(alarm.time);
  return now.getHours() === h && now.getMinutes() === m;
}

/** Rattrapage si le téléphone était en veille (max 5 min après l’heure prévue). */
function alarmMatchesCatchUp(alarm: Alarm, now: Date): boolean {
  if (!alarm.enabled || !alarmMatchesDate(alarm, now)) return false;
  const { h, m } = parseTime(alarm.time);
  const scheduled = new Date(now);
  scheduled.setHours(h, m, 0, 0);
  const diffMs = now.getTime() - scheduled.getTime();
  return diffMs >= 0 && diffMs <= 5 * 60 * 1000;
}

interface SchedulerOptions {
  alarms: Alarm[];
  userId: string;
  onFire: (alarm: Alarm) => void;
}

export function useAlarmScheduler({ alarms, userId, onFire }: SchedulerOptions) {
  const firedRef = useRef<Set<string>>(new Set());
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onFireRef = useRef(onFire);
  onFireRef.current = onFire;

  useEffect(() => {
    const tryFire = (alarm: Alarm, now: Date, reason: 'tick' | 'timeout' | 'catchup') => {
      const key = fireKeyFor(alarm, now);
      if (firedRef.current.has(key) || hasAlarmFired(userId, key)) return false;

      const matches =
        reason === 'catchup' ? alarmMatchesCatchUp(alarm, now) : alarmMatchesMinute(alarm, now);
      if (!matches) return false;

      firedRef.current.add(key);
      markAlarmFired(userId, key);
      saveSnooze(userId, null);
      showAlarmNotification(alarm);
      onFireRef.current(alarm);
      return true;
    };

    const tick = (reason: 'tick' | 'catchup' = 'tick') => {
      const now = new Date();
      const minuteKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}`;

      const snooze = loadSnooze(userId);
      if (snooze && Date.now() >= snooze.until && Date.now() < snooze.until + 60_000) {
        const alarm = alarms.find((a) => a.id === snooze.alarmId);
        const key = `snooze-${snooze.alarmId}-${minuteKey}`;
        if (alarm && !firedRef.current.has(key) && !hasAlarmFired(userId, key)) {
          firedRef.current.add(key);
          markAlarmFired(userId, key);
          saveSnooze(userId, null);
          showAlarmNotification(alarm);
          onFireRef.current(alarm);
        }
        return;
      }

      if (snooze && Date.now() < snooze.until) return;

      for (const alarm of alarms) {
        if (!alarm.enabled) continue;
        if (tryFire(alarm, now, reason)) break;
      }
    };

    const scheduleExactTimeout = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      const next = getNextAlarm(alarms.filter((a) => a.enabled));
      if (!next || next.inMs <= 0) {
        timeoutRef.current = null;
        return;
      }

      const delay = Math.min(next.inMs + 50, 2_147_483_647);
      timeoutRef.current = setTimeout(() => {
        tick('tick');
        scheduleExactTimeout();
      }, delay);
    };

    tick('catchup');
    const intervalId = setInterval(() => tick('tick'), 1000);
    scheduleExactTimeout();

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        tick('catchup');
        scheduleExactTimeout();
      }
    };

    const onPageShow = () => tick('catchup');

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pageshow', onPageShow);
    window.addEventListener('focus', onPageShow);

    return () => {
      clearInterval(intervalId);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pageshow', onPageShow);
      window.removeEventListener('focus', onPageShow);
    };
  }, [alarms, userId]);
}

export { snoozeAlarm, clearSnooze, getNextAlarm, formatCountdown, isOnceAlarmExpired } from '@/lib/alarmSchedulerUtils';
