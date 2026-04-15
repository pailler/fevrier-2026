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
    const { userEmail, userName, userId } = body;

    // Trouver l'utilisateur
    let user;
    if (userId) {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('id', userId)
        .single();
      
      if (error || !data) {
        return NextResponse.json({
          success: false,
          error: `Utilisateur non trouvé avec l'ID: ${userId}`
        }, { status: 404 });
      }
      user = data;
    } else if (userEmail) {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('email', userEmail)
        .single();
      
      if (error || !data) {
        return NextResponse.json({
          success: false,
          error: `Utilisateur non trouvé avec l'email: ${userEmail}`
        }, { status: 404 });
      }
      user = data;
    } else if (userName) {
      // Rechercher par nom (full_name contient le nom)
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .ilike('full_name', `%${userName}%`)
        .single();
      
      if (error || !data) {
        return NextResponse.json({
          success: false,
          error: `Utilisateur non trouvé avec le nom: ${userName}`
        }, { status: 404 });
      }
      user = data;
    } else {
      return NextResponse.json({
        success: false,
        error: 'userEmail, userName ou userId requis'
      }, { status: 400 });
    }

    console.log('👤 Utilisateur trouvé:', {
      id: user.id,
      email: user.email,
      full_name: user.full_name
    });

    // Trouver l'activation de home-assistant pour cet utilisateur
    const { data: activations, error: activationError } = await supabase
      .from('user_applications')
      .select('*')
      .eq('user_id', user.id)
      .eq('module_id', 'home-assistant')
      .eq('is_active', true);

    if (activationError) {
      console.error('❌ Erreur lors de la recherche des activations:', activationError);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la recherche des activations'
      }, { status: 500 });
    }

    if (!activations || activations.length === 0) {
      return NextResponse.json({
        success: false,
        error: `Aucune activation active de home-assistant trouvée pour l'utilisateur ${user.email}`
      }, { status: 404 });
    }

    console.log(`📋 ${activations.length} activation(s) trouvée(s) pour home-assistant`);

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
        error: 'Erreur lors de la fermeture des accès'
      }, { status: 500 });
    }

    console.log(`✅ ${updatedActivations?.length || 0} accès home-assistant fermé(s) avec succès`);

    return NextResponse.json({
      success: true,
      message: `Accès à home-assistant fermé pour ${user.email}`,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name
      },
      deactivatedCount: updatedActivations?.length || 0,
      deactivatedActivations: updatedActivations
    });

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
    return NextResponse.json({
      success: false,
      error: `Erreur serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    }, { status: 500 });
  }
}
