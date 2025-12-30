import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

// GET - Récupérer tous les services (optionnel: filtrer par category_id)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category_id');

    let query = supabase
      .from('administration_services')
      .select(`
        *,
        category:administration_categories(id, name, icon, color)
      `)
      .order('display_order', { ascending: true });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération des services:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// POST - Créer un nouveau service
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      category_id, 
      name, 
      description, 
      url, 
      icon, 
      is_popular, 
      app_store_url, 
      play_store_url,
      display_order,
      is_active 
    } = body;

    if (!category_id || !name || !url) {
      return NextResponse.json({
        success: false,
        error: 'Les champs category_id, name et url sont requis'
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('administration_services')
      .insert([{
        category_id,
        name,
        description: description || null,
        url,
        icon: icon || '🔗',
        is_popular: is_popular || false,
        app_store_url: app_store_url || null,
        play_store_url: play_store_url || null,
        display_order: display_order || 0,
        is_active: is_active !== undefined ? is_active : true
      }])
      .select(`
        *,
        category:administration_categories(id, name, icon, color)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('❌ Erreur lors de la création du service:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

