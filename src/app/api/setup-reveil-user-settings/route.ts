import { NextResponse } from 'next/server';
import { ensureReveilStorageBucket, isReveilStorageReady } from '@/lib/reveilUserSettingsStore';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/utils/supabaseConfig';

const supabaseAdmin = createClient(getSupabaseUrl(), getSupabaseServiceRoleKey());

export async function POST() {
  try {
    await ensureReveilStorageBucket();
    const storage = await isReveilStorageReady();

    const { error: tableError } = await supabaseAdmin.from('reveil_user_settings').select('user_id').limit(1);
    const tableReady = !tableError;

    if (!storage.ready) {
      return NextResponse.json(
        { success: false, error: 'storage', details: storage.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Stockage Reveil Intelligent prêt',
      storage: true,
      table: tableReady,
      tableHint: tableReady
        ? null
        : 'Optionnel : exécuter scripts/reveil-user-settings.sql dans Supabase pour activer aussi la table SQL',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const storage = await isReveilStorageReady();
  const { error: tableError } = await supabaseAdmin.from('reveil_user_settings').select('user_id').limit(1);

  return NextResponse.json({
    ready: storage.ready,
    storage: storage.ready,
    table: !tableError,
    error: storage.error ?? tableError?.message ?? null,
    probe: storage.ready ? 'storage-ok' : null,
  });
}
