'use client';

import { useEffect, useState } from 'react';
import type { Preferences, WakeContext, WeatherData } from '@/types';
import { fetchFrenchHolidays, getHolidayForDate, isBridgeDay } from '@/services/holidaysService';
import { buildWakeMessage, weatherDisplay } from '@/services/messageBuilder';
import { getSchoolVacationContext, schoolVacationLabel } from '@/services/schoolVacationsService';
import { fetchWeather } from '@/services/weatherService';
import type { SchoolVacationInfo } from '@/types';

async function fetchSchoolVacationForClient(
  prefs: Preferences,
  now: Date
): Promise<SchoolVacationInfo | null> {
  const params = new URLSearchParams({
    city: prefs.cityName,
    zone: prefs.schoolZone,
    date: now.toISOString(),
  });
  const res = await fetch(`/api/school-vacations?${params.toString()}`);
  if (!res.ok) return null;
  const data = (await res.json()) as { status?: SchoolVacationInfo };
  return data.status ?? null;
}

async function buildContext(prefs: Preferences, now: Date): Promise<WakeContext> {
  const [weather, holidays, schoolVacation] = await Promise.all([
    fetchWeather(prefs.latitude, prefs.longitude).catch(() => null),
    fetchFrenchHolidays(now.getFullYear()).catch(() => ({})),
    fetchSchoolVacationForClient(prefs, now).catch(() => null),
  ]);

  const { isHoliday, name } = getHolidayForDate(now, holidays);
  const isBridge = isBridgeDay(now, holidays);
  const message = prefs.messagesEnabled
    ? buildWakeMessage({
        date: now,
        weather,
        isHoliday,
        holidayName: name,
        isBridge,
        tone: prefs.tone,
        schoolVacation,
      })
    : 'Bonjour !';

  const display = weatherDisplay(weather);

  return {
    date: now,
    weather,
    isHoliday,
    holidayName: name,
    dayOfWeek: now.getDay(),
    message,
    weatherLabel: display.label,
    weatherEmoji: display.emoji,
    schoolVacation,
    schoolVacationLabel: schoolVacationLabel(schoolVacation),
  };
}

export function useWakeContext(prefs: Preferences, enabled = true) {
  const [context, setContext] = useState<WakeContext | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const now = new Date();
      try {
        const ctx = await buildContext(prefs, now);
        if (!cancelled) setContext(ctx);
      } catch {
        if (!cancelled) {
          setContext({
            date: now,
            weather: null,
            isHoliday: false,
            dayOfWeek: now.getDay(),
            message: prefs.messagesEnabled ? 'Bonjour !' : 'Bonjour !',
            weatherLabel: 'Météo indisponible',
            weatherEmoji: '🌡️',
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    const interval = setInterval(load, 30 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [prefs.latitude, prefs.longitude, prefs.cityName, prefs.schoolZone, prefs.messagesEnabled, prefs.tone, enabled]);

  const refreshForWake = async (): Promise<WakeContext | null> => {
    const now = new Date();
    try {
      const ctx = await buildContext(prefs, now);
      setContext(ctx);
      return ctx;
    } catch {
      return context;
    }
  };

  return { context, loading, refreshForWake };
}
