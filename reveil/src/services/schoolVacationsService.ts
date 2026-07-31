import type { MessageTone, SchoolVacationInfo, SchoolZone } from '@/types';

/** Calendrier de secours (source : data.education.gouv.fr, année 2025-2026) */
const FALLBACK_PERIODS: Record<SchoolZone, Array<{ name: string; start: string; end: string }>> = {
  A: [
    { name: 'Vacances de la Toussaint', start: '2025-10-18', end: '2025-11-03' },
    { name: 'Vacances de Noël', start: '2025-12-20', end: '2026-01-05' },
    { name: "Vacances d'Hiver", start: '2026-02-07', end: '2026-02-23' },
    { name: 'Vacances de Printemps', start: '2026-04-11', end: '2026-04-27' },
    { name: "Vacances d'Été", start: '2026-07-04', end: '2026-09-01' },
  ],
  B: [
    { name: 'Vacances de la Toussaint', start: '2025-10-18', end: '2025-11-03' },
    { name: 'Vacances de Noël', start: '2025-12-20', end: '2026-01-05' },
    { name: "Vacances d'Hiver", start: '2026-02-21', end: '2026-03-09' },
    { name: 'Vacances de Printemps', start: '2026-04-18', end: '2026-05-04' },
    { name: "Vacances d'Été", start: '2026-07-04', end: '2026-09-01' },
  ],
  C: [
    { name: 'Vacances de la Toussaint', start: '2025-10-18', end: '2025-11-03' },
    { name: 'Vacances de Noël', start: '2025-12-20', end: '2026-01-05' },
    { name: "Vacances d'Hiver", start: '2026-02-14', end: '2026-03-09' },
    { name: 'Vacances de Printemps', start: '2026-04-18', end: '2026-05-04' },
    { name: "Vacances d'Été", start: '2026-07-04', end: '2026-09-01' },
  ],
};

const ZONE_A_CITIES = [
  'lyon', 'grenoble', 'bordeaux', 'besancon', 'besançon', 'dijon', 'clermont', 'limoges', 'poitiers',
];
const ZONE_B_CITIES = [
  'lille', 'nantes', 'rennes', 'strasbourg', 'nancy', 'metz', 'marseille', 'aix', 'nice', 'amiens',
  'caen', 'reims', 'orleans', 'orléans', 'tours', 'rouen', 'brest',
];
const ZONE_C_CITIES = ['paris', 'versailles', 'creteil', 'créteil', 'montpellier', 'toulouse'];

export interface SchoolPeriod {
  name: string;
  start: string;
  end: string;
}

interface ApiRecord {
  description: string;
  start_date: string;
  end_date: string;
  zones: string;
  population: string;
  annee_scolaire: string;
}

const cache = new Map<string, SchoolPeriod[]>();

function normalizeCity(city: string): string {
  return city
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

export function inferSchoolZone(cityName: string): SchoolZone {
  const n = normalizeCity(cityName);
  if (ZONE_C_CITIES.some((c) => n.includes(c))) return 'C';
  if (ZONE_A_CITIES.some((c) => n.includes(c))) return 'A';
  if (ZONE_B_CITIES.some((c) => n.includes(c))) return 'B';
  return 'C';
}

export function resolveSchoolZone(cityName: string, pref: 'auto' | SchoolZone): SchoolZone {
  if (pref !== 'auto') return pref;
  return inferSchoolZone(cityName);
}

export function getSchoolYearLabel(date: Date): string {
  const paris = getParisParts(date);
  const startYear = paris.month >= 9 ? paris.year : paris.year - 1;
  return `${startYear}-${startYear + 1}`;
}

function getParisParts(date: Date): { year: number; month: number; day: number; key: string } {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const key = fmt.format(date);
  const [y, m, d] = key.split('-').map(Number);
  return { year: y, month: m, day: d, key };
}

function isoToParisKey(iso: string): string {
  return getParisParts(new Date(iso)).key;
}

function daysBetween(fromKey: string, toKey: string): number {
  const a = new Date(`${fromKey}T12:00:00`);
  const b = new Date(`${toKey}T12:00:00`);
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function dedupePeriods(records: ApiRecord[]): SchoolPeriod[] {
  const seen = new Set<string>();
  const periods: SchoolPeriod[] = [];

  for (const r of records) {
    if (!r.description.includes('Vacances')) continue;
    if (r.population && r.population !== '-' && r.population !== 'Élèves' && r.population !== 'Eleves') {
      continue;
    }
    const start = isoToParisKey(r.start_date);
    const end = isoToParisKey(r.end_date);
    const key = `${r.description}|${start}|${end}`;
    if (seen.has(key)) continue;
    seen.add(key);
    periods.push({ name: r.description, start, end });
  }

  return periods.sort((a, b) => a.start.localeCompare(b.start));
}

export async function fetchSchoolVacationPeriods(zone: SchoolZone, date = new Date()): Promise<SchoolPeriod[]> {
  const schoolYear = getSchoolYearLabel(date);
  const cacheKey = `${zone}-${schoolYear}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  try {
    const zoneLabel = encodeURIComponent(`Zone ${zone}`);
    const yearLabel = encodeURIComponent(schoolYear);
    const url =
      `https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-calendrier-scolaire/records` +
      `?limit=100&where=annee_scolaire="${yearLabel}" AND zones="${zoneLabel}" AND search(description,"Vacances")`;

    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) throw new Error('API vacances scolaires indisponible');

    const data = (await res.json()) as { results: ApiRecord[] };
    const periods = dedupePeriods(data.results ?? []);
    if (periods.length > 0) {
      cache.set(cacheKey, periods);
      return periods;
    }
  } catch {
    /* fallback ci-dessous */
  }

  const fallback = FALLBACK_PERIODS[zone];
  cache.set(cacheKey, fallback);
  return fallback;
}

export function getSchoolVacationStatus(date: Date, zone: SchoolZone, periods: SchoolPeriod[]): SchoolVacationInfo {
  const today = getParisParts(date).key;

  for (const period of periods) {
    if (today >= period.start && today <= period.end) {
      const daysRemaining = daysBetween(today, period.end);
      return {
        isVacation: true,
        periodName: period.name,
        zone,
        daysRemaining,
        isRentreeSoon: daysRemaining <= 2,
        isRentreeToday: false,
      };
    }
  }

  for (const period of periods) {
    const rentreeKey = addDays(period.end, 1);
    if (today === rentreeKey) {
      return {
        isVacation: false,
        periodName: period.name,
        zone,
        isRentreeToday: true,
        isRentreeSoon: false,
      };
    }
  }

  return { isVacation: false, zone };
}

function addDays(dateKey: string, days: number): string {
  const d = new Date(`${dateKey}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function getSchoolVacationContext(
  date: Date,
  cityName: string,
  zonePref: 'auto' | SchoolZone
): Promise<SchoolVacationInfo | null> {
  const zone = resolveSchoolZone(cityName, zonePref);
  const periods = await fetchSchoolVacationPeriods(zone, date);
  return getSchoolVacationStatus(date, zone, periods);
}

export function schoolVacationLabel(info: SchoolVacationInfo | null | undefined): string | null {
  if (!info) return null;
  if (info.isVacation && info.periodName) {
    return `${info.periodName} · zone ${info.zone}`;
  }
  if (info.isRentreeToday) return `Rentrée · zone ${info.zone}`;
  return null;
}
