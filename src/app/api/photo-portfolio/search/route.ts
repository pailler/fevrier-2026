import { NextRequest, NextResponse } from 'next/server';
import { PhotoAnalysisService } from '@/utils/photoAnalysisService';
import { supabase } from '@/utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { query, userId, limit = 10, threshold = 0.7 } = await request.json();

    if (!query || !userId) {
      return NextResponse.json(
        { error: 'Query et userId requis' },
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

    // Effectuer la recherche sémantique
    const results = await PhotoAnalysisService.searchPhotos(query, userId, limit, threshold);

    // Sauvegarder la recherche
    await supabase
      .from('saved_searches')
      .insert({
        user_id: userId,
        search_query: query,
        search_results: results
      });

    return NextResponse.json({
      success: true,
      results,
      query,
      count: results.length
    });

  } catch (error) {
    console.error('Erreur recherche photos:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recherche' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const collectionId = searchParams.get('collectionId');

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

    // Récupérer les photos de l'utilisateur
    const { photos, total } = await PhotoAnalysisService.getUserPhotos(
      userId,
      page,
      limit,
      collectionId || undefined
    );

    return NextResponse.json({
      success: true,
      photos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erreur récupération photos:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des photos' },
      { status: 500 }
    );
  }
}
