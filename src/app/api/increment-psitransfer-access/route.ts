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
      .select('id, usage_count, module_id')
      .eq('user_id', userId)
      .eq('module_id', 'psitransfer')
      .eq('is_active', true)
      .single();

    console.log('🔍 PsiTransfer Access: Résultat recherche:', { userApp, appError });

    if (appError || !userApp) {
      console.error('❌ PsiTransfer Access: Module non trouvé ou inactif:', appError);
      return new NextResponse(JSON.stringify({
        success: false,
        error: 'PsiTransfer : aucun accès enregistré pour ce compte'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const currentUsage = userApp.usage_count || 0;

    // Vérifier et consommer 10 tokens
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
      console.log('❌ PsiTransfer Access: Crédits insuffisants:', userTokens.tokens);
      return new NextResponse(JSON.stringify({
        success: false,
        error: 'Crédits insuffisants',
        message: '10 crédits requis pour utiliser PsiTransfer. Crédits disponibles: ' + userTokens.tokens
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
        error: 'Plus de crédits ? Rechargez',
        message: 'Plus de crédits ? Rechargez',
        pricingUrl: 'https://iahome.fr/pricing2'
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

    console.log('✅ PsiTransfer Access: Compteur incrémenté:', newUsageCount);
    console.log('✅ PsiTransfer Access: 10 crédits consommés. Restants:', userTokens.tokens - 10);

    return new NextResponse(JSON.stringify({
      success: true,
      usage_count: updatedApp.usage_count,
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
