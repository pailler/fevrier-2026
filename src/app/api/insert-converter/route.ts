import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Insertion du module Universal Converter...');

    const moduleData = {
      id: 'converter',
      title: 'Universal Converter',
      description: 'Convertisseur universel de fichiers - Transformez vos documents, images, audio et vidéo en toute simplicité. Support de plus de 50 formats de fichiers différents.',
      category: 'Web Tools',
      price: 0,
      youtube_url: '',
      url: 'https://converter.iahome.fr',
      image_url: '/images/converter.jpg',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Vérifier si le module existe déjà
    const { data: existingModule, error: checkError } = await supabase
      .from('modules')
      .select('id')
      .eq('id', 'converter')
      .single();

    if (existingModule) {
      console.log('⚠️ Le module converter existe déjà, mise à jour...');
      
      const { data, error } = await supabase
        .from('modules')
        .update(moduleData)
        .eq('id', 'converter')
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur lors de la mise à jour:', error);
        return NextResponse.json({ error: 'Erreur lors de la mise à jour', details: error }, { status: 500 });
      }

      console.log('✅ Module converter mis à jour avec succès:', data);
      return NextResponse.json({ success: true, action: 'updated', data });
    } else {
      // Insérer le nouveau module
      const { data, error } = await supabase
        .from('modules')
        .insert([moduleData])
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur lors de l\'insertion:', error);
        return NextResponse.json({ error: 'Erreur lors de l\'insertion', details: error }, { status: 500 });
      }

      console.log('✅ Module converter inséré avec succès:', data);
      return NextResponse.json({ success: true, action: 'inserted', data });
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur', details: error }, { status: 500 });
  }
}
