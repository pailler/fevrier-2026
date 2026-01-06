import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Création du module Apprendre Autrement dans Supabase...');

    // Vérifier si le module existe déjà
    const { data: existingModule, error: checkError } = await supabase
      .from('modules')
      .select('id, title')
      .eq('id', 'apprendre-autrement')
      .single();

    if (existingModule) {
      console.log('✅ Module Apprendre Autrement existe déjà:', existingModule.id);
      return NextResponse.json({
        success: true,
        message: 'Module Apprendre Autrement existe déjà',
        moduleId: existingModule.id
      });
    }

    // Créer le module
    const { data: newModule, error: createError } = await supabase
      .from('modules')
      .insert([{
        id: 'apprendre-autrement',
        title: 'Apprendre Autrement',
        description: 'Des activités super amusantes pour apprendre au rythme de chacun ! Parfait pour les enfants avec des besoins spécifiques.',
        category: 'ÉDUCATION',
        price: 10,
        url: '/apprendre-autrement',
        image_url: '/images/apprendre-autrement.jpg',
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

    console.log('✅ Module Apprendre Autrement créé avec succès:', newModule.id);

    return NextResponse.json({
      success: true,
      message: 'Module Apprendre Autrement créé avec succès',
      moduleId: newModule.id,
      module: newModule
    });

  } catch (error) {
    console.error('❌ Erreur création module Apprendre Autrement:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

// GET pour vérifier si le module existe
export async function GET(request: NextRequest) {
  try {
    const { data: module, error } = await supabase
      .from('modules')
      .select('*')
      .eq('id', 'apprendre-autrement')
      .single();

    if (error || !module) {
      return NextResponse.json({
        exists: false,
        message: 'Module Apprendre Autrement non trouvé'
      });
    }

    return NextResponse.json({
      exists: true,
      module: module
    });
  } catch (error) {
    return NextResponse.json({ 
      exists: false,
      error: 'Erreur lors de la vérification'
    }, { status: 500 });
  }
}


