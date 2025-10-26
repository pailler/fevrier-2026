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

    let tokens = 100; // Valeur par défaut
    let packageName = 'Welcome Package';
    let purchaseDate = new Date().toISOString();
    let isActive = true;

    if (tokensError) {
      console.error('❌ Erreur récupération tokens:', tokensError);
      
      // Si l'utilisateur n'a pas d'entrée dans user_tokens, créer une entrée par défaut
      console.log('🔄 Création d\'une entrée par défaut pour userId:', userId);
      
      const { error: insertError } = await supabase
        .from('user_tokens')
        .insert([{
          user_id: actualUserId,
          tokens: 100,
          package_name: 'Welcome Package',
          purchase_date: new Date().toISOString(),
          is_active: true
        }]);

      if (insertError) {
        console.error('❌ Erreur création entrée par défaut:', insertError);
        // Utiliser les valeurs par défaut
      } else {
        console.log('✅ Entrée par défaut créée pour userId:', userId);
        tokens = 100;
      }
    } else if (userTokens) {
      // Utiliser les vraies valeurs de la base de données
      tokens = userTokens.tokens !== null ? userTokens.tokens : 100;
      packageName = userTokens.package_name || 'Welcome Package';
      purchaseDate = userTokens.purchase_date || new Date().toISOString();
      isActive = userTokens.is_active !== false;
      
      console.log('✅ Tokens récupérés depuis la DB:', tokens, 'pour userId:', userId);
    }

    console.log('🪙 Retour de', tokens, 'tokens pour userId:', userId);

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

    let currentTokens = 100; // Valeur par défaut
    
    if (tokensError) {
      console.error('❌ Erreur récupération tokens pour consommation:', tokensError);
      
      // Créer une entrée par défaut si elle n'existe pas
      console.log('🔄 Création d\'une entrée par défaut pour consommation userId:', userId);
      
      const { error: insertError } = await supabase
        .from('user_tokens')
        .insert([{
          user_id: actualUserId,
          tokens: 100,
          package_name: 'Welcome Package',
          purchase_date: new Date().toISOString(),
          is_active: true
        }]);

      if (insertError) {
        console.error('❌ Erreur création entrée par défaut pour consommation:', insertError);
        return NextResponse.json(
          { error: 'Impossible de créer l\'entrée de tokens' },
          { status: 500 }
        );
      } else {
        console.log('✅ Entrée par défaut créée pour consommation userId:', userId);
        currentTokens = 100;
      }
    } else if (userTokens) {
      currentTokens = userTokens.tokens || 100;
      console.log('✅ Solde actuel récupéré:', currentTokens, 'tokens pour userId:', userId);
    }

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

    // Enregistrer l'utilisation dans l'historique via user_applications
    // Mettre à jour last_used_at pour l'historique
    if (moduleId && moduleId !== 'test') {
      // D'abord récupérer le usage_count actuel
      const { data: currentApp, error: fetchError } = await supabase
        .from('user_applications')
        .select('usage_count')
        .eq('user_id', userId)
        .eq('module_id', moduleId)
        .single();

      if (!fetchError && currentApp) {
        const { error: historyError } = await supabase
          .from('user_applications')
          .update({
            last_used_at: new Date().toISOString(),
            usage_count: (currentApp.usage_count || 0) + 1
          })
          .eq('user_id', userId)
          .eq('module_id', moduleId);

        if (historyError) {
          console.error('❌ Erreur enregistrement historique:', historyError);
          // Ne pas faire échouer la requête pour une erreur d'historique
        } else {
          console.log('✅ Utilisation enregistrée dans l\'historique');
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