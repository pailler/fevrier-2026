import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    const { userId, moduleId } = await req.json();

    if (!userId || !moduleId) {
      return NextResponse.json({ error: 'userId et moduleId sont requis' }, { status: 400 });
    }

    console.log('🔧 Force update MeTube:', { userId, moduleId });

    // Forcer la mise à jour du module MeTube
    const updateData = {
      module_title: 'MeTube',
      access_level: 'premium',
      expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    };

    console.log('🔧 Données de mise à jour:', updateData);

    const { data, error } = await supabase
      .from('user_applications')
      .update(updateData)
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .select();

    if (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Module MeTube mis à jour:', data);

    return NextResponse.json({ 
      success: true,
      message: 'Module MeTube mis à jour avec succès',
      data: data[0]
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Erreur inattendue:', error);
    return NextResponse.json({ error: error.message || 'Erreur interne du serveur' }, { status: 500 });
  }
}
