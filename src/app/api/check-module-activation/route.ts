import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey } from '@/utils/supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseAnonKey()
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
      .select('id, module_title, access_level, is_active, usage_count')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .eq('is_active', true)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      return NextResponse.json({ success: false, error: 'Erreur lors de la vérification' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      isActivated: !!existingAccess,
      isExpired: false,
      isQuotaExceeded: false,
      moduleInfo: existingAccess ? {
        id: existingAccess.id,
        title: existingAccess.module_title,
        accessLevel: existingAccess.access_level,
        isActive: existingAccess.is_active,
        usageCount: existingAccess.usage_count || 0
      } : null
    });

  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}
