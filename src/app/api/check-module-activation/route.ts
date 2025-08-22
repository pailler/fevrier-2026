import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { moduleId, userId } = await request.json();
    
    if (!moduleId || !userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'moduleId et userId requis' 
      }, { status: 400 });
    }

    // Vérifier si l'utilisateur existe
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ 
        success: false, 
        error: 'Utilisateur non trouvé' 
      }, { status: 404 });
    }

    // Vérifier si l'accès existe déjà dans user_applications
    const { data: existingAccess, error: checkError } = await supabase
      .from('user_applications')
      .select('id, module_title, access_level, expires_at, is_active')
      .eq('user_id', userId)
      .eq('module_id', parseInt(moduleId))
      .eq('is_active', true)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur lors de la vérification' 
      }, { status: 500 });
    }

    const isActivated = !!existingAccess;
    
    return NextResponse.json({
      success: true,
      isActivated: isActivated,
      moduleInfo: existingAccess ? {
        id: existingAccess.id,
        title: existingAccess.module_title,
        accessLevel: existingAccess.access_level,
        expiresAt: existingAccess.expires_at,
        isActive: existingAccess.is_active
      } : null
    });

  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}
