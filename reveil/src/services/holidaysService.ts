const cache = new Map<number, Record<string, string>>();

export async function fetchFrenchHolidays(year: number): Promise<Record<string, string>> {
  if (cache.has(year)) return cache.get(year)!;

  const res = await fetch(`https://calendrier.api.gouv.fr/jours-feries/metropole/${year}.json`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error('Calendrier férié indisponible');

  const data = (await res.json()) as Record<string, string>;
  cache.set(year, data);
  return data;
}

export function getHolidayForDate(date: Date, holidays: Record<string, string>): { isHoliday: boolean; name?: string } {
  const key = formatLocalDateKey(date);
  const name = holidays[key];
  return name ? { isHoliday: true, name } : { isHoliday: false };
}

function formatLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isBridgeDay(date: Date, holidays: Record<string, string>): boolean {
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = formatLocalDateKey(tomorrow);
  const day = date.getDay();
  return day === 5 && Boolean(holidays[tomorrowKey]);
}
