import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

/**
 * GET /api/get-session-start-time
 * Récupère la date de début de session depuis la table user_sessions
 * Query params: userId
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId est requis' },
        { status: 400 }
      );
    }

    // Récupérer la session active la plus récente pour cet utilisateur
    const { data: session, error } = await supabase
      .from('user_sessions')
      .select('created_at')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('❌ Erreur lors de la récupération de la session:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération de la session' },
        { status: 500 }
      );
    }

    if (!session) {
      return NextResponse.json(
        { error: 'Aucune session active trouvée' },
        { status: 404 }
      );
    }

    // Convertir la date en timestamp (millisecondes)
    const sessionStartTime = new Date(session.created_at).getTime();

    return NextResponse.json({
      success: true,
      sessionStartTime
    });

  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération de la date de début de session:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}


