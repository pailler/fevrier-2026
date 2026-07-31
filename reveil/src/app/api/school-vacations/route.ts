import { NextResponse } from 'next/server';
import {
  fetchSchoolVacationPeriods,
  getSchoolVacationStatus,
  resolveSchoolZone,
} from '@/services/schoolVacationsService';
import type { SchoolZone } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') ?? 'Paris';
  const zoneParam = (searchParams.get('zone') ?? 'auto') as 'auto' | SchoolZone;
  const dateParam = searchParams.get('date');
  const date = dateParam ? new Date(dateParam) : new Date();

  try {
    const zone = resolveSchoolZone(city, zoneParam);
    const periods = await fetchSchoolVacationPeriods(zone, date);
    const status = getSchoolVacationStatus(date, zone, periods);

    return NextResponse.json({ zone, periods, status });
  } catch {
    return NextResponse.json({ error: 'Vacances scolaires indisponibles' }, { status: 503 });
  }
}
