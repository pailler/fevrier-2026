import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { userId, email } = await request.json();
  const supabase = createRouteHandlerClient({ cookies });

  if (!userId || !email) {
    return NextResponse.json({ success: false, error: 'User ID and email are required' }, { status: 400 });
  }

  const moduleId = 'qrcodes'; // ID du module QR Codes
  const moduleTitle = 'QR Codes'; // Titre du module QR Codes

  try {
    // 1. Vérifier si l'utilisateur a déjà accès au module
    const { data: existingAccessList, error: fetchAccessError } = await supabase
      .from('user_applications')
      .select('*')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .eq('is_active', true);

    // Vérifier aussi avec le titre pour être sûr
    const { data: existingAccessByTitle, error: fetchAccessByTitleError } = await supabase
      .from('user_applications')
      .select('*')
      .eq('user_id', userId)
      .ilike('module_title', '%QR Codes%')
      .eq('is_active', true);

    const existingAccess = existingAccessList?.[0] || existingAccessByTitle?.[0];

    if (existingAccess) {
      console.log('✅ QR Codes déjà activé pour cet utilisateur:', existingAccess.id);
      return NextResponse.json({ 
        success: true, 
        message: 'QR Codes déjà activé pour cet utilisateur.',
        accessId: existingAccess.id,
        alreadyActivated: true
      });
    }

    const now = new Date().toISOString();
    const { data: accessData, error: createAccessError } = await supabase
      .from('user_applications')
      .insert([{
        user_id: userId,
        module_id: moduleId,
        module_title: moduleTitle,
        is_active: true,
        access_level: 'premium',
        usage_count: 0,
        created_at: now,
        updated_at: now
      }])
      .select()
      .single();

    if (createAccessError) {
      console.error('❌ Erreur création accès QR Codes:', createAccessError);
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur lors de la création de l\'accès QR Codes' 
      }, { status: 500 });
    }

    console.log('✅ Accès QR Codes créé avec succès:', accessData.id);
    return NextResponse.json({
      success: true,
      message: 'QR Codes activé avec succès',
      accessId: accessData.id,
      moduleId: moduleId,
      moduleTitle: moduleTitle,
      accessData: accessData
    });

  } catch (error) {
    console.error('❌ Erreur inattendue lors de l\'activation de QR Codes:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Erreur serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
    }, { status: 500 });
  }
}
