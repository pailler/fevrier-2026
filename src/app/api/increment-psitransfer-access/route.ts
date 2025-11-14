import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return new NextResponse(JSON.stringify({
        success: false,
        error: 'userId requis'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('🔍 PsiTransfer Access: Recherche dans user_applications pour userId:', userId);

    // 1. Rechercher l'accès PsiTransfer de l'utilisateur
    const { data: userApp, error: appError } = await supabase
      .from('user_applications')
      .select('id, usage_count, max_usage, expires_at, module_id')
      .eq('user_id', userId)
      .eq('module_id', 'psitransfer')
      .eq('is_active', true)
      .single();

    console.log('🔍 PsiTransfer Access: Résultat recherche:', { userApp, appError });

    if (appError || !userApp) {
      console.error('❌ PsiTransfer Access: Module non trouvé ou inactif:', appError);
      return new NextResponse(JSON.stringify({
        success: false,
        error: 'Application PsiTransfer non activée'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. Vérifier la date d'expiration
    const currentDate = new Date();
    const expiresAt = new Date(userApp.expires_at);
    
    if (expiresAt <= currentDate) {
      console.log('❌ PsiTransfer Access: Module expiré');
      return new NextResponse(JSON.stringify({
        success: false,
        error: 'Application PsiTransfer expirée'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. Vérifier la limite d'usage
    const currentUsage = userApp.usage_count || 0;
    const maxUsage = userApp.max_usage;

    if (maxUsage && currentUsage >= maxUsage) {
      console.log('❌ PsiTransfer Access: Limite d\'usage atteinte:', currentUsage, '/', maxUsage);
      return new NextResponse(JSON.stringify({
        success: false,
        error: 'Limite d\'usage atteinte'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 4. Vérifier et consommer 10 tokens
    const { data: userTokens, error: tokensError } = await supabase
      .from('user_tokens')
      .select('tokens')
      .eq('user_id', userId)
      .single();

    if (tokensError || !userTokens) {
      console.error('❌ PsiTransfer Access: Erreur récupération tokens:', tokensError);
      return new NextResponse(JSON.stringify({
        success: false,
        error: 'Profil utilisateur non trouvé'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (userTokens.tokens < 10) {
      console.log('❌ PsiTransfer Access: Tokens insuffisants:', userTokens.tokens);
      return new NextResponse(JSON.stringify({
        success: false,
        error: 'Tokens insuffisants',
        message: '10 tokens requis pour utiliser PsiTransfer. Tokens disponibles: ' + userTokens.tokens
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 5. Consommer 10 tokens
    const { error: updateTokensError } = await supabase
      .from('user_tokens')
      .update({ 
        tokens: userTokens.tokens - 10,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateTokensError) {
      console.error('❌ PsiTransfer Access: Erreur consommation tokens:', updateTokensError);
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

    // 6. Incrémenter le compteur dans user_applications et mettre à jour last_used_at
    const newUsageCount = currentUsage + 1;
    const nowISO = new Date().toISOString();
    const { data: updatedApp, error: updateAppError } = await supabase
      .from('user_applications')
      .update({
        usage_count: newUsageCount,
        last_used_at: nowISO,  // Mettre à jour la date de dernière utilisation
        last_accessed_at: nowISO  // Compatibilité (si les deux champs existent)
      })
      .eq('id', userApp.id)
      .select()
      .single();

    if (updateAppError) {
      console.error('❌ PsiTransfer Access: Erreur mise à jour user_applications:', updateAppError);
      // Rollback: remettre les tokens
      await supabase
        .from('user_tokens')
        .update({ 
          tokens: userTokens.tokens,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      return new NextResponse('Error updating usage count', { status: 500 });
    }

    console.log('✅ PsiTransfer Access: Compteur incrémenté:', newUsageCount, '/', maxUsage);
    console.log('✅ PsiTransfer Access: 10 tokens consommés. Restants:', userTokens.tokens - 10);

    return new NextResponse(JSON.stringify({
      success: true,
      usage_count: updatedApp.usage_count,
      max_usage: updatedApp.max_usage,
      last_accessed_at: updatedApp.last_accessed_at,
      tokens_consumed: 10,
      tokens_remaining: userTokens.tokens - 10
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ PsiTransfer Access: Erreur:', error);
    return new NextResponse(JSON.stringify({
      success: false,
      error: 'Erreur interne du serveur'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
