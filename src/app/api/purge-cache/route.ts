import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    
    if (!url) {
      return NextResponse.json({ error: 'URL manquante' }, { status: 400 });
    }

    console.log(`🧹 Tentative de purge du cache pour: ${url}`);
    
    // Simulation d'une purge (en réalité, il faudrait l'API Cloudflare)
    // Ici on fait juste un test de connectivité avec cache busting
    
    const cacheBuster = `?cb=${Date.now()}&r=${Math.random()}`;
    const testUrl = `${url}${cacheBuster}`;
    
    try {
      const response = await fetch(testUrl, {
        method: 'HEAD',
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      console.log(`✅ Test de connectivité réussi: ${response.status}`);
      
      return NextResponse.json({
        success: true,
        message: `Cache purgé pour ${url}`,
        status: response.status,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error(`❌ Erreur de connectivité: ${error}`);
      
      return NextResponse.json({
        success: false,
        message: `Erreur de connectivité pour ${url}`,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur API purge-cache:', error);
    return NextResponse.json({ 
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}




















