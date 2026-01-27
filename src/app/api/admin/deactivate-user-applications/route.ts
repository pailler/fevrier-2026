import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userIds, moduleIds, applicationIds } = body;

    // Validation des paramètres
    if (!userIds && !moduleIds && !applicationIds) {
      return NextResponse.json({
        success: false,
        error: 'userIds, moduleIds ou applicationIds requis'
      }, { status: 400 });
    }

    let query = supabase
      .from('user_applications')
      .select('*')
      .eq('is_active', true);

    // Filtrer par user_ids si fourni
    if (userIds && Array.isArray(userIds) && userIds.length > 0) {
      query = query.in('user_id', userIds);
    }

    // Filtrer par module_ids si fourni
    if (moduleIds && Array.isArray(moduleIds) && moduleIds.length > 0) {
      query = query.in('module_id', moduleIds);
    }

    // Filtrer par application_ids si fourni (IDs directs des user_applications)
    if (applicationIds && Array.isArray(applicationIds) && applicationIds.length > 0) {
      query = query.in('id', applicationIds);
    }

    // Récupérer les activations à désactiver
    const { data: activations, error: fetchError } = await query;

    if (fetchError) {
      console.error('❌ Erreur lors de la recherche des activations:', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la recherche des activations'
      }, { status: 500 });
    }

    if (!activations || activations.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Aucune activation active trouvée avec les critères fournis'
      }, { status: 404 });
    }

    console.log(`📋 ${activations.length} activation(s) trouvée(s) à désactiver`);

    // Désactiver toutes les activations trouvées
    const activationIds = activations.map(a => a.id);
    const { data: updatedActivations, error: updateError } = await supabase
      .from('user_applications')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .in('id', activationIds)
      .select();

    if (updateError) {
      console.error('❌ Erreur lors de la désactivation:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la désactivation des activations'
      }, { status: 500 });
    }

    console.log(`✅ ${updatedActivations?.length || 0} activation(s) désactivée(s) avec succès`);

    // Récupérer les informations des utilisateurs et modules pour le résumé
    const userIdsList = [...new Set(activations.map(a => a.user_id))];
    const moduleIdsList = [...new Set(activations.map(a => a.module_id))];

    const { data: users } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', userIdsList);

    const { data: modules } = await supabase
      .from('modules')
      .select('id, name, title')
      .in('id', moduleIdsList);

    return NextResponse.json({
      success: true,
      message: `${updatedActivations?.length || 0} activation(s) désactivée(s) avec succès`,
      deactivatedCount: updatedActivations?.length || 0,
      deactivatedActivations: updatedActivations,
      summary: {
        users: users || [],
        modules: modules || [],
        activationsByUser: activations.reduce((acc, act) => {
          if (!acc[act.user_id]) acc[act.user_id] = [];
          acc[act.user_id].push(act);
          return acc;
        }, {} as Record<string, any[]>),
        activationsByModule: activations.reduce((acc, act) => {
          if (!acc[act.module_id]) acc[act.module_id] = [];
          acc[act.module_id].push(act);
          return acc;
        }, {} as Record<string, any[]>)
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
