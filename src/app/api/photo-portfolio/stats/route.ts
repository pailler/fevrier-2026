import { NextRequest, NextResponse } from 'next/server';
import { PhotoAnalysisService } from '@/utils/photoAnalysisService';
import { supabase } from '@/utils/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId requis' },
        { status: 400 }
      );
    }

    // Vérifier l'authentification via les headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token d\'authentification manquant' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    
    // Vérifier le token avec Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user || user.id !== userId) {
      console.error('Erreur d\'authentification:', authError);
      return NextResponse.json(
        { error: 'Non autorisé - Token invalide' },
        { status: 401 }
      );
    }

    // Récupérer les statistiques
    const stats = await PhotoAnalysisService.getUserStats(userId);

    // Récupérer les recherches récentes
    const { data: recentSearches } = await supabase
      .from('saved_searches')
      .select('search_query, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Récupérer les photos les plus vues
    const { data: mostViewed } = await supabase
      .from('photo_analytics')
      .select(`
        photo_id,
        view_count,
        photo_metadata(file_name, file_path)
      `)
      .eq('photo_metadata.user_id', userId)
      .order('view_count', { ascending: false })
      .limit(5);

    return NextResponse.json({
      success: true,
      stats,
      recentSearches: recentSearches || [],
      mostViewed: mostViewed || []
    });

  } catch (error) {
    console.error('Erreur récupération stats:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}
