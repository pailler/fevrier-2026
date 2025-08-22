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
      .select('id, module_title, access_level, expires_at, is_active, usage_count, max_usage')
      .eq('user_id', userId)
      .eq('module_id', moduleId) // Utiliser l'ID tel quel (string)
      .eq('is_active', true)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur lors de la vérification' 
      }, { status: 500 });
    }

    // Vérifier si l'accès est valide (pas expiré et quota non dépassé)
    let isActivated = false;
    let isExpired = false;
    let isQuotaExceeded = false;
    
    if (existingAccess) {
      // Vérifier l'expiration
      if (existingAccess.expires_at) {
        const expirationDate = new Date(existingAccess.expires_at);
        const now = new Date();
        isExpired = expirationDate < now;
      }
      
      // Vérifier le quota
      if (existingAccess.max_usage && existingAccess.max_usage > 0) {
        isQuotaExceeded = (existingAccess.usage_count || 0) >= existingAccess.max_usage;
      }
      
      // L'accès est valide si pas expiré et quota non dépassé
      isActivated = !isExpired && !isQuotaExceeded;
    }
    
    return NextResponse.json({
      success: true,
      isActivated: isActivated,
      isExpired: isExpired,
      isQuotaExceeded: isQuotaExceeded,
      moduleInfo: existingAccess ? {
        id: existingAccess.id,
        title: existingAccess.module_title,
        accessLevel: existingAccess.access_level,
        expiresAt: existingAccess.expires_at,
        isActive: existingAccess.is_active,
        usageCount: existingAccess.usage_count || 0,
        maxUsage: existingAccess.max_usage,
        remainingUsage: existingAccess.max_usage ? Math.max(0, existingAccess.max_usage - (existingAccess.usage_count || 0)) : null
      } : null
    });

  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}
