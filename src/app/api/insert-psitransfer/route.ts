import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Insertion/Mise à jour du module PsiTransfer');

    const moduleData = {
      id: 'psitransfer',
      title: 'PsiTransfer',
      description: 'PsiTransfer : Transférez vos fichiers de manière sécurisée et anonyme. Partagez vos fichiers sans inscription, avec un lien temporaire et sécurisé.',
      subtitle: 'Transfert de fichiers sécurisé et anonyme',
      category: 'Fichier',
      price: 0,
      youtube_url: '',
      url: 'https://iahome.fr/psitransfer',
      image_url: '/images/psitransfer.jpg',
      is_visible: true, // Important : rendre le module visible dans /account
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Vérifier si le module existe déjà
    const { data: existingModule, error: checkError } = await supabase
      .from('modules')
      .select('id')
      .eq('id', 'psitransfer')
      .single();

    if (existingModule) {
      console.log('✅ Module PsiTransfer existe déjà, mise à jour...');
      
      const { data, error } = await supabase
        .from('modules')
        .update({
          ...moduleData,
          updated_at: new Date().toISOString()
        })
        .eq('id', 'psitransfer')
        .select();

      if (error) {
        console.error('❌ Erreur lors de la mise à jour:', error);
        return NextResponse.json({ 
          success: false, 
          error: 'Erreur lors de la mise à jour du module',
          details: error.message 
        }, { status: 500 });
      }

      console.log('✅ Module PsiTransfer mis à jour avec succès');
      return NextResponse.json({ 
        success: true, 
        message: 'Module PsiTransfer mis à jour avec succès',
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

    console.log('✅ Module PsiTransfer inséré avec succès');
    return NextResponse.json({ 
      success: true, 
      message: 'Module PsiTransfer inséré avec succès',
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





















