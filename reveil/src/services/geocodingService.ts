export interface GeocodedPlace {
  latitude: number;
  longitude: number;
  name: string;
  admin1?: string;
}

interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country_code: string;
  admin1?: string;
  admin2?: string;
  admin4?: string;
  population?: number;
}

interface BanFeature {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    city?: string;
    municipality?: string;
    type?: string;
    context?: string;
  };
}

function normalizeName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ');
}

/** Retire le suffixe « (Île-de-France) » ajouté par formatPlaceLabel */
export function sanitizeCityQuery(query: string): string {
  return query.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

export function isCustomCityName(cityName: string): boolean {
  const normalized = sanitizeCityQuery(cityName).toLowerCase();
  return normalized.length >= 2 && normalized !== 'paris' && normalized !== 'ma position';
}

export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function searchVariants(query: string): string[] {
  const base = sanitizeCityQuery(query);
  if (!base) return [];

  const variants = new Set<string>([base]);

  if (base.includes('-')) {
    for (const part of base.split('-').map((p) => p.trim()).filter(Boolean)) {
      variants.add(part);
    }
  }

  const withoutArticle = base.replace(/^(le|la|les|l')\s+/i, '').trim();
  if (withoutArticle && withoutArticle !== base) variants.add(withoutArticle);

  return [...variants];
}

function scoreOpenMeteoResult(result: GeocodingResult, wanted: string): number {
  const name = normalizeName(result.name);
  let score = 0;

  if (name === wanted) score += 100;
  else if (name.startsWith(wanted) || wanted.startsWith(name)) score += 60;
  else if (wanted.includes(name) || name.includes(wanted)) score += 40;

  if (result.admin4 && normalizeName(result.admin4).includes(wanted)) score += 80;
  if (result.admin4 && normalizeName(wanted).includes(normalizeName(result.admin4))) score += 80;

  if (result.population) score += Math.min(20, Math.log10(result.population + 1) * 4);

  return score;
}

async function geocodeCityBan(query: string): Promise<GeocodedPlace | null> {
  const trimmed = sanitizeCityQuery(query);
  if (trimmed.length < 2) return null;

  for (const variant of searchVariants(trimmed)) {
    const url = new URL('https://api-adresse.data.gouv.fr/search/');
    url.searchParams.set('q', variant);
    url.searchParams.set('limit', '5');
    url.searchParams.set('type', 'municipality');

    const res = await fetch(url.toString());
    if (!res.ok) continue;

    const data = (await res.json()) as { features?: BanFeature[] };
    const features = data.features ?? [];
    if (!features.length) continue;

    const wanted = normalizeName(trimmed);
    const match =
      features.find((f) => {
        const label = normalizeName(f.properties.municipality ?? f.properties.city ?? f.properties.name ?? '');
        return label === wanted || wanted.includes(label) || label.includes(wanted);
      }) ?? features[0];

    const [lon, lat] = match.geometry.coordinates;
    const name = match.properties.municipality ?? match.properties.city ?? match.properties.name ?? trimmed;
    const contextParts = (match.properties.context ?? '')
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    const admin1 = contextParts.length >= 3 ? contextParts[2] : contextParts.at(-1);

    return { latitude: lat, longitude: lon, name, admin1 };
  }

  return null;
}

async function geocodeCityOpenMeteo(query: string): Promise<GeocodedPlace | null> {
  const trimmed = sanitizeCityQuery(query);
  if (trimmed.length < 2) return null;

  const wanted = normalizeName(trimmed);
  let best: { result: GeocodingResult; score: number } | null = null;

  for (const variant of searchVariants(trimmed)) {
    const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
    url.searchParams.set('name', variant);
    url.searchParams.set('count', '15');
    url.searchParams.set('language', 'fr');
    url.searchParams.set('countryCode', 'FR');

    const res = await fetch(url.toString());
    if (!res.ok) continue;

    const data = (await res.json()) as { results?: GeocodingResult[] };
    const results = data.results?.filter((r) => r.country_code === 'FR') ?? [];
    if (!results.length) continue;

    for (const result of results) {
      const score = scoreOpenMeteoResult(result, wanted);
      if (!best || score > best.score) best = { result, score };
    }

    if (best && best.score >= 80) break;
  }

  if (!best || best.score < 20) return null;

  const pick = best.result;
  return {
    latitude: pick.latitude,
    longitude: pick.longitude,
    name: pick.admin4 && normalizeName(pick.admin4).includes(wanted) ? pick.admin4 : pick.name,
    admin1: pick.admin2 ?? pick.admin1,
  };
}

/** Recherche une ville en France (API Adresse data.gouv.fr, puis Open-Meteo) */
export async function geocodeCity(query: string): Promise<GeocodedPlace | null> {
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch(`/api/geocode?city=${encodeURIComponent(query)}`, { cache: 'no-store' });
      if (res.ok) return (await res.json()) as GeocodedPlace;
    } catch {
      /* repli direct ci-dessous */
    }
  }

  const ban = await geocodeCityBan(query);
  if (ban) return ban;
  return geocodeCityOpenMeteo(query);
}

export function formatPlaceLabel(place: GeocodedPlace): string {
  return place.admin1 ? `${place.name} (${place.admin1})` : place.name;
}
