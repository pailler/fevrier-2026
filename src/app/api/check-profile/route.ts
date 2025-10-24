import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    // Vérifier si l'utilisateur existe dans profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single();

    if (profileError) {
      return NextResponse.json({ 
        exists: false, 
        error: profileError.message 
      });
    }

    return NextResponse.json({ 
      exists: true, 
      profile: profile 
    });

  } catch (error) {
    console.error('Erreur vérification profile:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}



