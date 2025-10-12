import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

// GET - Récupérer les tokens de l'utilisateur
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

    // Récupérer les tokens de l'utilisateur
    const { data: userTokens, error: tokenError } = await supabase
      .from('user_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (tokenError && tokenError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Erreur lors de la récupération des tokens:', tokenError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des tokens' },
        { status: 500 }
      );
    }

    // Si l'utilisateur n'a pas de tokens, créer un enregistrement avec 10 tokens par défaut
    if (!userTokens) {
      console.log('🪙 Création automatique de 10 tokens pour le nouvel utilisateur:', userId);
      
      const { error: createError } = await supabase
        .from('user_tokens')
        .upsert([{
          user_id: userId,
          tokens: 10, // 10 tokens par défaut pour les nouveaux utilisateurs
          package_name: 'Welcome Package',
          purchase_date: new Date().toISOString(),
          is_active: true
        }], {
          onConflict: 'user_id'
        });

      if (createError) {
        console.error('Erreur lors de la création des tokens par défaut:', createError);
        return NextResponse.json(
          { error: 'Erreur lors de la création des tokens par défaut' },
          { status: 500 }
        );
      }

      // Retourner les tokens créés
      return NextResponse.json({
        tokens: 10,
        packageName: 'Welcome Package',
        purchaseDate: new Date().toISOString(),
        isActive: true
      });
    }

    // Si l'utilisateur a déjà des tokens, retourner les données existantes
    const tokens = userTokens.tokens;
    const packageName = userTokens.package_name || null;
    const purchaseDate = userTokens.purchase_date || null;

    return NextResponse.json({
      tokens,
      packageName,
      purchaseDate,
      isActive: userTokens.is_active || false
    });

  } catch (error) {
    console.error('Erreur API user-tokens:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST - Consommer des tokens
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

    // Récupérer les tokens actuels de l'utilisateur
    const { data: userTokens, error: tokenError } = await supabase
      .from('user_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (tokenError && tokenError.code !== 'PGRST116') {
      console.error('Erreur lors de la récupération des tokens:', tokenError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des tokens' },
        { status: 500 }
      );
    }

    // Si l'utilisateur n'a pas de tokens, créer un enregistrement avec 10 tokens par défaut
    if (!userTokens) {
      console.log('🪙 Création automatique de 10 tokens pour la consommation:', userId);
      
      const { error: createError } = await supabase
        .from('user_tokens')
        .upsert([{
          user_id: userId,
          tokens: 10, // 10 tokens par défaut pour les nouveaux utilisateurs
          package_name: 'Welcome Package',
          purchase_date: new Date().toISOString(),
          is_active: true
        }], {
          onConflict: 'user_id'
        });

      if (createError) {
        console.error('Erreur lors de la création des tokens par défaut:', createError);
        return NextResponse.json(
          { error: 'Erreur lors de la création des tokens par défaut' },
          { status: 500 }
        );
      }

      // Maintenant vérifier si l'utilisateur a assez de tokens après création
      if (10 < tokensToConsume) {
        return NextResponse.json(
          { 
            error: 'Tokens insuffisants',
            currentTokens: 10,
            requiredTokens: tokensToConsume,
            insufficient: true
          },
          { status: 400 }
        );
      }

      // Consommer les tokens
      const newTokenCount = 10 - tokensToConsume;
      
      const { error: updateError } = await supabase
        .from('user_tokens')
        .update({
          tokens: newTokenCount
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Erreur lors de la mise à jour des tokens:', updateError);
        return NextResponse.json(
          { error: 'Erreur lors de la consommation des tokens' },
          { status: 500 }
        );
      }

      // Enregistrer l'utilisation des tokens
      const { error: usageError } = await supabase
        .from('token_usage')
        .insert([{
          user_id: userId,
          module_id: moduleId,
          module_name: moduleName || 'Unknown Module',
          tokens_consumed: tokensToConsume,
          usage_date: new Date().toISOString()
        }]);

      if (usageError) {
        console.error('Erreur lors de l\'enregistrement de l\'utilisation:', usageError);
        // Ne pas faire échouer la transaction pour cette erreur
      }

      return NextResponse.json({
        success: true,
        tokensRemaining: newTokenCount,
        tokensConsumed: tokensToConsume
      });
    }

    const currentTokens = userTokens.tokens;

    if (currentTokens < tokensToConsume) {
      return NextResponse.json(
        { 
          error: 'Tokens insuffisants',
          currentTokens,
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
      .upsert([
        {
          user_id: userId,
          tokens: newTokenCount,
          package_name: userTokens?.package_name || 'Unknown',
          purchase_date: userTokens?.purchase_date || new Date().toISOString(),
          is_active: true
        }
      ], {
        onConflict: 'user_id'
      });

    if (updateError) {
      console.error('Erreur lors de la mise à jour des tokens:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de la consommation des tokens' },
        { status: 500 }
      );
    }

    // Enregistrer l'utilisation des tokens
    const { error: usageError } = await supabase
      .from('token_usage')
      .insert([
        {
          user_id: userId,
          module_id: moduleId,
          module_name: moduleName || 'Unknown Module',
          tokens_consumed: tokensToConsume,
          usage_date: new Date().toISOString()
        }
      ]);

    if (usageError) {
      console.error('Erreur lors de l\'enregistrement de l\'utilisation:', usageError);
      // Ne pas faire échouer la transaction pour cette erreur
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

// PUT - Ajouter des tokens (pour les tests ou les ajustements)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, tokensToAdd, packageName = 'Manual Addition' } = body;

    if (!userId || !tokensToAdd) {
      return NextResponse.json(
        { error: 'ID utilisateur et nombre de tokens requis' },
        { status: 400 }
      );
    }

    // Récupérer les tokens actuels
    const { data: userTokens, error: tokenError } = await supabase
      .from('user_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    const currentTokens = userTokens?.tokens || 0;
    const newTokenCount = currentTokens + tokensToAdd;

    // Mettre à jour ou créer l'enregistrement
    const { error: updateError } = await supabase
      .from('user_tokens')
      .upsert([
        {
          user_id: userId,
          tokens: newTokenCount,
          package_name: packageName,
          purchase_date: userTokens?.purchase_date || new Date().toISOString(),
          is_active: true
        }
      ], {
        onConflict: 'user_id'
      });

    if (updateError) {
      console.error('Erreur lors de l\'ajout des tokens:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de l\'ajout des tokens' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tokensAdded: tokensToAdd,
      totalTokens: newTokenCount
    });

  } catch (error) {
    console.error('Erreur API user-tokens PUT:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

