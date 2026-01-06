import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    // Essayer de récupérer la structure de la table
    const { data: structure, error: structureError } = await supabase
      .from('user_applications')
      .select('*')
      .limit(1);

    if (structureError) {
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la vérification de la structure',
        details: structureError
      }, { status: 500 });
    }

    // Essayer de récupérer un exemple de données
    const { data: sample, error: sampleError } = await supabase
      .from('user_applications')
      .select('*')
      .limit(5);

    return NextResponse.json({
      success: true,
      structure: structure || [],
      sample: sample || [],
      columns: sample && sample.length > 0 ? Object.keys(sample[0]) : []
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}

