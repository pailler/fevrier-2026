import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

/**
 * API obsolète : la notion d'expiration a été supprimée de user_applications.
 * Retourne succès sans action.
 */
export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Expiration désactivée - aucune action effectuée',
    deactivatedCount: 0,
    deactivatedModules: []
  });
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Expiration désactivée - aucune action effectuée',
    deactivatedCount: 0,
    deactivatedModules: []
  });
}




















