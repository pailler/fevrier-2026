import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    // Récupérer tous les utilisateurs de la vue users_view
    const { data: users, error: usersError } = await supabase
      .from('users_view')
      .select('*')
      .order('created_at', { ascending: false });

    if (usersError) {
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la récupération des utilisateurs'
      }, { status: 500 });
    }

    // Récupérer aussi les modules disponibles
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('id, title, description, category')
      .order('title', { ascending: true });

    if (modulesError) {
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
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}

