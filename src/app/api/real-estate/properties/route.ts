import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/utils/supabaseService';

// GET - Récupérer les propriétés
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const searchCriteriaId = searchParams.get('searchCriteriaId');
    const isNew = searchParams.get('isNew');
    const isFavorite = searchParams.get('isFavorite');
    const source = searchParams.get('source');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('real_estate_properties')
      .select(`
        *,
        real_estate_search_criteria!inner(user_id)
      `)
      .eq('real_estate_search_criteria.user_id', user.id)
      .eq('is_archived', false)
      .order('first_seen_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (searchCriteriaId) {
      query = query.eq('search_criteria_id', searchCriteriaId);
    }

    if (isNew === 'true') {
      query = query.eq('is_new', true);
    }

    if (isFavorite === 'true') {
      query = query.eq('is_favorite', true);
    }

    if (source) {
      query = query.eq('source', source);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ properties: data || [] });

  } catch (error: any) {
    console.error('Erreur lors de la récupération des propriétés:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des propriétés', message: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour une propriété (favoris, notes, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, isFavorite, isViewed, isArchived, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur a accès à cette propriété
    const { data: property } = await supabase
      .from('real_estate_properties')
      .select(`
        *,
        real_estate_search_criteria!inner(user_id)
      `)
      .eq('id', id)
      .eq('real_estate_search_criteria.user_id', user.id)
      .single();

    if (!property) {
      return NextResponse.json(
        { error: 'Propriété non trouvée ou accès refusé' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (isFavorite !== undefined) updateData.is_favorite = isFavorite;
    if (isViewed !== undefined) updateData.is_viewed = isViewed;
    if (isArchived !== undefined) updateData.is_archived = isArchived;
    if (notes !== undefined) updateData.notes = notes;

    const { data: updated, error: updateError } = await supabase
      .from('real_estate_properties')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ property: updated });

  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de la propriété:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la propriété', message: error.message },
      { status: 500 }
    );
  }
}
