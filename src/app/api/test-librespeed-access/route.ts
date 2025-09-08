import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Test de l\'accès LibreSpeed depuis l\'interface...');

    // Simuler une requête depuis l'interface
    const testRequest = new Request('https://librespeed.iahome.fr', {
      method: 'GET',
      headers: {
        'Host': 'librespeed.iahome.fr',
        'Referer': 'https://iahome.fr/encours',
        'Origin': 'https://iahome.fr',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // Appeler notre proxy d'authentification
    const response = await fetch('http://localhost:3000/api/check-auth', {
      method: 'GET',
      headers: {
        'Host': 'librespeed.iahome.fr',
        'Referer': 'https://iahome.fr/encours',
        'Origin': 'https://iahome.fr',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const responseText = await response.text();
    console.log('📋 Réponse du proxy:', response.status, responseText);

    return NextResponse.json({
      success: true,
      message: 'Test d\'accès LibreSpeed terminé',
      data: {
        status: response.status,
        response: responseText,
        headers: Object.fromEntries(response.headers.entries())
      }
    });

  } catch (error) {
    console.error('❌ Erreur test accès LibreSpeed:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur',
      details: error
    }, { status: 500 });
  }
}

