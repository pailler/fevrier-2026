import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { userId } = await request.json();
  const supabase = createRouteHandlerClient({ cookies });

  if (!userId) {
    return new NextResponse(JSON.stringify({ success: false, error: 'User ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const moduleId = 'metube';
  const tokensToConsume = 10;

  try {
    const { data: userApp, error: appError } = await supabase
      .from('user_applications')
      .select('id, usage_count, max_usage, expires_at')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .single();

    if (appError || !userApp) {
      console.error('❌ MeTube Access: Erreur récupération application utilisateur:', appError);
      return new NextResponse(JSON.stringify({
        success: false,
        error: 'Accès MeTube non trouvé pour cet utilisateur'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { id: userAppId, usage_count: currentUsage, max_usage: maxUsage } = userApp;

    const { data: userTokens, error: tokensError } = await supabase
      .from('user_tokens')
      .select('tokens')
      .eq('user_id', userId)
      .single();

    if (tokensError || !userTokens) {
      console.error('❌ MeTube Access: Erreur récupération tokens:', tokensError);
      return new NextResponse(JSON.stringify({
        success: false,
        error: 'Profil utilisateur non trouvé'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (userTokens.tokens < tokensToConsume) {
      console.log('❌ MeTube Access: Tokens insuffisants:', userTokens.tokens);
      return new NextResponse(JSON.stringify({
        success: false,
        error: 'Tokens insuffisants',
        message: `${tokensToConsume} tokens requis pour utiliser MeTube. Tokens disponibles: ${userTokens.tokens}`
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { error: updateTokensError } = await supabase
      .from('user_tokens')
      .update({ 
        tokens: userTokens.tokens - tokensToConsume,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateTokensError) {
      console.error('❌ MeTube Access: Erreur consommation tokens:', updateTokensError);
      return new NextResponse(JSON.stringify({
        success: false,
        error: 'Erreur lors de la consommation des tokens'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Incrémenter le compteur dans user_applications et mettre à jour last_used_at
    const newUsageCount = currentUsage + 1;
    const now = new Date().toISOString();
    const { data: updatedApp, error: updateAppError } = await supabase
      .from('user_applications')
      .update({
        usage_count: newUsageCount,
        last_used_at: now,  // Mettre à jour la date de dernière utilisation
        last_accessed_at: now  // Compatibilité (si les deux champs existent)
      })
      .eq('id', userAppId)
      .select()
      .single();

    if (updateAppError) {
      console.error('❌ MeTube Access: Erreur mise à jour user_applications:', updateAppError);
      await supabase
        .from('user_tokens')
        .update({ 
          tokens: userTokens.tokens,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      return new NextResponse(JSON.stringify({
        success: false,
        error: 'Erreur lors de la mise à jour du compteur d\'utilisation'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ MeTube Access: Compteur incrémenté:', newUsageCount, '/', maxUsage);
    console.log(`✅ MeTube Access: ${tokensToConsume} tokens consommés. Restants:`, userTokens.tokens - tokensToConsume);

    return new NextResponse(JSON.stringify({
      success: true,
      usage_count: updatedApp.usage_count,
      max_usage: updatedApp.max_usage,
      last_accessed_at: updatedApp.last_accessed_at,
      tokens_consumed: tokensToConsume,
      tokens_remaining: userTokens.tokens - tokensToConsume
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erreur inattendue lors de l\'accès à MeTube:', error);
    return new NextResponse(JSON.stringify({
      success: false,
      error: `Erreur serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

