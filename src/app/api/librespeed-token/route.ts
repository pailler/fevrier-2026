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
    
    // Variable pour stocker le nombre de tokens restants
    let currentTokens = 0;
    
    // 🪙 GESTION DES TOKENS : Vérifier et consommer 10 tokens
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
          console.log('⚠️ LibreSpeed: Table user_tokens non disponible, simulation de la consommation');
          // Simuler la consommation
          const newTokenCount = Math.max(0, currentTokens - 10);
          console.log('🪙 LibreSpeed: Simulation consommation: 10 tokens pour:', userEmail);
          console.log('🪙 LibreSpeed: Tokens restants:', newTokenCount);

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
        }
      }

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
          error: 'Erreur lors de la consommation des tokens'
        }), { 
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }

      console.log('🪙 LibreSpeed: Token consommé: 10, Restants:', newTokenCount, 'pour:', userEmail);
      currentTokens = newTokenCount; // Mettre à jour currentTokens pour la réponse

    } catch (error) {
      console.log('⚠️ LibreSpeed: Table user_tokens non disponible, simulation de la consommation');
      // Simuler la consommation
      const initialTokens = 10;
      const newTokenCount = Math.max(0, initialTokens - 10);
      console.log('🪙 LibreSpeed: Simulation consommation: 10 tokens pour:', userEmail);
      console.log('🪙 LibreSpeed: Tokens restants:', newTokenCount);
      currentTokens = newTokenCount; // Mettre à jour currentTokens pour la réponse
    }
    
    // Générer un token aléatoire simple
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    console.log('✅ LibreSpeed Token: Token généré avec succès');
    return new NextResponse(JSON.stringify({
      success: true,
      token: token,
      expiresIn: 300, // 5 minutes
      tokensConsumed: 10,
      tokensRemaining: currentTokens
    }), { 
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

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
    console.log('✅ LibreSpeed Token: Token validé:', token.substring(0, 10) + '...');
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