import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    ;
    
    const body = await request.json();
    const { userId, userEmail } = body;
    
    if (!userId || !userEmail) {
      return new NextResponse('Missing userId or userEmail', { status: 400 });
    }

    // Vérifier si l'utilisateur a LibreSpeed activé dans user_applications
    console.log('🔍 LibreSpeed Access: Recherche dans user_applications pour userId:', userId);
    
    const { data: userApp, error: appError } = await supabase
      .from('user_applications')
      .select('id, usage_count, max_usage, expires_at, module_id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .like('module_id', '%librespeed%')
      .single();

    console.log('🔍 LibreSpeed Access: Résultat recherche:', { userApp, appError });

    if (appError || !userApp) {
      console.log('❌ LibreSpeed Access: Module non activé pour l\'utilisateur. Erreur:', appError);
      return new NextResponse('LibreSpeed not activated for user', { status: 403 });
    }

    console.log('✅ LibreSpeed Access: Module trouvé:', userApp.module_id);

    // Vérifier l'expiration
    if (userApp.expires_at && new Date(userApp.expires_at) < new Date()) {
      ;
      return new NextResponse(JSON.stringify({
        success: false,
        error: 'Accès expiré',
        message: 'Votre accès LibreSpeed a expiré. Veuillez le renouveler.'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const currentUsage = userApp.usage_count || 0;
    const maxUsage = userApp.max_usage || 50; // Limite par défaut de 50
    
    // Vérifier si le quota est dépassé
    if (currentUsage >= maxUsage) {
      console.log('❌ LibreSpeed Access: Quota dépassé:', currentUsage, '/', maxUsage);
      return new NextResponse(JSON.stringify({
        success: false,
        error: 'Quota dépassé',
        current_usage: currentUsage,
        max_usage: maxUsage,
        message: `Vous avez atteint la limite de ${maxUsage} accès. Votre quota sera renouvelé le mois prochain.`
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

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
      console.error('❌ LibreSpeed Access: Erreur mise à jour user_applications:', updateAppError);
      return new NextResponse('Error updating usage count', { status: 500 });
    }

    console.log('✅ LibreSpeed Access: Compteur incrémenté:', newUsageCount, '/', maxUsage);

    // Enregistrer l'accès dans les logs
    const { error: logError } = await supabase
      .from('access_logs')
      .insert({
        user_id: userId,
        user_email: userEmail,
        module_id: 'librespeed',
        access_type: 'button_click',
        access_count: updatedApp.usage_count,
        created_at: new Date().toISOString()
      });

    if (logError) {
      console.error('⚠️ LibreSpeed Access: Erreur enregistrement log:', logError);
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
    console.error('❌ LibreSpeed Access Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
