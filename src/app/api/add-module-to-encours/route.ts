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
        usage_count: 0
      };
      
      if (moduleId === 'librespeed') {
        moduleData = { ...moduleData, module_title: 'LibreSpeed', access_level: 'premium' };
      } else if (moduleId === 'metube') {
        moduleData = { ...moduleData, module_title: 'MeTube', access_level: 'premium' };
      } else if (moduleId === 'pdf') {
        moduleData = { ...moduleData, module_title: 'PDF+', access_level: 'premium' };
      } else if (moduleId === 'psitransfer') {
        moduleData = { ...moduleData, module_title: 'PsiTransfer', access_level: 'premium' };
      } else if (moduleId === 'qrcodes') {
        moduleData = { ...moduleData, module_title: 'QR Codes', access_level: 'premium' };
      } else {
        moduleData = { ...moduleData, module_title: 'Module' };
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
      // Mettre à jour le module existant avec la configuration appropriée
      let updateData: any = {};
      
      console.log('🔧 Mise à jour module existant:', { moduleId, userId });
      
      if (moduleId === 'librespeed') {
        updateData = { module_title: 'LibreSpeed', access_level: 'premium' };
      } else if (moduleId === 'metube') {
        updateData = { module_title: 'MeTube', access_level: 'premium' };
      } else if (moduleId === 'pdf') {
        updateData = { module_title: 'PDF+', access_level: 'premium' };
      } else if (moduleId === 'psitransfer') {
        updateData = { module_title: 'PsiTransfer', access_level: 'premium' };
      } else if (moduleId === 'qrcodes') {
        updateData = { module_title: 'QR Codes', access_level: 'premium' };
      }
      
      console.log('🔧 Données de mise à jour:', updateData);
      console.log('🔧 Clés de mise à jour:', Object.keys(updateData));
      
      if (Object.keys(updateData).length > 0) {
        const { data, error } = await supabase
          .from('user_applications')
          .update(updateData)
          .eq('user_id', userId)
          .eq('module_id', moduleId)
          .select();

        if (error) {
          console.error('Erreur lors de la mise à jour du module:', error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ 
          success: true,
          message: `Module ${moduleId} mis à jour avec succès`,
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
