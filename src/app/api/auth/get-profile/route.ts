import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email } = body;

    if (!userId && !email) {
      return NextResponse.json(
        { error: 'userId ou email requis' },
        { status: 400 }
      );
    }

    // Récupérer le profil depuis la base de données
    let profile;
    if (userId) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erreur lors de la récupération du profil:', error);
        return NextResponse.json(
          { error: 'Erreur lors de la récupération du profil' },
          { status: 500 }
        );
      }
      profile = data;
    } else if (email) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erreur lors de la récupération du profil:', error);
        return NextResponse.json(
          { error: 'Erreur lors de la récupération du profil' },
          { status: 500 }
        );
      }
      profile = data;
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'Profil non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      is_active: profile.is_active,
      email_verified: profile.email_verified,
      created_at: profile.created_at,
      updated_at: profile.updated_at
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération du profil:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}


























