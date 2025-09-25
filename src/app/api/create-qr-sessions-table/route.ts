import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 QR Sessions: Création de la table...');

    // Créer la table qr_sessions
    const { error: createTableError } = await supabase
      .from('qr_sessions')
      .select('*')
      .limit(1);

    if (createTableError && createTableError.code === 'PGRST116') {
      // La table n'existe pas, la créer
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS qr_sessions (
          id SERIAL PRIMARY KEY,
          session_id VARCHAR(255) UNIQUE NOT NULL,
          user_id UUID NOT NULL,
          user_email VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          is_active BOOLEAN DEFAULT true,
          last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_qr_sessions_session_id ON qr_sessions(session_id);
        CREATE INDEX IF NOT EXISTS idx_qr_sessions_user_id ON qr_sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_qr_sessions_expires_at ON qr_sessions(expires_at);
      `;

      const { error: sqlError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
      
      if (sqlError) {
        console.error('❌ QR Sessions: Erreur création table SQL:', sqlError);
        return new NextResponse('Error creating table with SQL', { status: 500 });
      }
    } else if (createTableError) {
      console.error('❌ QR Sessions: Erreur vérification table:', createTableError);
      return new NextResponse('Error checking table', { status: 500 });
    }

    console.log('✅ QR Sessions: Table créée/vérifiée avec succès');
    
    return new NextResponse(JSON.stringify({
      success: true,
      message: 'QR sessions table created/verified successfully'
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
