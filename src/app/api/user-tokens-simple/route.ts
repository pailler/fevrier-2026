import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

// Version simplifiée qui ne vérifie pas la table profiles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }

    console.log('🪙 API user-tokens-simple GET: userId =', userId);

    // Si userId est un email, récupérer l'UUID depuis profiles
    let actualUserId = userId;
    if (userId.includes('@')) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userId)
        .single();
      
      if (profileError || !profile) {
        console.error('❌ Utilisateur non trouvé:', profileError);
        return NextResponse.json(
          { error: 'Utilisateur non trouvé' },
          { status: 404 }
        );
      }
      actualUserId = profile.id;
      console.log('🔄 UUID récupéré:', actualUserId, 'pour email:', userId);
    }

    // Récupérer les tokens depuis la table user_tokens
    const { data: userTokens, error: tokensError } = await supabase
      .from('user_tokens')
      .select('tokens, package_name, purchase_date, is_active')
      .eq('user_id', actualUserId)
      .single();

    if (tokensError) {
      // PGRST116 = "No rows returned" - c'est normal si l'utilisateur n'a pas de tokens
      if (tokensError.code === 'PGRST116') {
        // Ne pas logger d'erreur, c'est normal pour un nouvel utilisateur
        return NextResponse.json({
          tokens: 0,
          tokensRemaining: 0,
          packageName: null,
          purchaseDate: null,
          isActive: false
        });
      } else {
        // Autre erreur (permissions, etc.) - logger seulement en développement
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Erreur lors de la récupération des tokens:', tokensError);
          console.error('❌ Code:', tokensError.code);
          console.error('❌ Message:', tokensError.message);
          console.error('❌ User ID:', actualUserId);
        }
        return NextResponse.json({
          tokens: 0,
          tokensRemaining: 0,
          packageName: null,
          purchaseDate: null,
          isActive: false,
          error: tokensError.message
        });
      }
    }

    // Utiliser les vraies valeurs de la base de données
    const tokens = userTokens.tokens !== null ? userTokens.tokens : 0;
    const packageName = userTokens.package_name || null;
    const purchaseDate = userTokens.purchase_date || null;
    const isActive = userTokens.is_active !== false;
    
    console.log('✅ Tokens récupérés depuis la DB:', tokens, 'pour userId:', actualUserId);
    console.log('✅ Package:', packageName);
    console.log('✅ Is Active:', isActive);

    return NextResponse.json({
      tokens: tokens,
      tokensRemaining: tokens,
      packageName: packageName,
      purchaseDate: purchaseDate,
      isActive: isActive
    });

  } catch (error) {
    // Logger seulement en développement
    if (process.env.NODE_ENV === 'development') {
      console.error('Erreur API user-tokens GET:', error);
    }
    // Retourner 0 tokens plutôt qu'une erreur pour éviter de bloquer l'interface
    return NextResponse.json({
      tokens: 0,
      tokensRemaining: 0,
      packageName: null,
      purchaseDate: null,
      isActive: false,
      error: error instanceof Error ? error.message : 'Erreur interne du serveur'
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, tokensToConsume, moduleId, moduleName } = await request.json();

    if (!userId || !tokensToConsume) {
      return NextResponse.json(
        { error: 'userId et tokensToConsume sont requis' },
        { status: 400 }
      );
    }

    console.log('🪙 API user-tokens-simple POST: userId =', userId, 'tokensToConsume =', tokensToConsume);

    // Si userId est un email, récupérer l'UUID depuis profiles
    let actualUserId = userId;
    if (userId.includes('@')) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userId)
        .single();
      
      if (profileError || !profile) {
        console.error('❌ Utilisateur non trouvé pour consommation:', profileError);
        return NextResponse.json(
          { error: 'Utilisateur non trouvé' },
          { status: 404 }
        );
      }
      actualUserId = profile.id;
      console.log('🔄 UUID récupéré pour consommation:', actualUserId, 'pour email:', userId);
    }

    // Récupérer le solde actuel depuis la table user_tokens
    const { data: userTokens, error: tokensError } = await supabase
      .from('user_tokens')
      .select('tokens')
      .eq('user_id', actualUserId)
      .single();

    if (tokensError) {
      // Si l'utilisateur n'a pas de tokens, il doit passer par les achats
      console.error('❌ Utilisateur sans tokens pour consommation:', userId);
      return NextResponse.json(
        { 
          error: 'Crédits insuffisants',
          currentTokens: 0,
          requiredTokens: tokensToConsume,
          insufficient: true,
          message: 'Vous devez acheter des crédits pour utiliser ce service'
        },
        { status: 400 }
      );
    }

    const currentTokens = userTokens.tokens || 0;
    console.log('✅ Solde actuel récupéré:', currentTokens, 'tokens pour userId:', userId);

    // Vérifier si l'utilisateur a assez de tokens
    if (currentTokens < tokensToConsume) {
      console.log('❌ Crédits insuffisants:', currentTokens, '<', tokensToConsume, 'pour userId:', userId);
      return NextResponse.json(
        { 
          error: 'Crédits insuffisants',
          currentTokens: currentTokens,
          requiredTokens: tokensToConsume,
          insufficient: true
        },
        { status: 400 }
      );
    }

    // Consommer les tokens avec une condition optimiste pour éviter les race conditions
    // Cette condition garantit que la mise à jour ne se fait que si les tokens n'ont pas changé entre la lecture et l'écriture
    let newTokenCount = currentTokens - tokensToConsume;
    
    const { data: updatedTokens, error: updateError } = await supabase
      .from('user_tokens')
      .update({ 
        tokens: newTokenCount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', actualUserId)
      .eq('tokens', currentTokens) // Condition optimiste : ne mettre à jour que si les tokens n'ont pas changé
      .select()
      .single();

    // Si la mise à jour a échoué (probablement à cause de la condition optimiste), vérifier à nouveau
    if (updateError || !updatedTokens) {
      console.warn('⚠️ Mise à jour échouée (possible race condition), revérification du solde...');
      
      // Récupérer le solde actuel à nouveau
      const { data: recheckTokens, error: recheckError } = await supabase
        .from('user_tokens')
        .select('tokens')
        .eq('user_id', actualUserId)
        .single();
      
      if (recheckError || !recheckTokens) {
        console.error('❌ Erreur lors de la revérification des tokens:', recheckError);
        return NextResponse.json(
          { 
            error: 'Erreur lors de la mise à jour des tokens',
            message: 'Veuillez réessayer',
            pricingUrl: 'https://iahome.fr/pricing2'
          },
          { status: 500 }
        );
      }
      
      const recheckCurrentTokens = recheckTokens.tokens || 0;
      
      // Vérifier à nouveau si l'utilisateur a assez de tokens
      if (recheckCurrentTokens < tokensToConsume) {
        console.log('❌ Crédits insuffisants après revérification:', recheckCurrentTokens, '<', tokensToConsume);
        return NextResponse.json(
          { 
            error: 'Crédits insuffisants',
            currentTokens: recheckCurrentTokens,
            requiredTokens: tokensToConsume,
            insufficient: true
          },
          { status: 400 }
        );
      }
      
      // Réessayer avec le nouveau solde
      const retryNewTokenCount = recheckCurrentTokens - tokensToConsume;
      const { error: retryError } = await supabase
        .from('user_tokens')
        .update({ 
          tokens: retryNewTokenCount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', actualUserId)
        .eq('tokens', recheckCurrentTokens); // Condition optimiste avec le nouveau solde
      
      if (retryError) {
        console.error('❌ Erreur lors de la deuxième tentative de mise à jour:', retryError);
        return NextResponse.json(
          { 
            error: 'Plus de crédits ? Rechargez',
            message: 'Plus de crédits ? Rechargez',
            pricingUrl: 'https://iahome.fr/pricing2'
          },
          { status: 500 }
        );
      }
      
      // Utiliser le nouveau solde pour la réponse
      newTokenCount = retryNewTokenCount;
      console.log('✅ Tokens consommés (après retry):', tokensToConsume, 'Restants:', newTokenCount, 'pour userId:', userId);
    } else {
      console.log('✅ Tokens consommés:', tokensToConsume, 'Restants:', newTokenCount, 'pour userId:', userId);
    }

    // Enregistrer l'utilisation dans token_usage
    if (moduleId && moduleId !== 'test') {
      const now = new Date().toISOString();
      
      try {
        const { error: tokenUsageError } = await supabase
          .from('token_usage')
          .insert({
            user_id: actualUserId,
            module_id: moduleId,
            module_name: moduleName || moduleId,
            tokens_consumed: tokensToConsume,
            usage_date: now,
            action_type: 'module_usage'
          });

        if (tokenUsageError) {
          console.log('ℹ️ Table token_usage non accessible ou inexistante:', tokenUsageError);
        } else {
          console.log('✅ Consommation enregistrée dans token_usage');
        }
      } catch (error) {
        console.log('ℹ️ Table token_usage non accessible:', error);
      }

      // Mettre à jour user_applications (applis visitées) pour le nouveau système
      try {
        const modId = (moduleId || '').toString().trim();
        const modTitle = (moduleName || moduleId).toString().trim();
        const { data: existingApp } = await supabase
          .from('user_applications')
          .select('id, usage_count')
          .eq('user_id', actualUserId)
          .eq('module_id', modId)
          .maybeSingle();

        if (existingApp) {
          const newUsageCount = (existingApp.usage_count || 0) + 1;
          const { error: updateErr } = await supabase
            .from('user_applications')
            .update({
              usage_count: newUsageCount,
              last_used_at: now,
              updated_at: now
            })
            .eq('id', existingApp.id);
          if (updateErr) console.log('ℹ️ Mise à jour user_applications (visité):', updateErr.message);
        } else {
          const { error: insertErr } = await supabase
            .from('user_applications')
            .insert({
              user_id: actualUserId,
              module_id: modId,
              module_title: modTitle,
              usage_count: 1,
              last_used_at: now,
              is_active: false,
              created_at: now,
              updated_at: now
            });
          if (insertErr) console.log('ℹ️ Insert user_applications (visité):', insertErr.message);
        }
      } catch (err) {
        console.log('ℹ️ user_applications (visité) non accessible:', err);
      }
    }

    return NextResponse.json({
      success: true,
      tokensRemaining: newTokenCount,
      tokensConsumed: tokensToConsume
    });

  } catch (error) {
    console.error('Erreur API user-tokens POST:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}