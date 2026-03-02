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
      .select('id, usage_count, module_id')
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

    const currentUsage = userApp.usage_count || 0;

    // Les tokens sont déjà consommés par le service de tokens principal
    // Cette API ne fait que incrémenter le compteur d'usage

    // Incrémenter le compteur dans user_applications et mettre à jour last_used_at
    const newUsageCount = currentUsage + 1;
    const now = new Date().toISOString();
    const { data: updatedApp, error: updateAppError } = await supabase
      .from('user_applications')
      .update({
        usage_count: newUsageCount,
        last_used_at: now  // Mettre à jour la date de dernière utilisation
      })
      .eq('id', userApp.id)
      .select()
      .single();

    if (updateAppError) {
      console.error('❌ LibreSpeed Access: Erreur mise à jour user_applications:', updateAppError);
      return new NextResponse('Error updating usage count', { status: 500 });
    }

    console.log('✅ LibreSpeed Access: Compteur incrémenté:', newUsageCount);

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
