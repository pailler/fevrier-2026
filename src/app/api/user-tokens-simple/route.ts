import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

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
      // Si l'utilisateur n'a pas de tokens, retourner 0
      // Les tokens ne sont créés QUE lors de l'inscription, pas automatiquement ici
      console.log('⚠️ Utilisateur sans tokens (doit passer par les achats):', userId);
      return NextResponse.json({
        tokens: 0,
        tokensRemaining: 0,
        packageName: null,
        purchaseDate: null,
        isActive: false
      });
    }

    // Utiliser les vraies valeurs de la base de données
    const tokens = userTokens.tokens !== null ? userTokens.tokens : 0;
    const packageName = userTokens.package_name || null;
    const purchaseDate = userTokens.purchase_date || null;
    const isActive = userTokens.is_active !== false;
    
    console.log('✅ Tokens récupérés depuis la DB:', tokens, 'pour userId:', userId);

    return NextResponse.json({
      tokens: tokens,
      tokensRemaining: tokens,
      packageName: packageName,
      purchaseDate: purchaseDate,
      isActive: isActive
    });

  } catch (error) {
    console.error('Erreur API user-tokens GET:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
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
          error: 'Tokens insuffisants',
          currentTokens: 0,
          requiredTokens: tokensToConsume,
          insufficient: true,
          message: 'Vous devez acheter des tokens pour utiliser ce service'
        },
        { status: 400 }
      );
    }

    const currentTokens = userTokens.tokens || 0;
    console.log('✅ Solde actuel récupéré:', currentTokens, 'tokens pour userId:', userId);

    // Vérifier si l'utilisateur a assez de tokens
    if (currentTokens < tokensToConsume) {
      console.log('❌ Tokens insuffisants:', currentTokens, '<', tokensToConsume, 'pour userId:', userId);
      return NextResponse.json(
        { 
          error: 'Tokens insuffisants',
          currentTokens: currentTokens,
          requiredTokens: tokensToConsume,
          insufficient: true
        },
        { status: 400 }
      );
    }

    // Consommer les tokens
    const newTokenCount = currentTokens - tokensToConsume;
    
    const { error: updateError } = await supabase
      .from('user_tokens')
      .update({ 
        tokens: newTokenCount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', actualUserId);

    if (updateError) {
      console.error('❌ Erreur lors de la mise à jour des tokens:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de la consommation des tokens' },
        { status: 500 }
      );
    }

    console.log('✅ Tokens consommés:', tokensToConsume, 'Restants:', newTokenCount, 'pour userId:', userId);

    // Enregistrer l'utilisation dans token_usage pour l'historique "Mes dernières utilisations"
    if (moduleId && moduleId !== 'test') {
      const now = new Date().toISOString();
      
      // Créer une entrée dans token_usage pour l'historique
      const { error: tokenUsageError } = await supabase
        .from('token_usage')
        .insert({
          user_id: actualUserId,
          module_id: moduleId,
          module_name: moduleName || moduleId,
          action_type: 'access',
          tokens_consumed: tokensToConsume,
          usage_date: now,
          created_at: now
        });

      if (tokenUsageError) {
        console.error('❌ Erreur enregistrement token_usage:', tokenUsageError);
        // Ne pas faire échouer la requête pour une erreur d'historique
      } else {
        console.log('✅ Utilisation enregistrée dans token_usage pour l\'historique');
      }

      // Enregistrer l'utilisation dans l'historique via user_applications
      // Mettre à jour last_used_at pour l'historique
      // D'abord récupérer le usage_count actuel
      const { data: currentApp, error: fetchError } = await supabase
        .from('user_applications')
        .select('usage_count')
        .eq('user_id', actualUserId)
        .eq('module_id', moduleId)
        .single();

      if (!fetchError && currentApp) {
        const { error: historyError } = await supabase
          .from('user_applications')
          .update({
            last_used_at: now,
            usage_count: (currentApp.usage_count || 0) + 1
          })
          .eq('user_id', actualUserId)
          .eq('module_id', moduleId);

        if (historyError) {
          console.error('❌ Erreur enregistrement historique user_applications:', historyError);
          // Ne pas faire échouer la requête pour une erreur d'historique
        } else {
          console.log('✅ Utilisation enregistrée dans user_applications');
        }
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