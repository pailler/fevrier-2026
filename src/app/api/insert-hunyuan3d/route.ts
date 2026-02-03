import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Insertion du module Hunyuan 3D...');

    const moduleData = {
      id: 'hunyuan3d',
      title: 'Hunyuan 3D - Génération 3D par IA',
      description: 'Hunyuan 3D : Générez des modèles 3D à partir de texte ou d\'images avec l\'intelligence artificielle. Créez des objets 3D réalistes et détaillés pour vos projets.',
      category: 'IA',
      price: 100, // 100 tokens par accès, et utilisez l'application aussi longtemps que vous souhaitez
      youtube_url: 'https://www.youtube.com/embed/CP2cDFgbs8s?autoplay=0&rel=0&modestbranding=1',
      url: 'https://hunyuan3d.iahome.fr',
      image_url: '/images/module-visuals/hunyuan3d-module.svg',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Vérifier si le module existe déjà
    const { data: existingModule, error: checkError } = await supabase
      .from('modules')
      .select('id')
      .eq('id', 'hunyuan3d')
      .single();

    if (existingModule) {
      console.log('📝 Module existant trouvé, mise à jour...');
      
      const { data, error } = await supabase
        .from('modules')
        .update(moduleData)
        .eq('id', 'hunyuan3d')
        .select();

      if (error) {
        console.error('❌ Erreur lors de la mise à jour:', error);
        return NextResponse.json({ 
          success: false, 
          error: 'Erreur lors de la mise à jour du module',
          details: error.message 
        }, { status: 500 });
      }

      console.log('✅ Module Hunyuan 3D mis à jour avec succès');
      return NextResponse.json({ 
        success: true, 
        message: 'Module Hunyuan 3D mis à jour avec succès',
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

    console.log('✅ Module Hunyuan 3D inséré avec succès');
    return NextResponse.json({ 
      success: true, 
      message: 'Module Hunyuan 3D inséré avec succès',
      data: data[0]
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion du module Hunyuan 3D:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

