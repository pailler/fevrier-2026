import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    const { userId, moduleId } = await req.json();

    if (!userId || !moduleId) {
      return NextResponse.json({ error: 'userId et moduleId sont requis' }, { status: 400 });
    }

    // Vérifier si le module existe déjà dans user_applications
    const { data: existingModule, error: checkError } = await supabase
      .from('user_applications')
      .select('id')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Erreur lors de la vérification du module existant:', checkError);
      return NextResponse.json({ error: 'Erreur lors de la vérification' }, { status: 500 });
    }

    // Si le module n'existe pas déjà, l'ajouter
    if (!existingModule) {
      // Définir les données du module selon le type
      let moduleData: any = {
        user_id: userId,
        module_id: moduleId,
        access_level: 'basic',
        is_active: true,
        usage_count: 0,
        max_usage: 20
      };

      // Configuration spécifique pour LibreSpeed
      if (moduleId === 'librespeed') {
        moduleData = {
          ...moduleData,
          module_title: 'LibreSpeed',
          access_level: 'premium',
          expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 jours
        };
      } else {
        // Configuration par défaut pour les autres modules
        moduleData = {
          ...moduleData,
          module_title: 'Universal Converter'
        };
      }

      const { data, error } = await supabase
        .from('user_applications')
        .insert([moduleData])
        .select();

      if (error) {
        console.error('Erreur lors de l\'ajout du module:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true,
        message: 'Module ajouté avec succès', 
        data: data[0] 
      }, { status: 200 });
    } else {
      // Mettre à jour le module existant avec la configuration LibreSpeed
      if (moduleId === 'librespeed') {
        const { data, error } = await supabase
          .from('user_applications')
          .update({
            module_title: 'LibreSpeed',
            access_level: 'premium',
            expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
          })
          .eq('user_id', userId)
          .eq('module_id', moduleId)
          .select();

        if (error) {
          console.error('Erreur lors de la mise à jour du module:', error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ 
          success: true,
          message: 'Module LibreSpeed mis à jour avec succès',
          data: data[0]
        }, { status: 200 });
      } else {
        return NextResponse.json({ 
          success: true,
          message: 'Module déjà présent dans vos applications' 
        }, { status: 200 });
      }
    }

  } catch (error: any) {
    console.error('Erreur inattendue:', error);
    return NextResponse.json({ error: error.message || 'Erreur interne du serveur' }, { status: 500 });
  }
}
