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

    // Si l'utilisateur n'a pas de tokens, retourner 0
    // Les tokens ne sont créés QUE lors de l'inscription, pas automatiquement ici
    if (!userTokens) {
      console.log('⚠️ Utilisateur sans tokens (doit passer par les achats):', userId);
      return NextResponse.json({
        tokens: 0,
        packageName: null,
        purchaseDate: null,
        isActive: false
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

    // Si l'utilisateur n'a pas de tokens, il doit passer par les achats
    if (!userTokens) {
      console.log('❌ Utilisateur sans tokens pour consommation:', userId);
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
        { 
          error: 'Plus de tokens ? Rechargez',
          message: 'Plus de tokens ? Rechargez',
          pricingUrl: 'https://iahome.fr/pricing2'
        },
        { status: 500 }
      );
    }

    // L'historique est maintenant géré via user_applications dans le système de tokens

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

