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

      if (tokensError || !userTokens) {
        // L'utilisateur n'a pas de tokens, pas d'accès
        console.log('❌ LibreSpeed Access: Utilisateur sans tokens pour userId:', userId);
        return NextResponse.json({
          hasAccess: false,
          error: 'Crédits insuffisants',
          currentTokens: 0,
          requiredTokens: 10,
          message: 'Vous devez acheter des tokens pour utiliser ce service'
        });
      }

      const currentTokens = userTokens.tokens || 0;

      // Vérifier si l'utilisateur a assez de tokens (10 tokens requis)
      if (currentTokens < 10) {
        console.log('❌ LibreSpeed Access: Crédits insuffisants pour userId:', userId);
        return NextResponse.json({
          hasAccess: false,
          error: 'Crédits insuffisants',
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