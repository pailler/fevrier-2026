import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 QR Sessions: Initialisation de la table...');

    // Créer la table qr_sessions si elle n'existe pas
    const { error: createTableError } = await supabase.rpc('create_qr_sessions_table');

    if (createTableError) {
      console.error('❌ QR Sessions: Erreur création table:', createTableError);
      return new NextResponse('Error creating table', { status: 500 });
    }

    console.log('✅ QR Sessions: Table créée avec succès');
    
    return new NextResponse(JSON.stringify({
      success: true,
      message: 'QR sessions table created successfully'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('❌ QR Sessions Init Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
