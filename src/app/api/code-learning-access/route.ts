import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

export async function POST(request: NextRequest) {
  try {
    const { userId, userEmail } = await request.json();

    if (!userId && !userEmail) {
      return NextResponse.json({ 
        success: false, 
        error: 'userId ou userEmail requis' 
      }, { status: 400 });
    }

    let targetUserId = userId;

    if (!userId && userEmail) {
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userEmail)
        .single();

      if (userError || !userData) {
        return NextResponse.json({ 
          success: false, 
          error: 'Utilisateur non trouvé' 
        }, { status: 404 });
      }

      targetUserId = userData.id;
    }

    // Vérifier l'accès au module
    const { data: access, error: accessError } = await supabase
      .from('user_applications')
      .select('*')
      .eq('user_id', targetUserId)
      .eq('module_id', 'code-learning')
      .eq('is_active', true)
      .single();

    if (accessError || !access) {
      return NextResponse.json({ 
        success: false, 
        error: 'Accès non autorisé. Activez d\'abord le module.' 
      }, { status: 403 });
    }

    // Vérifier l'expiration
    if (access.expires_at && new Date(access.expires_at) < new Date()) {
      return NextResponse.json({ 
        success: false, 
        error: 'Accès expiré' 
      }, { status: 403 });
    }

    // Vérifier et consommer les tokens (10 tokens)
    const { data: userTokens, error: tokensError } = await supabase
      .from('user_tokens')
      .select('tokens')
      .eq('user_id', targetUserId)
      .single();

    if (tokensError || !userTokens) {
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur lors de la vérification des tokens' 
      }, { status: 500 });
    }

    if (userTokens.tokens < 10) {
      return NextResponse.json({ 
        success: false, 
        error: 'Tokens insuffisants. 10 tokens requis.' 
      }, { status: 403 });
    }

    // Consommer les tokens
    const { error: updateError } = await supabase
      .from('user_tokens')
      .update({ 
        tokens: userTokens.tokens - 10,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', targetUserId);

    if (updateError) {
      console.error('Erreur consommation tokens:', updateError);
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur lors de la consommation des tokens' 
      }, { status: 500 });
    }

    // Incrémenter le compteur d'usage
    await supabase
      .from('user_applications')
      .update({ 
        usage_count: (access.usage_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', access.id);

    return NextResponse.json({
      success: true,
      message: 'Accès autorisé',
      url: '/code-learning',
      tokensRemaining: userTokens.tokens - 10
    });

  } catch (error) {
    console.error('Erreur code-learning-access:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}

