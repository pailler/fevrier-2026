import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey } from '@/utils/supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseAnonKey()
);

export async function POST(request: NextRequest) {
  try {
    const { moduleId, userId, moduleTitle, moduleDescription, moduleCategory, moduleUrl } = await request.json();
    
    if (!moduleId || !userId || !moduleTitle) {
      return NextResponse.json({ 
        success: false, 
        error: 'moduleId, userId et moduleTitle requis' 
      }, { status: 400 });
    }

    // Vérifier si l'accès existe déjà
    const { data: existingAccess, error: checkError } = await supabase
      .from('user_applications')
      .select('id')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .eq('is_active', true)
      .single();

    if (existingAccess) {
      return NextResponse.json({ 
        success: true, 
        message: 'Cette appli est déjà enregistrée sur votre compte',
        accessId: existingAccess.id
      });
    }

    const now = new Date().toISOString();
    const { data: accessData, error: accessError } = await supabase
      .from('user_applications')
      .insert({
        user_id: userId,
        module_id: moduleId,
        module_title: moduleTitle,
        access_level: 'basic',
        is_active: true,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (accessError) {
      console.error('Erreur lors de la création de l\'accès:', accessError);
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur lors de la création de l\'accès: ' + accessError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Accès à Hunyuan 3D ouvert sur votre compte',
      accessId: accessData.id
    });

  } catch (error) {
    console.error('Erreur inattendue:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}

