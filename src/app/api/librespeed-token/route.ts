import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    console.log('🔑 LibreSpeed Token: API appelée');
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Cookie',
      'Access-Control-Allow-Credentials': 'true',
    };
    
    const body = await request.json();
    const { userId, userEmail } = body;
    
    if (!userId || !userEmail) {
      return new NextResponse('Missing userId or userEmail', { 
        status: 400,
        headers: corsHeaders
      });
    }

    console.log('🔑 LibreSpeed: Génération token pour:', { userId, userEmail });
    
    // 🪙 GESTION DES TOKENS : Vérifier et consommer 10 tokens
    try {
      // Récupérer le solde actuel
      const { data: userTokens, error: tokensError } = await supabase
        .from('user_tokens')
        .select('tokens')
        .eq('user_id', userId)
        .single();

      if (tokensError || !userTokens) {
        // L'utilisateur n'a pas de tokens, il doit passer par les achats
        console.log('❌ LibreSpeed: Utilisateur sans tokens:', userEmail);
        return new NextResponse(JSON.stringify({
          success: false,
          error: 'Tokens insuffisants',
          currentTokens: 0,
          requiredTokens: 10,
          message: 'Vous devez acheter des tokens pour utiliser ce service'
        }), { 
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }

      let currentTokens = userTokens.tokens || 0;

      // Vérifier si l'utilisateur a assez de tokens
      if (currentTokens < 10) {
        return new NextResponse(JSON.stringify({
          success: false,
          error: 'Tokens insuffisants',
          currentTokens: currentTokens,
          requiredTokens: 10
        }), { 
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }

      // Consommer 10 tokens
      const newTokenCount = currentTokens - 10;
      
      const { error: updateError } = await supabase
        .from('user_tokens')
        .update({ tokens: newTokenCount })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Erreur lors de la mise à jour des tokens:', updateError);
        return new NextResponse(JSON.stringify({
          success: false,
          error: 'Plus de tokens ? Rechargez',
          message: 'Plus de tokens ? Rechargez',
          pricingUrl: 'https://iahome.fr/pricing2'
        }), { 
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }

      console.log('🪙 LibreSpeed: Token consommé: 10, Restants:', newTokenCount, 'pour:', userEmail);
      
      // Générer un token aléatoire simple
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      return new NextResponse(JSON.stringify({
        success: true,
        token: token,
        expiresIn: 300, // 5 minutes
        tokensConsumed: 10,
        tokensRemaining: newTokenCount
      }), { 
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });

    } catch (error) {
      console.error('❌ LibreSpeed: Erreur lors de la gestion des tokens:', error);
      return new NextResponse(JSON.stringify({
        success: false,
        error: 'Erreur lors de la vérification des tokens'
      }), { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

  } catch (error) {
    console.error('❌ LibreSpeed Token Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return new NextResponse('Bad Request - No token provided', { status: 400 });
    }

    // Validation simple du token (pour l'instant, accepter tous les tokens)
    // TODO: Implémenter une validation réelle si nécessaire
    ;
    return new NextResponse('Token valid', { status: 200 });

  } catch (error) {
    console.error('❌ LibreSpeed Token Validation Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Cookie',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}