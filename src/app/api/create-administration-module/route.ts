import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Création du module Services de l\'Administration dans Supabase...');

    // Vérifier si le module existe déjà
    const { data: existingModule, error: checkError } = await supabase
      .from('modules')
      .select('id, title')
      .eq('id', 'administration')
      .single();

    if (existingModule) {
      console.log('✅ Module Services de l\'Administration existe déjà:', existingModule.id);
      return NextResponse.json({
        success: true,
        message: 'Module Services de l\'Administration existe déjà',
        moduleId: existingModule.id
      });
    }

    // Créer le module
    const { data: newModule, error: createError } = await supabase
      .from('modules')
      .insert([{
        id: 'administration',
        title: 'Services de l\'Administration',
        description: 'Portail centralisé pour accéder rapidement aux principaux services de l\'administration française : CAF, Sécurité Sociale, permis de conduire, aides sociales, scolarité, études, retraites, famille, handicap et bien plus.',
        category: 'SERVICES PUBLICS',
        price: 10,
        url: '/administration',
        image_url: '/images/administration-module.jpg',
        is_visible: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (createError) {
      console.error('❌ Erreur création module:', createError);
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur lors de la création du module',
        details: createError.message
      }, { status: 500 });
    }

    console.log('✅ Module Services de l\'Administration créé avec succès:', newModule.id);

    return NextResponse.json({
      success: true,
      message: 'Module Services de l\'Administration créé avec succès',
      module: newModule
    });

  } catch (error) {
    console.error('❌ Erreur lors de la création du module:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur serveur lors de la création du module',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

