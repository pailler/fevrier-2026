import { NextRequest, NextResponse } from 'next/server';

interface BanFeature {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    city?: string;
    municipality?: string;
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

function searchVariants(query: string): string[] {
  const base = query.replace(/\s*\([^)]*\)\s*$/, '').trim();
  if (!base) return [];

  const variants = new Set<string>([base]);
  if (base.includes('-')) {
    for (const part of base.split('-').map((p) => p.trim()).filter(Boolean)) {
      variants.add(part);
    }
  }
  return [...variants];
}

async function geocodeViaBan(query: string) {
  const trimmed = query.replace(/\s*\([^)]*\)\s*$/, '').trim();
  if (trimmed.length < 2) return null;

  for (const variant of searchVariants(trimmed)) {
    const url = new URL('https://api-adresse.data.gouv.fr/search/');
    url.searchParams.set('q', variant);
    url.searchParams.set('limit', '5');
    url.searchParams.set('type', 'municipality');

    const res = await fetch(url.toString(), { cache: 'no-store' });
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

    return {
      latitude: lat,
      longitude: lon,
      name,
      admin1,
    };
  }

  return null;
}

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get('city')?.trim() ?? '';
  if (city.length < 2) {
    return NextResponse.json({ error: 'Ville invalide' }, { status: 400 });
  }

  const place = await geocodeViaBan(city);
  if (!place) {
    return NextResponse.json({ error: 'Ville introuvable' }, { status: 404 });
  }

  return NextResponse.json(place);
}
