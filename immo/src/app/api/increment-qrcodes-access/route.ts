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

  const moduleId = 'qrcodes';
  const tokensToConsume = 100;

  try {
    // 1. Récupérer l'application utilisateur pour QR Codes
    const { data: userApp, error: appError } = await supabase
      .from('user_applications')
      .select('id, usage_count, max_usage, expires_at')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .single();

    if (appError || !userApp) {
      console.error('❌ QR Codes Access: Erreur récupération application utilisateur:', appError);
      return new NextResponse(JSON.stringify({
        success: false,
        error: 'Accès QR Codes non trouvé pour cet utilisateur'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { id: userAppId, usage_count: currentUsage, max_usage: maxUsage } = userApp;

    // 2. Vérifier et consommer les tokens
    const { data: userTokens, error: tokensError } = await supabase
      .from('user_tokens')
      .select('tokens')
      .eq('user_id', userId)
      .single();

    if (tokensError || !userTokens) {
      console.error('❌ QR Codes Access: Erreur récupération tokens:', tokensError);
      return new NextResponse(JSON.stringify({
        success: false,
        error: 'Profil utilisateur non trouvé'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (userTokens.tokens < tokensToConsume) {
      console.log('❌ QR Codes Access: Tokens insuffisants:', userTokens.tokens);
      return new NextResponse(JSON.stringify({
        success: false,
        error: 'Tokens insuffisants',
        message: `${tokensToConsume} tokens requis pour utiliser QR Codes. Tokens disponibles: ${userTokens.tokens}`
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Consommer les tokens
    const { error: updateTokensError } = await supabase
      .from('user_tokens')
      .update({ 
        tokens: userTokens.tokens - tokensToConsume,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateTokensError) {
      console.error('❌ QR Codes Access: Erreur consommation tokens:', updateTokensError);
      return new NextResponse(JSON.stringify({
        success: false,
        error: 'Plus de tokens ? Rechargez',
        message: 'Plus de tokens ? Rechargez',
        pricingUrl: 'https://iahome.fr/pricing'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. Incrémenter le compteur dans user_applications et mettre à jour last_used_at
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
      console.error('❌ QR Codes Access: Erreur mise à jour user_applications:', updateAppError);
      // Rollback: remettre les tokens si l'incrémentation échoue
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

    console.log('✅ QR Codes Access: Compteur incrémenté:', newUsageCount, '/', maxUsage);
    console.log(`✅ QR Codes Access: ${tokensToConsume} tokens consommés. Restants:`, userTokens.tokens - tokensToConsume);

    // Vérifier si le quota est atteint (fin d'utilisation)
    const isQuotaReached = maxUsage && newUsageCount >= maxUsage;
    
    if (isQuotaReached) {
      console.log('⚠️ QR Codes Access: Quota atteint, workflow doit être réinitialisé');
    }

    return new NextResponse(JSON.stringify({
      success: true,
      usage_count: updatedApp.usage_count,
      max_usage: updatedApp.max_usage,
      last_accessed_at: updatedApp.last_accessed_at,
      tokens_consumed: tokensToConsume,
      tokens_remaining: userTokens.tokens - tokensToConsume,
      shouldResetWorkflow: isQuotaReached // Flag pour réinitialiser le workflow
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erreur inattendue lors de l\'accès à QR Codes:', error);
    return new NextResponse(JSON.stringify({
      success: false,
      error: `Erreur serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
