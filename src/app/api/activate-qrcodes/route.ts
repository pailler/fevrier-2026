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
    const { data: existingAccess, error: fetchAccessError } = await supabase
      .from('user_applications')
      .select('*')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .single();

    if (existingAccess) {
      return NextResponse.json({ success: true, message: 'QR Codes déjà activé pour cet utilisateur.' });
    }

    // 2. Créer l'accès sans consommation de tokens (activation gratuite)
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 30); // 1 mois (30 jours)

    const { data: accessData, error: createAccessError } = await supabase
      .from('user_applications')
      .insert([{
        user_id: userId,
        module_id: moduleId,
        module_title: moduleTitle,
        is_active: true,
        access_level: 'premium', // Accès premium
        usage_count: 0,
        max_usage: null, // Pas de limite d'usage fixe pour l'activation
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
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
      expiresAt: expiresAt.toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur inattendue lors de l\'activation de QR Codes:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Erreur serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
    }, { status: 500 });
  }
}
