import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Création du module Générateur de prompts...');

    // Vérifier si le module existe déjà
    const { data: existingModule, error: checkError } = await supabase
      .from('modules')
      .select('id, title')
      .eq('id', 'prompt-generator')
      .single();

    if (existingModule) {
      console.log('✅ Module Générateur de prompts existe déjà:', existingModule.id);
      return NextResponse.json({
        success: true,
        message: 'Module Générateur de prompts existe déjà',
        module: existingModule
      });
    }

    // Créer le module
    const { data: newModule, error: createError } = await supabase
      .from('modules')
      .insert([{
        id: 'prompt-generator',
        title: 'Générateur de prompts',
        description: 'Créez des prompts optimisés pour ChatGPT et autres modèles de langage en utilisant les meilleures pratiques du prompt engineering.',
        subtitle: 'Génération de prompts optimisés avec IA',
        category: 'IA',
        price: 100,
        url: 'http://localhost:9001/prompt-generator',
        image_url: '/images/prompt-generator.jpg',
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

    console.log('✅ Module Générateur de prompts créé avec succès:', newModule.id);

    return NextResponse.json({
      success: true,
      message: 'Module Générateur de prompts créé avec succès',
      module: newModule
    });

  } catch (error) {
    console.error('❌ Erreur création module Générateur de prompts:', error);
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
      .eq('id', 'prompt-generator')
      .single();

    if (error || !module) {
      return NextResponse.json({
        exists: false,
        message: 'Module Générateur de prompts non trouvé'
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


