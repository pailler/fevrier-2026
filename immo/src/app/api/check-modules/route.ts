import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    // Récupérer tous les modules
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('*')
      .order('title', { ascending: true });

    if (modulesError) {
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la récupération des modules',
        details: modulesError
      }, { status: 500 });
    }

    // Chercher spécifiquement le module ruinedfooocus
    const { data: ruinedfooocus, error: rfError } = await supabase
      .from('modules')
      .select('*')
      .or('id.eq.ruinedfooocus,title.ilike.%ruinedfooocus%')
      .limit(5);

    return NextResponse.json({
      success: true,
      modules: modules || [],
      ruinedfooocus: ruinedfooocus || [],
      summary: {
        totalModules: modules?.length || 0,
        ruinedfooocusFound: ruinedfooocus?.length || 0
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}

