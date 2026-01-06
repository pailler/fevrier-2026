import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    // Essayer de récupérer des données de la table
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .limit(1);

    if (error) {
      return NextResponse.json({
        tableExists: false,
        error: error.message,
        code: error.code
      });
    }

    return NextResponse.json({
      tableExists: true,
      data: data
    });

  } catch (error) {
    return NextResponse.json(
      { 
        tableExists: false,
        error: 'Erreur interne lors de la vérification'
      },
      { status: 500 }
    );
  }
} 