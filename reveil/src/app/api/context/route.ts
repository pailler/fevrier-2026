import { NextResponse } from 'next/server';
import { fetchFrenchHolidays, getHolidayForDate, isBridgeDay } from '@/services/holidaysService';
import { buildWakeMessage, weatherDisplay } from '@/services/messageBuilder';
import {
  getSchoolVacationContext,
  resolveSchoolZone,
  schoolVacationLabel,
} from '@/services/schoolVacationsService';
import { fetchWeather } from '@/services/weatherService';
import type { SchoolZone } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get('lat') ?? '48.8566');
  const lon = Number(searchParams.get('lon') ?? '2.3522');
  const city = searchParams.get('city') ?? 'Paris';
  const zoneParam = (searchParams.get('zone') ?? 'auto') as 'auto' | SchoolZone;
  const tone = (searchParams.get('tone') ?? 'casual') as 'formal' | 'casual' | 'humorous';
  const messagesEnabled = searchParams.get('messages') !== '0';

  const now = new Date();

  try {
    const [weather, holidays, schoolVacation] = await Promise.all([
      fetchWeather(lat, lon).catch(() => null),
      fetchFrenchHolidays(now.getFullYear()).catch(() => ({})),
      getSchoolVacationContext(now, city, zoneParam).catch(() => null),
    ]);

    const { isHoliday, name } = getHolidayForDate(now, holidays);
    const isBridge = isBridgeDay(now, holidays);
    const message = messagesEnabled
      ? buildWakeMessage({
          date: now,
          weather,
          isHoliday,
          holidayName: name,
          isBridge,
          tone,
          schoolVacation,
        })
      : 'Bonjour !';
    const display = weatherDisplay(weather);

    return NextResponse.json({
      weather,
      isHoliday,
      holidayName: name,
      isBridge,
      dayOfWeek: now.getDay(),
      message,
      weatherLabel: display.label,
      weatherEmoji: display.emoji,
      schoolVacation,
      schoolVacationLabel: schoolVacationLabel(schoolVacation),
      schoolZone: resolveSchoolZone(city, zoneParam),
    });
  } catch {
    return NextResponse.json({ error: 'Contexte indisponible' }, { status: 503 });
  }
}
