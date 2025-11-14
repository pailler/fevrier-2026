import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Vérification des tokens de tous les utilisateurs...');

    // Récupérer tous les tokens
    const { data: tokens, error: tokensError } = await supabase
      .from('user_tokens')
      .select('user_id, tokens, package_name, created_at, updated_at')
      .order('tokens', { ascending: false });

    if (tokensError) {
      console.error('❌ Erreur récupération tokens:', tokensError);
      return NextResponse.json({ error: 'Erreur récupération tokens' }, { status: 500 });
    }

    // Récupérer les informations des utilisateurs
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email');

    if (usersError) {
      console.error('❌ Erreur récupération utilisateurs:', usersError);
      return NextResponse.json({ error: 'Erreur récupération utilisateurs' }, { status: 500 });
    }

    // Combiner les données
    const combinedData = tokens?.map(token => {
      const user = users?.find(u => u.id === token.user_id);
      return {
        user_id: token.user_id,
        email: user?.email || 'Email non trouvé',
        tokens: token.tokens,
        package_name: token.package_name,
        created_at: token.created_at,
        updated_at: token.updated_at
      };
    }) || [];

    console.log('✅ Vérification terminée');
    console.log(`📊 ${combinedData.length} utilisateurs avec des tokens`);

    return NextResponse.json({
      success: true,
      message: 'Vérification des tokens terminée',
      totalUsers: combinedData.length,
      users: combinedData
    });

  } catch (error) {
    console.error('❌ Erreur vérification tokens:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}









































