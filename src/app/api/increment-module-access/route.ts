import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    ;
    
    const body = await request.json();
    const { userId, userEmail, moduleId } = body;
    
    if (!userId || !userEmail || !moduleId) {
      return new NextResponse('Missing userId, userEmail or moduleId', { status: 400 });
    }

    // Vérifier si l'utilisateur a le module activé dans user_applications
    console.log('🔍 Module Access: Recherche dans user_applications pour userId:', userId, 'moduleId:', moduleId);
    
    const { data: userApp, error: appError } = await supabase
      .from('user_applications')
      .select('id, usage_count, max_usage, expires_at, module_id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .like('module_id', `%${moduleId}%`)
      .single();

    console.log('🔍 Module Access: Résultat recherche:', { userApp, appError });

    if (appError || !userApp) {
      console.log('❌ Module Access: Module non activé pour l\'utilisateur. Erreur:', appError);
      return new NextResponse(`${moduleId} not activated for user`, { status: 403 });
    }

    console.log('✅ Module Access: Module trouvé:', userApp.module_id);

    // Vérifier l'expiration
    if (userApp.expires_at && new Date(userApp.expires_at) < new Date()) {
      ;
      return new NextResponse(JSON.stringify({
        success: false,
        error: 'Accès expiré',
        message: `Votre accès ${moduleId} a expiré. Veuillez le renouveler.`
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const currentUsage = userApp.usage_count || 0;
    const maxUsage = userApp.max_usage || 50; // Limite par défaut de 50 (affichage uniquement)
    
    // Plus de vérification de quota - le système de tokens gère les limites
    ;

    // Incrémenter le compteur dans user_applications
    const newUsageCount = currentUsage + 1;
    const { data: updatedApp, error: updateAppError } = await supabase
      .from('user_applications')
      .update({
        usage_count: newUsageCount
      })
      .eq('id', userApp.id)
      .select()
      .single();

    if (updateAppError) {
      console.error('❌ Module Access: Erreur mise à jour user_applications:', updateAppError);
      return new NextResponse('Error updating usage count', { status: 500 });
    }

    console.log('✅ Module Access: Compteur incrémenté:', newUsageCount, '/', maxUsage);

    // Enregistrer l'accès dans les logs
    const { error: logError } = await supabase
      .from('access_logs')
      .insert({
        user_id: userId,
        user_email: userEmail,
        module_id: moduleId,
        access_type: 'button_click',
        access_count: updatedApp.usage_count,
        created_at: new Date().toISOString()
      });

    if (logError) {
      console.error('⚠️ Module Access: Erreur enregistrement log:', logError);
      // Ne pas faire échouer la requête pour une erreur de log
    }

    return new NextResponse(JSON.stringify({
      success: true,
      usage_count: updatedApp.usage_count,
      max_usage: updatedApp.max_usage,
      last_accessed_at: updatedApp.last_accessed_at
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Module Access Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

