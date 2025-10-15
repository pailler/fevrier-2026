import { NextRequest, NextResponse } from 'next/server';

const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL || 'https://pdf.iahome.fr';

export async function GET(request: NextRequest) {
  try {
    ;
    
    const healthUrl = `${PDF_SERVICE_URL}/`;
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'IAHome-Health-Check/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (response.ok) {
      ;
      return NextResponse.json({
        status: 'healthy',
        service: 'PDF+ Proxy',
        backend: PDF_SERVICE_URL,
        timestamp: new Date().toISOString(),
        responseTime: 'OK',
        message: 'Le proxy PDF+ fonctionne correctement'
      });
    } else {
      console.error(`❌ Service PDF+ inaccessible: ${response.status} ${response.statusText}`);
      return NextResponse.json({
        status: 'unhealthy',
        service: 'PDF+ Proxy',
        backend: PDF_SERVICE_URL,
        timestamp: new Date().toISOString(),
        error: `Erreur ${response.status}: ${response.statusText}`,
        message: 'Le service PDF+ backend n\'est pas accessible'
      }, { status: 503 });
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test de santé PDF+:', error);
    return NextResponse.json({
      status: 'error',
      service: 'PDF+ Proxy',
      backend: PDF_SERVICE_URL,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      message: 'Impossible de contacter le service PDF+ backend'
    }, { status: 500 });
  }
}

