import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    ;

    const moduleData = {
      id: 'sdnext',
      title: 'SDNext',
      description: 'SDNext révolutionne la génération d\'images avec des modèles d\'IA de pointe et une interface ultra-rapide pour des résultats exceptionnels.',
      subtitle: 'SDNext : Expérience plus performante et moderne',
      category: 'AI GENERATION',
      price: 5,
      youtube_url: '',
      url: 'https://sdnext.iahome.fr',
      image_url: '/images/chatgpt.jpg',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Vérifier si le module existe déjà
    const { data: existingModule, error: checkError } = await supabase
      .from('modules')
      .select('id')
      .eq('id', 'sdnext')
      .single();

    if (existingModule) {
      ;
      
      const { data, error } = await supabase
        .from('modules')
        .update(moduleData)
        .eq('id', 'sdnext')
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
        message: 'Module SDNext mis à jour avec succès',
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
      message: 'Module SDNext inséré avec succès',
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
