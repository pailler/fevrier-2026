import { NextRequest, NextResponse } from 'next/server';

const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL || 'https://pdf.iahome.fr';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test du proxy PDF+...');
    
    const testUrl = `${PDF_SERVICE_URL}/`;
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'IAHome-Test/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (response.ok) {
      const contentType = response.headers.get('content-type') || '';
      console.log('✅ Test PDF+ réussi');
      
      return NextResponse.json({
        success: true,
        service: 'PDF+ Proxy',
        backend: PDF_SERVICE_URL,
        timestamp: new Date().toISOString(),
        status: response.status,
        contentType: contentType,
        message: 'Le proxy PDF+ peut accéder au service backend',
        details: {
          url: testUrl,
          method: 'GET',
          responseSize: 'OK'
        }
      });
    } else {
      console.error(`❌ Test PDF+ échoué: ${response.status} ${response.statusText}`);
      return NextResponse.json({
        success: false,
        service: 'PDF+ Proxy',
        backend: PDF_SERVICE_URL,
        timestamp: new Date().toISOString(),
        status: response.status,
        error: `Erreur ${response.status}: ${response.statusText}`,
        message: 'Le proxy PDF+ ne peut pas accéder au service backend'
      }, { status: 503 });
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test PDF+:', error);
    return NextResponse.json({
      success: false,
      service: 'PDF+ Proxy',
      backend: PDF_SERVICE_URL,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      message: 'Erreur lors du test du proxy PDF+'
    }, { status: 500 });
  }
}


