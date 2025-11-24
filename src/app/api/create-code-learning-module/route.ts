import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Création du module Apprendre le Code Informatique dans Supabase...');

    // Vérifier si le module existe déjà
    const { data: existingModule, error: checkError } = await supabase
      .from('modules')
      .select('id, title')
      .eq('id', 'code-learning')
      .single();

    if (existingModule) {
      console.log('✅ Module Apprendre le Code Informatique existe déjà:', existingModule.id);
      return NextResponse.json({
        success: true,
        message: 'Module Apprendre le Code Informatique existe déjà',
        moduleId: existingModule.id
      });
    }

    // Créer le module
    const { data: newModule, error: createError } = await supabase
      .from('modules')
      .insert([{
        id: 'code-learning',
        title: 'Apprendre le Code Informatique',
        description: 'Des exercices courts et amusants pour découvrir la programmation. Parfait pour les enfants de 8 à 12 ans !',
        subtitle: 'Apprentissage du code pour enfants',
        category: 'ÉDUCATION',
        price: 10,
        url: '/code-learning',
        image_url: '/images/code-learning.jpg',
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

    console.log('✅ Module Apprendre le Code Informatique créé avec succès:', newModule.id);

    return NextResponse.json({
      success: true,
      message: 'Module Apprendre le Code Informatique créé avec succès',
      moduleId: newModule.id,
      module: newModule
    });

  } catch (error) {
    console.error('❌ Erreur création module Apprendre le Code Informatique:', error);
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
      .eq('id', 'code-learning')
      .single();

    if (error || !module) {
      return NextResponse.json({
        exists: false,
        message: 'Module Apprendre le Code Informatique non trouvé'
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




