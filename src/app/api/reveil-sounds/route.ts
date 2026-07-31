import { NextRequest, NextResponse } from 'next/server';
import { loadReveilUserSettings, saveReveilUserSettings } from '@/lib/reveilUserSettingsStore';
import { authorizeReveilRequest, reveilCorsHeaders } from '@/lib/reveilApiAuth';
import { saveReveilUserSound, type ReveilCustomSoundMeta } from '@/lib/reveilUserSoundsStore';

function parseCustomSounds(preferences: Record<string, unknown>): ReveilCustomSoundMeta[] {
  const raw = preferences.customSounds;
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is ReveilCustomSoundMeta =>
      Boolean(item) &&
      typeof item === 'object' &&
      typeof (item as ReveilCustomSoundMeta).id === 'string' &&
      typeof (item as ReveilCustomSoundMeta).label === 'string'
  );
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  return new NextResponse(null, { status: 204, headers: reveilCorsHeaders(origin) });
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');
  const headers = reveilCorsHeaders(origin);

  const auth = await authorizeReveilRequest(request);
  if (auth.ok === false) {
    return NextResponse.json({ error: auth.error }, { status: auth.status, headers });
  }

  const settings = await loadReveilUserSettings(auth.userId);
  const sounds = parseCustomSounds(settings?.preferences ?? {});

  return NextResponse.json({ sounds }, { headers });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  const headers = reveilCorsHeaders(origin);

  const auth = await authorizeReveilRequest(request);
  if (auth.ok === false) {
    return NextResponse.json({ error: auth.error }, { status: auth.status, headers });
  }

  const formData = await request.formData();
  const file = formData.get('file');
  const label = formData.get('label');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Fichier audio requis' }, { status: 400, headers });
  }

  const settings = await loadReveilUserSettings(auth.userId);
  const preferences = { ...(settings?.preferences ?? {}) };
  const existing = parseCustomSounds(preferences);

  const saved = await saveReveilUserSound({
    userId: auth.userId,
    file,
    label: typeof label === 'string' ? label : undefined,
    existingCount: existing.length,
  });

  if (saved.ok === false) {
    return NextResponse.json({ error: saved.error }, { status: 400, headers });
  }

  const nextSounds = [...existing, saved.sound];
  const alarms = settings?.alarms ?? [];

  const write = await saveReveilUserSettings(auth.userId, {
    alarms,
    preferences: { ...preferences, customSounds: nextSounds },
  });

  if (!write.ok) {
    return NextResponse.json({ error: 'Erreur enregistrement métadonnées' }, { status: 500, headers });
  }

  return NextResponse.json({ sound: saved.sound, sounds: nextSounds }, { headers });
}
