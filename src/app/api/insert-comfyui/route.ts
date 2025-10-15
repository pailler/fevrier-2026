import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    ;

    const moduleData = {
      id: 'comfyui',
      title: 'ComfyUI',
      description: 'ComfyUI : Un contrôle total sur chaque étape de la création d\'image',
      subtitle: 'ComfyUI : Un contrôle total sur chaque étape de la création d\'image',
      category: 'AI WORKFLOW',
      price: 7,
      youtube_url: '',
      url: 'https://comfyui.iahome.fr',
      image_url: '/images/chatgpt.jpg',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Vérifier si le module existe déjà
    const { data: existingModule, error: checkError } = await supabase
      .from('modules')
      .select('id')
      .eq('id', 'comfyui')
      .single();

    if (existingModule) {
      ;
      
      const { data, error } = await supabase
        .from('modules')
        .update(moduleData)
        .eq('id', 'comfyui')
        .select();

      if (error) {
        console.error('❌ Erreur lors de la mise à jour:', error);
        return NextResponse.json({ 
          success: false, 
          error: 'Erreur lors de la mise à jour du module',
          details: error.message 
        }, { status: 500 });
      }

      ;
      return NextResponse.json({ 
        success: true, 
        message: 'Module ComfyUI mis à jour avec succès',
        data: data[0]
      });
    }

    // Insérer le nouveau module
    const { data, error } = await supabase
      .from('modules')
      .insert([moduleData])
      .select();

    if (error) {
      console.error('❌ Erreur lors de l\'insertion:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur lors de l\'insertion du module',
        details: error.message 
      }, { status: 500 });
    }

    ;
    return NextResponse.json({ 
      success: true, 
      message: 'Module ComfyUI inséré avec succès',
      data: data[0]
    });

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}
