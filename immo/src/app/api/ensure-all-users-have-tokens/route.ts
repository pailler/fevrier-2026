import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

/**
 * Route API pour vérifier l'état des tokens de tous les utilisateurs
 * NE CRÉE PAS de tokens automatiquement
 * Les tokens sont créés UNIQUEMENT lors de l'inscription
 * Les utilisateurs sans tokens doivent passer par les achats
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Vérification de l\'état des tokens pour tous les utilisateurs...');

    // 1. Récupérer tous les utilisateurs depuis profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('is_active', true);

    if (profilesError) {
      console.error('❌ Erreur récupération profiles:', profilesError);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la récupération des utilisateurs',
        details: profilesError.message
      }, { status: 500 });
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Aucun utilisateur trouvé',
        total: 0
      });
    }

    console.log(`📊 ${profiles.length} utilisateurs trouvés`);

    const results = [];

    // 2. Pour chaque utilisateur, vérifier l'état des tokens (SANS CRÉER)
    for (const profile of profiles) {
      try {
        // Vérifier si l'utilisateur a déjà des tokens
        const { data: userTokens, error: tokensError } = await supabase
          .from('user_tokens')
          .select('id, tokens')
          .eq('user_id', profile.id)
          .single();

        if (tokensError && tokensError.code === 'PGRST116') {
          // PGRST116 = no rows returned - utilisateur sans tokens
          results.push({
            email: profile.email,
            userId: profile.id,
            status: 'no_tokens',
            tokens: 0,
            message: 'Utilisateur sans tokens - doit passer par les achats'
          });
        } else if (userTokens) {
          // L'utilisateur a déjà des tokens
          results.push({
            email: profile.email,
            userId: profile.id,
            status: 'has_tokens',
            tokens: userTokens.tokens
          });
        } else {
          // Erreur inattendue
          console.error(`❌ Erreur inattendue pour ${profile.email}:`, tokensError);
          results.push({
            email: profile.email,
            userId: profile.id,
            status: 'error',
            action: 'check',
            error: tokensError?.message || 'Erreur inconnue'
          });
        }
      } catch (error) {
        console.error(`❌ Erreur traitement ${profile.email}:`, error);
        results.push({
          email: profile.email,
          userId: profile.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }

    const usersWithoutTokens = results.filter(r => r.status === 'no_tokens').length;
    const usersWithTokens = results.filter(r => r.status === 'has_tokens').length;

    console.log(`✅ Vérification terminée: ${usersWithTokens} avec tokens, ${usersWithoutTokens} sans tokens`);

    return NextResponse.json({
      success: true,
      message: 'Vérification des tokens terminée (aucune création automatique)',
      summary: {
        total: profiles.length,
        withTokens: usersWithTokens,
        withoutTokens: usersWithoutTokens
      },
      results: results
    });

  } catch (error) {
    console.error('❌ Erreur API ensure-all-users-have-tokens:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Route GET pour vérifier l'état des tokens de tous les utilisateurs
 */
export async function GET(request: NextRequest) {
  try {
    // Récupérer tous les utilisateurs depuis profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('is_active', true);

    if (profilesError) {
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la récupération des utilisateurs',
        details: profilesError.message
      }, { status: 500 });
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        success: true,
        total: 0,
        usersWithoutTokens: [],
        usersWithTokens: []
      });
    }

    const usersWithoutTokens = [];
    const usersWithTokens = [];

    for (const profile of profiles) {
      const { data: userTokens } = await supabase
        .from('user_tokens')
        .select('tokens')
        .eq('user_id', profile.id)
        .single();

      if (!userTokens || userTokens.tokens === null) {
        usersWithoutTokens.push({
          email: profile.email,
          userId: profile.id,
          tokens: 0
        });
      } else {
        usersWithTokens.push({
          email: profile.email,
          userId: profile.id,
          tokens: userTokens.tokens
        });
      }
    }

    return NextResponse.json({
      success: true,
      total: profiles.length,
      usersWithoutTokens: usersWithoutTokens,
      usersWithTokens: usersWithTokens,
      countWithoutTokens: usersWithoutTokens.length,
      countWithTokens: usersWithTokens.length
    });

  } catch (error) {
    console.error('❌ Erreur API ensure-all-users-have-tokens GET:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

