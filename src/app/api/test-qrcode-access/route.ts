import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session?.user) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    // Tester la connexion au service QR Code
    const qrServiceUrl = process.env.QR_CODE_SERVICE_URL || 'https://qrcode.iahome.fr';
    
    try {
      const response = await fetch(qrServiceUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'IAHome-Test/1.0'
        },
        // Timeout de 5 secondes
        signal: AbortSignal.timeout(5000)
      });

      const isAccessible = response.ok;
      
      return NextResponse.json({
        success: true,
        qrServiceUrl,
        isAccessible,
        status: response.status,
        statusText: response.statusText,
        user: {
          id: session.user.id,
          email: session.user.email
        },
        timestamp: new Date().toISOString()
      });

    } catch (fetchError) {
      console.error('Erreur test connexion QR Code:', fetchError);
      
      return NextResponse.json({
        success: false,
        qrServiceUrl,
        isAccessible: false,
        error: fetchError instanceof Error ? fetchError.message : 'Erreur de connexion',
        user: {
          id: session.user.id,
          email: session.user.email
        },
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Erreur test accès QR Code:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}


