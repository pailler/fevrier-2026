import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/utils/supabaseService';

// GET - Récupérer les critères de recherche de l'utilisateur
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

    const { data, error } = await supabase
      .from('real_estate_search_criteria')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ criteria: data || [] });

  } catch (error: any) {
    console.error('Erreur lors de la récupération des critères:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des critères', message: error.message },
      { status: 500 }
    );
  }
}

// POST - Créer ou mettre à jour des critères de recherche
export async function POST(request: NextRequest) {
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
    const {
      id,
      name,
      minPrice,
      maxPrice,
      minSurface,
      maxSurface,
      region,
      department,
      city,
      propertyType,
      stylePreferences,
      keywords
    } = body;

    if (!name || !minPrice || !maxPrice || !region) {
      return NextResponse.json(
        { error: 'Champs requis: name, minPrice, maxPrice, region' },
        { status: 400 }
      );
    }

    const criteriaData = {
      user_id: user.id,
      name,
      min_price: minPrice,
      max_price: maxPrice,
      min_surface: minSurface || null,
      max_surface: maxSurface || null,
      region,
      department: department || null,
      city: city || null,
      property_type: propertyType || 'house',
      style_preferences: stylePreferences || {},
      keywords: keywords || []
    };

    let data;
    let error;

    if (id) {
      // Mise à jour
      const { data: updated, error: updateError } = await supabase
        .from('real_estate_search_criteria')
        .update(criteriaData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      data = updated;
      error = updateError;
    } else {
      // Création
      const { data: created, error: createError } = await supabase
        .from('real_estate_search_criteria')
        .insert(criteriaData)
        .select()
        .single();

      data = created;
      error = createError;
    }

    if (error) {
      throw error;
    }

    return NextResponse.json({ criteria: data });

  } catch (error: any) {
    console.error('Erreur lors de la sauvegarde des critères:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde des critères', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer des critères de recherche
export async function DELETE(request: NextRequest) {
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID requis' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('real_estate_search_criteria')
      .update({ is_active: false })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Erreur lors de la suppression des critères:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression des critères', message: error.message },
      { status: 500 }
    );
  }
}
