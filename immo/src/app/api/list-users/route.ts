import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    ;

    // Récupérer tous les utilisateurs
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, full_name, tokens')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('❌ Erreur récupération utilisateurs:', usersError);
      return NextResponse.json({
        error: 'Erreur récupération utilisateurs',
        details: usersError
      }, { status: 500 });
    }

    console.log(`📊 ${users?.length || 0} utilisateurs trouvés`);

    return NextResponse.json({
      success: true,
      count: users?.length || 0,
      users: users || []
    });

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    return NextResponse.json({
      error: 'Erreur générale',
      details: error.message
    }, { status: 500 });
  }
}