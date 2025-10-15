import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    ;
    
    const body = await request.json();
    const { userId } = body;
    
    if (!userId) {
      return new NextResponse('Missing userId', { status: 400 });
    }

    // 🪙 NOUVELLE VÉRIFICATION DES TOKENS : Vérifier que l'utilisateur a au moins 1 token
    try {
      // Récupérer le solde actuel
      const { data: userTokens, error: tokensError } = await supabase
        .from('user_tokens')
        .select('tokens')
        .eq('user_id', userId)
        .single();

      let currentTokens = 10; // Valeur par défaut
      
      if (!tokensError && userTokens) {
        currentTokens = userTokens.tokens;
      } else {
        // Créer une entrée par défaut si elle n'existe pas
        const { error: insertError } = await supabase
          .from('user_tokens')
          .insert([{
            user_id: userId,
            tokens: 10
          }]);

        if (insertError) {
          console.log('⚠️ LibreSpeed: Table user_tokens non disponible, autorisation par défaut');
        }
      }

      // Vérifier si l'utilisateur a assez de tokens (10 tokens requis)
      if (currentTokens < 10) {
        console.log('❌ LibreSpeed Access: Tokens insuffisants pour userId:', userId);
        return NextResponse.json({
          hasAccess: false,
          error: 'Tokens insuffisants',
          currentTokens: currentTokens,
          requiredTokens: 10
        });
      }

      ;

    } catch (error) {
      console.log('⚠️ LibreSpeed: Table user_tokens non disponible, autorisation par défaut');
    }

    return NextResponse.json({
      hasAccess: true,
      tokens: [], // Pas de tokens d'accès pour l'instant
      count: 1
    });

  } catch (error) {
    console.error('❌ Check LibreSpeed Access Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}