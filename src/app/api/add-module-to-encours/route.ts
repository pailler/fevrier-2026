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
      const { data, error } = await supabase
        .from('user_applications')
        .insert([
          {
            user_id: userId,
            module_id: moduleId,
            module_title: 'Universal Converter',
            access_level: 'basic',
            is_active: true,
            usage_count: 0,
            max_usage: 20
          }
        ])
        .select();

      if (error) {
        console.error('Erreur lors de l\'ajout du module:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ 
        message: 'Module ajouté avec succès', 
        data: data[0] 
      }, { status: 200 });
    } else {
      return NextResponse.json({ 
        message: 'Module déjà présent dans vos applications' 
      }, { status: 200 });
    }

  } catch (error: any) {
    console.error('Erreur inattendue:', error);
    return NextResponse.json({ error: error.message || 'Erreur interne du serveur' }, { status: 500 });
  }
}
