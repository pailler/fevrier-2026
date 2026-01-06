import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

export async function POST(request: NextRequest) {
  try {
    // Vérifier si le module existe déjà
    const { data: existingModule, error: checkError } = await supabase
      .from('modules')
      .select('id, title')
      .or('id.eq.ai-detector,title.ilike.%ai-detector%')
      .single();

    if (existingModule && !checkError) {
      return NextResponse.json({
        success: true,
        message: 'Module Détecteur IA existe déjà',
        module: existingModule
      });
    }

    // Créer le module
    const { data: newModule, error: createError } = await supabase
      .from('modules')
      .insert([{
        id: 'ai-detector',
        title: 'Détecteur de Contenu IA',
        description: 'Analysez vos documents texte, PDF, DOCX et images pour détecter la proportion de contenu généré par l\'intelligence artificielle. Détection précise avec scores détaillés et analyse phrase par phrase.',
        category: 'OUTILS IA',
        price: 100,
        url: '/ai-detector',
        image_url: '/images/ai-detector.jpg',
        is_active: true,
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

    console.log('✅ Module Détecteur IA créé avec succès:', newModule.id);

    return NextResponse.json({
      success: true,
      message: 'Module Détecteur IA créé avec succès',
      module: newModule
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

