import { NextRequest, NextResponse } from 'next/server';
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

    // Récupérer les collections de l'utilisateur
    const { data: collections, error } = await supabase
      .from('photo_collections')
      .select(`
        *,
        cover_photo:photo_metadata(*),
        _count:collection_photos(count)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      collections: collections || []
    });

  } catch (error) {
    console.error('Erreur récupération collections:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des collections' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, isPublic = false, userId } = await request.json();

    if (!name || !userId) {
      return NextResponse.json(
        { error: 'Nom et userId requis' },
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

    // Créer la collection
    const { data: collection, error } = await supabase
      .from('photo_collections')
      .insert({
        user_id: userId,
        name,
        description,
        is_public: isPublic
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      collection
    });

  } catch (error) {
    console.error('Erreur création collection:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la collection' },
      { status: 500 }
    );
  }
}
