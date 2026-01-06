import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

/**
 * API pour désactiver automatiquement les modules expirés
 * Met is_active = false pour tous les modules dont expires_at est passé
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    const now = new Date().toISOString();

    console.log('🔄 Désactivation des modules expirés...', userId ? `pour utilisateur: ${userId}` : 'pour tous les utilisateurs');

    // Construire la requête selon si userId est fourni ou non
    let query = supabase
      .from('user_applications')
      .update({
        is_active: false,
        updated_at: now
      })
      .eq('is_active', true)
      .lt('expires_at', now);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.select();

    if (error) {
      console.error('❌ Erreur lors de la désactivation des modules expirés:', error);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la désactivation des modules expirés',
        details: error.message
      }, { status: 500 });
    }

    const count = data?.length || 0;
    console.log(`✅ ${count} module(s) expiré(s) désactivé(s)`);

    return NextResponse.json({
      success: true,
      message: `${count} module(s) expiré(s) désactivé(s)`,
      deactivatedCount: count,
      deactivatedModules: data
    });

  } catch (error) {
    console.error('❌ Erreur lors de la désactivation des modules expirés:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

/**
 * GET pour désactiver les modules expirés pour un utilisateur spécifique
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const now = new Date().toISOString();

    console.log('🔄 Désactivation des modules expirés...', userId ? `pour utilisateur: ${userId}` : 'pour tous les utilisateurs');

    // Construire la requête selon si userId est fourni ou non
    let query = supabase
      .from('user_applications')
      .update({
        is_active: false,
        updated_at: now
      })
      .eq('is_active', true)
      .lt('expires_at', now);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.select();

    if (error) {
      console.error('❌ Erreur lors de la désactivation des modules expirés:', error);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la désactivation des modules expirés',
        details: error.message
      }, { status: 500 });
    }

    const count = data?.length || 0;
    console.log(`✅ ${count} module(s) expiré(s) désactivé(s)`);

    return NextResponse.json({
      success: true,
      message: `${count} module(s) expiré(s) désactivé(s)`,
      deactivatedCount: count,
      deactivatedModules: data
    });

  } catch (error) {
    console.error('❌ Erreur lors de la désactivation des modules expirés:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}




















