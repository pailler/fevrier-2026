import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    // Récupérer l'UUID de l'utilisateur
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ 
        exists: false, 
        error: 'Utilisateur non trouvé dans profiles' 
      });
    }

    // Vérifier si l'utilisateur existe dans user_tokens
    const { data: userTokens, error: tokensError } = await supabase
      .from('user_tokens')
      .select('*')
      .eq('user_id', profile.id)
      .single();

    if (tokensError) {
      return NextResponse.json({ 
        exists: false, 
        error: tokensError.message,
        userId: profile.id
      });
    }

    return NextResponse.json({ 
      exists: true, 
      userTokens: userTokens,
      userId: profile.id
    });

  } catch (error) {
    console.error('Erreur vérification user_tokens:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}



