import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Liste des utilisateurs depuis users_view...');

    // Récupérer tous les utilisateurs de la vue users_view
    const { data: users, error: usersError } = await supabase
      .from('users_view')
      .select('*')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', usersError);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la récupération des utilisateurs'
      }, { status: 500 });
    }

    console.log('✅ Utilisateurs trouvés:', users?.length || 0);

    // Récupérer aussi les modules disponibles
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('id, title, description, category')
      .order('title', { ascending: true });

    if (modulesError) {
      console.warn('⚠️ Erreur lors de la récupération des modules:', modulesError);
    }

    return NextResponse.json({
      success: true,
      users: users || [],
      modules: modules || [],
      summary: {
        totalUsers: users?.length || 0,
        totalModules: modules?.length || 0
      }
    });

  } catch (error) {
    console.error('❌ Erreur liste utilisateurs:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}






