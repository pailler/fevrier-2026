import type { Alarm, CustomSound } from '@/types';
import { normalizeAlarm } from '@/lib/recurrence';

const blobUrlCache = new Map<string, string>();

export function normalizeCustomSounds(raw: unknown): CustomSound[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (item): item is CustomSound =>
        Boolean(item) &&
        typeof item === 'object' &&
        typeof (item as CustomSound).id === 'string' &&
        typeof (item as CustomSound).label === 'string'
    )
    .map((item) => ({
      id: item.id,
      label: item.label,
      fileName: item.fileName ?? item.label,
      mimeType: item.mimeType ?? 'audio/mpeg',
      sizeBytes: typeof item.sizeBytes === 'number' ? item.sizeBytes : 0,
      createdAt: item.createdAt ?? new Date(0).toISOString(),
    }));
}

export async function uploadCustomSound(
  token: string,
  file: File,
  label?: string
): Promise<{ ok: true; sound: CustomSound; sounds: CustomSound[] } | { ok: false; error: string }> {
  const formData = new FormData();
  formData.append('file', file);
  if (label?.trim()) formData.append('label', label.trim());

  const res = await fetch('/api/sounds', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = (await res.json().catch(() => ({}))) as {
    sound?: CustomSound;
    sounds?: CustomSound[];
    error?: string;
  };

  if (!res.ok || !data.sound) {
    return { ok: false, error: data.error ?? 'Upload echoue' };
  }

  invalidateCustomSoundCache(data.sound.id);
  return {
    ok: true,
    sound: data.sound,
    sounds: normalizeCustomSounds(data.sounds ?? [data.sound]),
  };
}

export async function deleteCustomSound(
  token: string,
  soundId: string
): Promise<
  | { ok: true; sounds: CustomSound[]; alarms?: Alarm[] }
  | { ok: false; error: string }
> {
  const res = await fetch(`/api/sounds/${soundId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = (await res.json().catch(() => ({}))) as {
    sounds?: CustomSound[];
    alarms?: Record<string, unknown>[];
    error?: string;
  };
  if (!res.ok) return { ok: false, error: data.error ?? 'Suppression echoue' };

  invalidateCustomSoundCache(soundId);
  return {
    ok: true,
    sounds: normalizeCustomSounds(data.sounds ?? []),
    alarms: Array.isArray(data.alarms) ? data.alarms.map((a) => normalizeAlarm(a)) : undefined,
  };
}

export function invalidateCustomSoundCache(soundId?: string): void {
  if (soundId) {
    const cached = blobUrlCache.get(soundId);
    if (cached) URL.revokeObjectURL(cached);
    blobUrlCache.delete(soundId);
    return;
  }
  for (const url of blobUrlCache.values()) URL.revokeObjectURL(url);
  blobUrlCache.clear();
}

export async function getCustomSoundPlayUrl(token: string, soundId: string): Promise<string | null> {
  const cached = blobUrlCache.get(soundId);
  if (cached) return cached;

  const res = await fetch(`/api/sounds/${soundId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok) return null;

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  blobUrlCache.set(soundId, url);
  return url;
}

export function formatSoundSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}
