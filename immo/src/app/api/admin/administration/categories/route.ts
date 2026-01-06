import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

// GET - Récupérer toutes les catégories
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('administration_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, data }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération des catégories:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// POST - Créer une nouvelle catégorie
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, icon, color, description, display_order, is_active } = body;

    if (!name || !icon || !color) {
      return NextResponse.json({
        success: false,
        error: 'Les champs name, icon et color sont requis'
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('administration_categories')
      .insert([{
        name,
        icon,
        color,
        description: description || null,
        display_order: display_order || 0,
        is_active: is_active !== undefined ? is_active : true
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('❌ Erreur lors de la création de la catégorie:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

