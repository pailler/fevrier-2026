import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Récupérer l'utilisateur actuel
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Utilisateur non authentifié' 
      }, { status: 401 });
    }

    const userId = session.user.id;
    const moduleId = 'qrcodes';

    // Vérifier l'état actuel dans user_applications
    const { data: userApp, error: appError } = await supabase
      .from('user_applications')
      .select('*')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (appError) {
      console.error('❌ Erreur récupération user_applications:', appError);
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur lors de la récupération' 
      }, { status: 500 });
    }

    const now = new Date();
    const isExpired = userApp?.expires_at ? new Date(userApp.expires_at) <= now : false;
    const isActive = userApp?.is_active === true;
    const needsReactivation = !userApp || !isActive || isExpired;

    return NextResponse.json({
      success: true,
      exists: !!userApp,
      is_active: isActive,
      is_expired: isExpired,
      needs_reactivation: needsReactivation,
      data: userApp ? {
        id: userApp.id,
        module_id: userApp.module_id,
        module_title: userApp.module_title,
        is_active: userApp.is_active,
        expires_at: userApp.expires_at,
        expires_at_date: userApp.expires_at ? new Date(userApp.expires_at).toISOString() : null,
        usage_count: userApp.usage_count || 0,
        max_usage: userApp.max_usage,
        access_level: userApp.access_level,
        created_at: userApp.created_at
      } : null,
      now: now.toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Erreur serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Récupérer l'utilisateur actuel
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Utilisateur non authentifié' 
      }, { status: 401 });
    }

    const userId = session.user.id;
    const userEmail = session.user.email || '';
    const moduleId = 'qrcodes';
    const moduleTitle = 'QR Codes Dynamiques';

    // Vérifier l'état actuel
    const { data: existingAccess, error: fetchError } = await supabase
      .from('user_applications')
      .select('*')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error('❌ Erreur récupération:', fetchError);
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur lors de la récupération' 
      }, { status: 500 });
    }

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 90); // 90 jours

    let result;

    if (existingAccess) {
      // Réactiver l'accès existant
      const { data: reactivatedAccess, error: reactivateError } = await supabase
        .from('user_applications')
        .update({
          is_active: true,
          access_level: 'premium',
          usage_count: 0, // Réinitialiser le compteur
          max_usage: 50, // Quota de 50 utilisations
          expires_at: expiresAt.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('id', existingAccess.id)
        .select()
        .single();

      if (reactivateError) {
        console.error('❌ Erreur réactivation:', reactivateError);
        return NextResponse.json({ 
          success: false, 
          error: 'Erreur lors de la réactivation' 
        }, { status: 500 });
      }

      result = reactivatedAccess;
      console.log('✅ QR Codes réactivé:', result.id);
    } else {
      // Créer un nouvel accès
      const { data: newAccess, error: createError } = await supabase
        .from('user_applications')
        .insert([{
          user_id: userId,
          module_id: moduleId,
          module_title: moduleTitle,
          is_active: true,
          access_level: 'premium',
          usage_count: 0,
          max_usage: 50,
          expires_at: expiresAt.toISOString(),
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        }])
        .select()
        .single();

      if (createError) {
        console.error('❌ Erreur création:', createError);
        return NextResponse.json({ 
          success: false, 
          error: 'Erreur lors de la création' 
        }, { status: 500 });
      }

      result = newAccess;
      console.log('✅ QR Codes créé:', result.id);
    }

    return NextResponse.json({
      success: true,
      message: existingAccess ? 'QR Codes réactivé avec succès' : 'QR Codes activé avec succès',
      data: {
        id: result.id,
        module_id: result.module_id,
        module_title: result.module_title,
        is_active: result.is_active,
        expires_at: result.expires_at,
        usage_count: result.usage_count || 0,
        max_usage: result.max_usage
      }
    });

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Erreur serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
    }, { status: 500 });
  }
}







