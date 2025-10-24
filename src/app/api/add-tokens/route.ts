import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { userId, tokensToAdd, reason } = await request.json();
    
    if (!userId || !tokensToAdd) {
      return NextResponse.json({ error: 'userId et tokensToAdd requis' }, { status: 400 });
    }

    // Récupérer l'UUID de l'utilisateur si c'est un email
    let actualUserId = userId;
    if (userId.includes('@')) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userId)
        .single();

      if (profileError || !profile) {
        return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
      }
      actualUserId = profile.id;
    }

    // Récupérer les tokens actuels
    const { data: userTokens, error: tokensError } = await supabase
      .from('user_tokens')
      .select('tokens')
      .eq('user_id', actualUserId)
      .single();

    let currentTokens = 0;
    if (tokensError) {
      // Créer une entrée si elle n'existe pas
      const { error: insertError } = await supabase
        .from('user_tokens')
        .insert([{
          user_id: actualUserId,
          tokens: tokensToAdd,
          package_name: 'Manual Addition',
          purchase_date: new Date().toISOString(),
          is_active: true
        }]);

      if (insertError) {
        return NextResponse.json({ error: 'Erreur création entrée tokens' }, { status: 500 });
      }
      currentTokens = tokensToAdd;
    } else {
      currentTokens = userTokens.tokens || 0;
      const newTokenCount = currentTokens + tokensToAdd;
      
      // Mettre à jour les tokens
      const { error: updateError } = await supabase
        .from('user_tokens')
        .update({ 
          tokens: newTokenCount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', actualUserId);

      if (updateError) {
        return NextResponse.json({ error: 'Erreur mise à jour tokens' }, { status: 500 });
      }
      currentTokens = newTokenCount;
    }

    return NextResponse.json({
      success: true,
      tokensAdded: tokensToAdd,
      tokensTotal: currentTokens,
      reason: reason || 'Tokens ajoutés manuellement'
    });

  } catch (error) {
    console.error('Erreur API add-tokens:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}



