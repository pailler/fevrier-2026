import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Insertion du module Home Assistant...');

    const moduleData = {
      id: 'home-assistant',
      title: 'Domotisez votre habitat',
      description: 'Manuel utilisateur ultra complet pour domotiser votre habitat (maison, garage, lieu de vacances, lieu de travail, etc.) sans frais d\'installation, ni frais de logiciels puisque tout est open-source. Des centaines de codes prêts à l\'emploi sont aussi mis à disposition gratuitement.',
      category: 'DOMOTIQUE',
      price: 100, // 100 tokens
      youtube_url: '',
      url: 'https://homeassistant.iahome.fr',
      image_url: '/images/home-assistant-module.jpg',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Vérifier si le module existe déjà
    const { data: existingModule, error: checkError } = await supabase
      .from('modules')
      .select('id')
      .eq('id', 'home-assistant')
      .single();

    if (existingModule) {
      console.log('✅ Module Home Assistant existe déjà, mise à jour...');
      
      const { data, error } = await supabase
        .from('modules')
        .update(moduleData)
        .eq('id', 'home-assistant')
        .select();

      if (error) {
        console.error('❌ Erreur lors de la mise à jour:', error);
        return NextResponse.json({ 
          success: false, 
          error: 'Erreur lors de la mise à jour du module',
          details: error.message 
        }, { status: 500 });
      }

      console.log('✅ Module Home Assistant mis à jour avec succès');
      return NextResponse.json({ 
        success: true, 
        message: 'Module Home Assistant mis à jour avec succès',
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

    console.log('✅ Module Home Assistant inséré avec succès');
    return NextResponse.json({ 
      success: true, 
      message: 'Module Home Assistant inséré avec succès',
      data: data[0]
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion du module Home Assistant:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

