import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

// GET - Récupérer un service par ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from('administration_services')
      .select(`
        *,
        category:administration_categories(id, name, icon, color)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération du service:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// PUT - Mettre à jour un service
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (category_id !== undefined) updateData.category_id = category_id;
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (url !== undefined) updateData.url = url;
    if (icon !== undefined) updateData.icon = icon;
    if (is_popular !== undefined) updateData.is_popular = is_popular;
    if (app_store_url !== undefined) updateData.app_store_url = app_store_url;
    if (play_store_url !== undefined) updateData.play_store_url = play_store_url;
    if (display_order !== undefined) updateData.display_order = display_order;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data, error } = await supabase
      .from('administration_services')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        category:administration_categories(id, name, icon, color)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('❌ Erreur lors de la mise à jour du service:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// DELETE - Supprimer un service
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await supabase
      .from('administration_services')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Service supprimé avec succès' });
  } catch (error: any) {
    console.error('❌ Erreur lors de la suppression du service:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

