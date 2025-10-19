import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../utils/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur existe
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Erreur lors de la récupération du profil:', profileError);
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer l'historique des utilisations de modules
    const { data: usageHistory, error: historyError } = await supabase
      .from('user_applications')
      .select(`
        id,
        module_id,
        usage_count,
        last_used_at,
        created_at
      `)
      .eq('user_id', userId)
      .order('last_used_at', { ascending: false })
      .limit(limit);

    if (historyError) {
      console.error('Erreur lors de la récupération de l\'historique:', historyError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération de l\'historique' },
        { status: 500 }
      );
    }

    // Transformer les données pour correspondre au format attendu
    const history = (usageHistory || []).map(usage => ({
      id: usage.id,
      module_id: usage.module_id,
      module_name: usage.module_id,
      action_type: 'access',
      tokens_consumed: 10, // Coût par défaut
      usage_date: usage.last_used_at || usage.created_at,
      description: `Accès à ${usage.module_id}`
    }));

    console.log('📊 Historique récupéré pour:', userProfile.email, '-', history.length, 'entrées');

    return NextResponse.json({
      success: true,
      history: history,
      total: history.length
    });

  } catch (error) {
    console.error('Erreur API user-tokens history:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
