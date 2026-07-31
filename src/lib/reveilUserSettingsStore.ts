import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/utils/supabaseConfig';

const BUCKET = 'reveil-user-data';

export interface ReveilSettingsRecord {
  alarms: unknown[];
  preferences: Record<string, unknown>;
  updated_at: string;
}

let adminClient: SupabaseClient | null = null;

function getAdmin(): SupabaseClient {
  if (!adminClient) {
    adminClient = createClient(getSupabaseUrl(), getSupabaseServiceRoleKey());
  }
  return adminClient;
}

function storagePath(userId: string): string {
  return `${userId}.json`;
}

function isMissingTableError(message: string | undefined): boolean {
  return Boolean(message?.includes('reveil_user_settings') && message.includes('does not exist'));
}

export async function ensureReveilStorageBucket(): Promise<void> {
  const admin = getAdmin();
  const { data: buckets } = await admin.storage.listBuckets();
  if (buckets?.some((b) => b.name === BUCKET)) return;
  await admin.storage.createBucket(BUCKET, { public: false, fileSizeLimit: 1024 * 1024 });
}

async function readFromStorage(userId: string): Promise<ReveilSettingsRecord | null> {
  const admin = getAdmin();
  const { data, error } = await admin.storage.from(BUCKET).download(storagePath(userId));
  if (error || !data) return null;

  try {
    const parsed = JSON.parse(await data.text()) as Partial<ReveilSettingsRecord>;
    return {
      alarms: Array.isArray(parsed.alarms) ? parsed.alarms : [],
      preferences:
        parsed.preferences && typeof parsed.preferences === 'object' ? parsed.preferences : {},
      updated_at: parsed.updated_at ?? new Date(0).toISOString(),
    };
  } catch {
    return null;
  }
}

async function writeToStorage(userId: string, record: ReveilSettingsRecord): Promise<string | null> {
  await ensureReveilStorageBucket();
  const admin = getAdmin();
  const body = JSON.stringify(record);
  const { error } = await admin.storage.from(BUCKET).upload(storagePath(userId), body, {
    upsert: true,
    contentType: 'application/json',
  });
  return error?.message ?? null;
}

export async function loadReveilUserSettings(userId: string): Promise<ReveilSettingsRecord | null> {
  const admin = getAdmin();

  const { data: tableRow, error: tableError } = await admin
    .from('reveil_user_settings')
    .select('alarms, preferences, updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  const storageRow = await readFromStorage(userId);

  if (!tableError && tableRow) {
    const tableRecord: ReveilSettingsRecord = {
      alarms: tableRow.alarms ?? [],
      preferences: (tableRow.preferences as Record<string, unknown>) ?? {},
      updated_at: tableRow.updated_at ?? new Date(0).toISOString(),
    };

    if (!storageRow) return tableRecord;

    return new Date(tableRecord.updated_at) >= new Date(storageRow.updated_at)
      ? tableRecord
      : storageRow;
  }

  if (tableError && !isMissingTableError(tableError.message)) {
    console.warn('[reveil-sync] table read:', tableError.message);
  }

  return storageRow;
}

export async function saveReveilUserSettings(
  userId: string,
  payload: { alarms: unknown[]; preferences: Record<string, unknown> }
): Promise<{ ok: boolean; error?: string }> {
  const record: ReveilSettingsRecord = {
    alarms: payload.alarms,
    preferences: payload.preferences,
    updated_at: new Date().toISOString(),
  };

  const storageError = await writeToStorage(userId, record);
  if (storageError) {
    return { ok: false, error: storageError };
  }

  const admin = getAdmin();
  const { error: tableError } = await admin.from('reveil_user_settings').upsert(
    {
      user_id: userId,
      alarms: payload.alarms,
      preferences: payload.preferences,
      updated_at: record.updated_at,
    },
    { onConflict: 'user_id' }
  );

  if (tableError && !isMissingTableError(tableError.message)) {
    console.warn('[reveil-sync] table write:', tableError.message);
  }

  return { ok: true };
}

export async function isReveilStorageReady(): Promise<{ ready: boolean; error?: string }> {
  try {
    await ensureReveilStorageBucket();
    return { ready: true };
  } catch (err) {
    return {
      ready: false,
      error: err instanceof Error ? err.message : 'Bucket indisponible',
    };
  }
}
