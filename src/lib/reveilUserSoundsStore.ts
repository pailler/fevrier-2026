import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/utils/supabaseConfig';

export const REVEIL_SOUNDS_BUCKET = 'reveil-user-sounds';
export const MAX_REVEIL_SOUND_BYTES = 8 * 1024 * 1024;
export const MAX_REVEIL_SOUNDS_PER_USER = 12;

const ALLOWED_MIME = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/ogg',
  'audio/webm',
  'audio/mp4',
  'audio/x-m4a',
  'audio/aac',
]);

const EXT_BY_MIME: Record<string, string> = {
  'audio/mpeg': '.mp3',
  'audio/mp3': '.mp3',
  'audio/wav': '.wav',
  'audio/x-wav': '.wav',
  'audio/ogg': '.ogg',
  'audio/webm': '.webm',
  'audio/mp4': '.m4a',
  'audio/x-m4a': '.m4a',
  'audio/aac': '.aac',
};

let adminClient: ReturnType<typeof createClient> | null = null;

function getAdmin() {
  if (!adminClient) {
    adminClient = createClient(getSupabaseUrl(), getSupabaseServiceRoleKey());
  }
  return adminClient;
}

export interface ReveilCustomSoundMeta {
  id: string;
  label: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

function storagePath(userId: string, soundId: string, ext: string): string {
  return `${userId}/${soundId}${ext}`;
}

function extFromFileName(name: string): string | null {
  const match = name.toLowerCase().match(/\.(mp3|wav|ogg|webm|m4a|aac)$/);
  return match ? `.${match[1]}` : null;
}

function resolveExt(mimeType: string, fileName: string): string | null {
  return EXT_BY_MIME[mimeType] ?? extFromFileName(fileName);
}

export async function ensureReveilSoundsBucket(): Promise<void> {
  const admin = getAdmin();
  const { data: buckets } = await admin.storage.listBuckets();
  if (buckets?.some((b) => b.name === REVEIL_SOUNDS_BUCKET)) return;
  await admin.storage.createBucket(REVEIL_SOUNDS_BUCKET, {
    public: false,
    fileSizeLimit: MAX_REVEIL_SOUND_BYTES,
  });
}

export async function saveReveilUserSound(params: {
  userId: string;
  file: File;
  label?: string;
  existingCount: number;
}): Promise<{ ok: true; sound: ReveilCustomSoundMeta } | { ok: false; error: string }> {
  const { userId, file, label, existingCount } = params;

  if (existingCount >= MAX_REVEIL_SOUNDS_PER_USER) {
    return { ok: false, error: `Maximum ${MAX_REVEIL_SOUNDS_PER_USER} sons personnalisés` };
  }

  if (file.size <= 0) return { ok: false, error: 'Fichier vide' };
  if (file.size > MAX_REVEIL_SOUND_BYTES) {
    return { ok: false, error: 'Fichier trop volumineux (max 8 Mo)' };
  }

  const mimeType = file.type || 'audio/mpeg';
  if (!ALLOWED_MIME.has(mimeType) && !extFromFileName(file.name)) {
    return { ok: false, error: 'Format non supporté (MP3, WAV, OGG, M4A, WebM)' };
  }

  const ext = resolveExt(mimeType, file.name);
  if (!ext) return { ok: false, error: 'Extension de fichier non reconnue' };

  await ensureReveilSoundsBucket();
  const soundId = randomUUID();
  const path = storagePath(userId, soundId, ext);
  const buffer = Buffer.from(await file.arrayBuffer());

  const admin = getAdmin();
  const { error } = await admin.storage.from(REVEIL_SOUNDS_BUCKET).upload(path, buffer, {
    upsert: false,
    contentType: mimeType,
  });

  if (error) return { ok: false, error: error.message };

  const cleanLabel = (label ?? file.name).trim().slice(0, 80) || 'Mon son';

  return {
    ok: true,
    sound: {
      id: soundId,
      label: cleanLabel,
      fileName: file.name.slice(0, 120),
      mimeType,
      sizeBytes: file.size,
      createdAt: new Date().toISOString(),
    },
  };
}

export async function readReveilUserSound(params: {
  userId: string;
  soundId: string;
  meta: ReveilCustomSoundMeta;
}): Promise<{ ok: true; data: Blob; mimeType: string } | { ok: false; error: string }> {
  const ext = resolveExt(params.meta.mimeType, params.meta.fileName);
  if (!ext) return { ok: false, error: 'Son introuvable' };

  const admin = getAdmin();
  const path = storagePath(params.userId, params.soundId, ext);
  const { data, error } = await admin.storage.from(REVEIL_SOUNDS_BUCKET).download(path);

  if (error || !data) return { ok: false, error: 'Son introuvable' };
  return { ok: true, data, mimeType: params.meta.mimeType || 'audio/mpeg' };
}

export async function deleteReveilUserSound(params: {
  userId: string;
  soundId: string;
  meta: ReveilCustomSoundMeta;
}): Promise<{ ok: boolean; error?: string }> {
  const ext = resolveExt(params.meta.mimeType, params.meta.fileName);
  if (!ext) return { ok: true };

  const admin = getAdmin();
  const path = storagePath(params.userId, params.soundId, ext);
  const { error } = await admin.storage.from(REVEIL_SOUNDS_BUCKET).remove([path]);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
