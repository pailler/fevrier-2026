import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';
import { TOKEN_COSTS } from '../../../../utils/tokenActionService';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

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
      // Si le profil n'existe pas (PGRST116), retourner un historique vide
      if (profileError.code === 'PGRST116') {
        console.log('⚠️ Profil non trouvé pour userId:', userId, '- retour d\'un historique vide');
        return NextResponse.json({
          success: true,
          history: [],
          total: 0
        });
      }
      
      console.error('Erreur lors de la récupération du profil:', profileError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération du profil', details: profileError.message },
        { status: 500 }
      );
    }

    // Récupérer l'historique depuis user_applications (nouveau système)
    const { data: usageHistory, error: historyError } = await supabase
      .from('user_applications')
      .select(`
        id,
        module_id,
        module_title,
        usage_count,
        last_used_at,
        created_at
      `)
      .eq('user_id', userId)
      .not('last_used_at', 'is', null)
      .order('last_used_at', { ascending: false })
      .limit(limit);

    if (historyError) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Historique user_applications non disponible:', historyError.message);
      }
      return NextResponse.json({
        success: true,
        history: [],
        total: 0
      });
    }

    // Transformer les données avec les coûts depuis TOKEN_COSTS
    const history = (usageHistory || []).map(usage => {
      const moduleId = usage.module_id as keyof typeof TOKEN_COSTS;
      const tokensConsumed = TOKEN_COSTS[moduleId] || 10; // Coût par défaut si module non trouvé
      
      return {
        id: usage.id,
        module_id: usage.module_id,
        module_name: usage.module_title || usage.module_id,
        action_type: 'access',
        tokens_consumed: tokensConsumed,
        usage_date: usage.last_used_at || usage.created_at,
        description: `Accès à ${usage.module_title || usage.module_id}`
      };
    });

    console.log('📊 Historique récupéré depuis user_applications pour:', userProfile.email, '-', history.length, 'entrées');

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
