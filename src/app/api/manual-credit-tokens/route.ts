import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { userEmail, tokens, reason } = await request.json();
    
    console.log('🔄 Crédit manuel de tokens:', { userEmail, tokens, reason });

    if (!userEmail || !tokens) {
      return NextResponse.json(
        { error: 'Email et tokens requis' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur par email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (profileError || !profile) {
      console.error('❌ Utilisateur non trouvé:', userEmail);
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier les tokens actuels
    const { data: existingTokens, error: tokensError } = await supabase
      .from('user_tokens')
      .select('tokens')
      .eq('user_id', profile.id)
      .single();

    if (tokensError && tokensError.code !== 'PGRST116') {
      console.error('❌ Erreur récupération tokens:', tokensError);
      return NextResponse.json(
        { error: 'Erreur récupération tokens' },
        { status: 500 }
      );
    }

    const currentTokens = existingTokens?.tokens || 0;
    const newTokenCount = currentTokens + tokens;

    // Mettre à jour les tokens
    const { error: updateError } = await supabase
      .from('user_tokens')
      .update({
        tokens: newTokenCount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', profile.id);

    if (updateError) {
      console.error('❌ Erreur mise à jour tokens:', updateError);
      return NextResponse.json(
        { error: 'Erreur mise à jour tokens' },
        { status: 500 }
      );
    }

    console.log(`✅ Tokens crédités: ${tokens} pour ${userEmail} (Total: ${newTokenCount})`);

    return NextResponse.json({
      success: true,
      message: `Tokens crédités: ${tokens}`,
      newTokenCount,
      reason: reason || 'Crédit manuel'
    });

  } catch (error) {
    console.error('❌ Erreur crédit manuel:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
