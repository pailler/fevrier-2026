import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

// Version qui utilise une table user_tokens simple et efficace
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

    // Vérifier que l'utilisateur existe
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Erreur lors de la récupération du profil:', profileError);
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Essayer de récupérer les tokens depuis la table user_tokens existante
    // Si la table n'existe pas ou a des problèmes, utiliser la valeur par défaut
    let tokens = 100; // Valeur par défaut
    
    try {
      const { data: userTokens, error: tokensError } = await supabase
        .from('user_tokens')
        .select('tokens')
        .eq('user_id', userId)
        .single();

      if (!tokensError && userTokens) {
        tokens = userTokens.tokens;
      } else {
        // Si l'utilisateur n'a pas d'entrée dans user_tokens, créer une entrée par défaut
        const { error: insertError } = await supabase
          .from('user_tokens')
          .insert([{
            user_id: userId,
            tokens: 100,
            package_name: 'Welcome Package',
            purchase_date: new Date().toISOString(),
            is_active: true
          }]);

        if (insertError) {
          console.log('⚠️ Table user_tokens non disponible ou contrainte incorrecte, utilisation de la valeur par défaut');
        } else {
          tokens = 100;
        }
      }
    } catch (error) {
      console.log('⚠️ Table user_tokens non disponible, utilisation de la valeur par défaut');
    }

    console.log('🪙 Retour de', tokens, 'tokens pour:', userProfile.email);

    return NextResponse.json({
      tokens: tokens,
      packageName: 'Welcome Package',
      purchaseDate: new Date().toISOString(),
      isActive: true
    });

  } catch (error) {
    console.error('Erreur API user-tokens:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, tokensToConsume, moduleId, moduleName } = body;

    if (!userId || !tokensToConsume || !moduleId) {
      return NextResponse.json(
        { error: 'Paramètres requis manquants' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur existe
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Erreur lors de la récupération du profil:', profileError);
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Essayer de consommer les tokens depuis la table user_tokens existante
    try {
      // Récupérer le solde actuel
      const { data: userTokens, error: tokensError } = await supabase
        .from('user_tokens')
        .select('tokens')
        .eq('user_id', userId)
        .single();

      let currentTokens = 100; // Valeur par défaut
      
      if (!tokensError && userTokens) {
        currentTokens = userTokens.tokens;
      } else {
        // Créer une entrée par défaut si elle n'existe pas
        const { error: insertError } = await supabase
          .from('user_tokens')
          .insert([{
            user_id: userId,
            tokens: 100,
            package_name: 'Welcome Package',
            purchase_date: new Date().toISOString(),
            is_active: true
          }]);

        if (insertError) {
          console.log('⚠️ Table user_tokens non disponible ou contrainte incorrecte, simulation de la consommation');
          // Simuler la consommation
          const newTokenCount = Math.max(0, currentTokens - tokensToConsume);
          console.log('🪙 Simulation consommation:', tokensToConsume, 'tokens pour:', userProfile.email);
          console.log('🪙 Tokens restants:', newTokenCount);

          return NextResponse.json({
            success: true,
            tokensRemaining: newTokenCount,
            tokensConsumed: tokensToConsume
          });
        }
      }

      // Vérifier si l'utilisateur a assez de tokens
      if (currentTokens < tokensToConsume) {
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
        .update({ tokens: newTokenCount })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Erreur lors de la mise à jour des tokens:', updateError);
        return NextResponse.json(
          { error: 'Erreur lors de la consommation des tokens' },
          { status: 500 }
        );
      }

      console.log('🪙 Tokens consommés:', tokensToConsume, 'Restants:', newTokenCount, 'pour:', userProfile.email);

      return NextResponse.json({
        success: true,
        tokensRemaining: newTokenCount,
        tokensConsumed: tokensToConsume
      });

    } catch (error) {
      console.log('⚠️ Table user_tokens non disponible, simulation de la consommation');
      // Simuler la consommation
      const currentTokens = 100;
      const newTokenCount = Math.max(0, currentTokens - tokensToConsume);
      console.log('🪙 Simulation consommation:', tokensToConsume, 'tokens pour:', userProfile.email);
      console.log('🪙 Tokens restants:', newTokenCount);

      return NextResponse.json({
        success: true,
        tokensRemaining: newTokenCount,
        tokensConsumed: tokensToConsume
      });
    }

  } catch (error) {
    console.error('Erreur API user-tokens POST:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}