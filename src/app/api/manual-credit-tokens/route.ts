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
      .select('tokens, package_name, purchase_date')
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

    // Mettre à jour ou créer les tokens (upsert)
    const upsertData: any = {
      user_id: profile.id,
      tokens: newTokenCount,
      is_active: true,
      updated_at: new Date().toISOString()
    };

    // Préserver les champs existants ou les initialiser si nouvelle entrée
    if (existingTokens) {
      // Préserver package_name et purchase_date existants
      if (existingTokens.package_name) {
        upsertData.package_name = existingTokens.package_name;
      }
      if (existingTokens.purchase_date) {
        upsertData.purchase_date = existingTokens.purchase_date;
      }
    } else {
      // Nouvelle entrée : initialiser les champs
      upsertData.package_name = 'Manual Credit';
      upsertData.purchase_date = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('user_tokens')
      .upsert(upsertData, {
        onConflict: 'user_id'
      });

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
