import { NextRequest, NextResponse } from 'next/server';
import { loadReveilUserSettings, saveReveilUserSettings } from '@/lib/reveilUserSettingsStore';
import { authorizeReveilRequest, reveilCorsHeaders } from '@/lib/reveilApiAuth';
import {
  deleteReveilUserSound,
  readReveilUserSound,
  type ReveilCustomSoundMeta,
} from '@/lib/reveilUserSoundsStore';

function parseCustomSounds(preferences: Record<string, unknown>): ReveilCustomSoundMeta[] {
  const raw = preferences.customSounds;
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is ReveilCustomSoundMeta =>
      Boolean(item) &&
      typeof item === 'object' &&
      typeof (item as ReveilCustomSoundMeta).id === 'string'
  );
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  return new NextResponse(null, { status: 204, headers: reveilCorsHeaders(origin) });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const origin = request.headers.get('origin');
  const headers = reveilCorsHeaders(origin);
  const { id } = await context.params;

  const auth = await authorizeReveilRequest(request);
  if (auth.ok === false) {
    return NextResponse.json({ error: auth.error }, { status: auth.status, headers });
  }

  const settings = await loadReveilUserSettings(auth.userId);
  const sounds = parseCustomSounds(settings?.preferences ?? {});
  const meta = sounds.find((s) => s.id === id);

  if (!meta) {
    return NextResponse.json({ error: 'Son introuvable' }, { status: 404, headers });
  }

  const file = await readReveilUserSound({ userId: auth.userId, soundId: id, meta });
  if (file.ok === false) {
    return NextResponse.json({ error: file.error }, { status: 404, headers });
  }

  const buffer = Buffer.from(await file.data.arrayBuffer());

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      ...headers,
      'Content-Type': file.mimeType,
      'Cache-Control': 'private, max-age=3600',
    },
  });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const origin = request.headers.get('origin');
  const headers = reveilCorsHeaders(origin);
  const { id } = await context.params;

  const auth = await authorizeReveilRequest(request);
  if (auth.ok === false) {
    return NextResponse.json({ error: auth.error }, { status: auth.status, headers });
  }

  const settings = await loadReveilUserSettings(auth.userId);
  const preferences = { ...(settings?.preferences ?? {}) };
  const existing = parseCustomSounds(preferences);
  const meta = existing.find((s) => s.id === id);

  if (!meta) {
    return NextResponse.json({ error: 'Son introuvable' }, { status: 404, headers });
  }

  const removed = await deleteReveilUserSound({ userId: auth.userId, soundId: id, meta });
  if (removed.ok === false) {
    return NextResponse.json({ error: removed.error ?? 'Suppression impossible' }, { status: 500, headers });
  }

  const nextSounds = existing.filter((s) => s.id !== id);
  const alarms = (settings?.alarms ?? []).map((alarm) => {
    if (!alarm || typeof alarm !== 'object') return alarm;
    const a = alarm as Record<string, unknown>;
    if (a.music === 'custom' && a.customSoundId === id) {
      return { ...a, music: 'serene-morning', customSoundId: undefined };
    }
    return alarm;
  });

  await saveReveilUserSettings(auth.userId, {
    alarms,
    preferences: { ...preferences, customSounds: nextSounds },
  });

  return NextResponse.json({ success: true, sounds: nextSounds, alarms }, { headers });
}
