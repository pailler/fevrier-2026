import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

/**
 * API Route pour déconnecter tous les utilisateurs
 * Désactive toutes les sessions actives et invalide tous les tokens
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔒 Déconnexion de tous les utilisateurs...');

    // 1. Désactiver toutes les sessions actives dans user_sessions
    try {
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('is_active', true)
        .select();

      if (sessionsError) {
        console.warn('⚠️ Erreur lors de la désactivation des sessions:', sessionsError);
      } else {
        console.log(`✅ ${sessionsData?.length || 0} session(s) désactivée(s) dans user_sessions`);
      }
    } catch (error) {
      console.warn('⚠️ Table user_sessions non disponible ou erreur:', error);
    }

    // 2. Invalider tous les tokens JWT actifs dans access_tokens
    try {
      const { data: tokensData, error: tokensError } = await supabase
        .from('access_tokens')
        .update({ is_active: false })
        .eq('is_active', true)
        .select();

      if (tokensError) {
        console.warn('⚠️ Erreur lors de l\'invalidation des tokens:', tokensError);
      } else {
        console.log(`✅ ${tokensData?.length || 0} token(s) invalidé(s) dans access_tokens`);
      }
    } catch (error) {
      console.warn('⚠️ Table access_tokens non disponible ou erreur:', error);
    }

    // 3. Invalider tous les tokens auto_tokens actifs
    try {
      const { data: autoTokensData, error: autoTokensError } = await supabase
        .from('auto_tokens')
        .delete()
        .gt('expires_at', new Date().toISOString())
        .select();

      if (autoTokensError) {
        console.warn('⚠️ Erreur lors de la suppression des auto_tokens:', autoTokensError);
      } else {
        console.log(`✅ ${autoTokensData?.length || 0} auto_token(s) supprimé(s)`);
      }
    } catch (error) {
      console.warn('⚠️ Table auto_tokens non disponible ou erreur:', error);
    }

    // 4. Invalider tous les tokens module_access_tokens actifs
    try {
      const { data: moduleTokensData, error: moduleTokensError } = await supabase
        .from('module_access_tokens')
        .update({ is_valid: false })
        .eq('is_valid', true)
        .select();

      if (moduleTokensError) {
        console.warn('⚠️ Erreur lors de l\'invalidation des module_access_tokens:', moduleTokensError);
      } else {
        console.log(`✅ ${moduleTokensData?.length || 0} module_access_token(s) invalidé(s)`);
      }
    } catch (error) {
      console.warn('⚠️ Table module_access_tokens non disponible ou erreur:', error);
    }

    console.log('✅ Tous les utilisateurs ont été déconnectés');

    return NextResponse.json({
      success: true,
      message: 'Tous les utilisateurs ont été déconnectés',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Erreur lors de la déconnexion de tous les utilisateurs:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de la déconnexion',
        details: error.message 
      },
      { status: 500 }
    );
  }
}


































