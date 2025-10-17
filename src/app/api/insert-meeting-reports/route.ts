import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Insertion du module Meeting Reports...');

    const moduleData = {
      id: 'meeting-reports',
      title: 'Meeting Reports',
      description: 'Meeting Reports : Transformez automatiquement vos réunions en rapports professionnels avec l\'intelligence artificielle. Enregistrez, transcrivez et résumez vos réunions avec une précision exceptionnelle.',
      category: 'Productivité',
      price: 100, // 100 tokens par utilisation
      youtube_url: '',
      url: 'https://meeting-reports.iahome.fr',
      image_url: '/images/module-visuals/meeting-reports-module.svg',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Vérifier si le module existe déjà
    const { data: existingModule, error: checkError } = await supabase
      .from('modules')
      .select('id')
      .eq('id', 'meeting-reports')
      .single();

    if (existingModule) {
      console.log('📝 Module existant trouvé, mise à jour...');
      
      const { data, error } = await supabase
        .from('modules')
        .update(moduleData)
        .eq('id', 'meeting-reports')
        .select();

      if (error) {
        console.error('❌ Erreur lors de la mise à jour:', error);
        return NextResponse.json({ 
          success: false, 
          error: 'Erreur lors de la mise à jour du module',
          details: error.message 
        }, { status: 500 });
      }

      console.log('✅ Module Meeting Reports mis à jour avec succès');
      return NextResponse.json({ 
        success: true, 
        message: 'Module Meeting Reports mis à jour avec succès',
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

    console.log('✅ Module Meeting Reports inséré avec succès');
    return NextResponse.json({ 
      success: true, 
      message: 'Module Meeting Reports inséré avec succès',
      data: data[0]
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion du module Meeting Reports:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}
