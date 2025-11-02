import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

/**
 * Route API pour s'assurer que tous les utilisateurs dans profiles ont des tokens
 * Crée automatiquement 200 tokens pour les utilisateurs qui n'en ont pas
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Vérification et création automatique des tokens pour tous les utilisateurs...');

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
        created: 0,
        updated: 0,
        total: 0
      });
    }

    console.log(`📊 ${profiles.length} utilisateurs trouvés`);

    let createdCount = 0;
    let updatedCount = 0;
    const results = [];

    // 2. Pour chaque utilisateur, vérifier et créer/mettre à jour les tokens
    for (const profile of profiles) {
      try {
        // Vérifier si l'utilisateur a déjà des tokens
        const { data: userTokens, error: tokensError } = await supabase
          .from('user_tokens')
          .select('id, tokens')
          .eq('user_id', profile.id)
          .single();

        if (tokensError && tokensError.code === 'PGRST116') {
          // PGRST116 = no rows returned - créer les tokens
          console.log(`🪙 Création de 200 tokens pour ${profile.email}...`);
          
          const { error: insertError } = await supabase
            .from('user_tokens')
            .insert([{
              user_id: profile.id,
              tokens: 200,
              package_name: 'Welcome Package',
              purchase_date: new Date().toISOString(),
              is_active: true
            }]);

          if (insertError) {
            console.error(`❌ Erreur création tokens pour ${profile.email}:`, insertError);
            results.push({
              email: profile.email,
              userId: profile.id,
              status: 'error',
              action: 'create',
              error: insertError.message
            });
          } else {
            console.log(`✅ 200 tokens créés pour ${profile.email}`);
            createdCount++;
            results.push({
              email: profile.email,
              userId: profile.id,
              status: 'created',
              tokens: 200
            });
          }
        } else if (userTokens) {
          // L'utilisateur a déjà des tokens
          if (userTokens.tokens < 200) {
            // Mettre à jour à 200 tokens si moins de 200
            console.log(`🔄 Mise à jour de ${userTokens.tokens} à 200 tokens pour ${profile.email}...`);
            
            const { error: updateError } = await supabase
              .from('user_tokens')
              .update({
                tokens: 200,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', profile.id);

            if (updateError) {
              console.error(`❌ Erreur mise à jour tokens pour ${profile.email}:`, updateError);
              results.push({
                email: profile.email,
                userId: profile.id,
                status: 'error',
                action: 'update',
                error: updateError.message
              });
            } else {
              console.log(`✅ Tokens mis à jour à 200 pour ${profile.email}`);
              updatedCount++;
              results.push({
                email: profile.email,
                userId: profile.id,
                status: 'updated',
                oldTokens: userTokens.tokens,
                newTokens: 200
              });
            }
          } else {
            // L'utilisateur a déjà 200 tokens ou plus
            results.push({
              email: profile.email,
              userId: profile.id,
              status: 'ok',
              tokens: userTokens.tokens
            });
          }
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

    console.log(`✅ Traitement terminé: ${createdCount} créés, ${updatedCount} mis à jour`);

    return NextResponse.json({
      success: true,
      message: 'Vérification et création des tokens terminées',
      summary: {
        total: profiles.length,
        created: createdCount,
        updated: updatedCount,
        ok: profiles.length - createdCount - updatedCount
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

      if (!userTokens || userTokens.tokens === null || userTokens.tokens < 200) {
        usersWithoutTokens.push({
          email: profile.email,
          userId: profile.id,
          tokens: userTokens?.tokens || 0
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

