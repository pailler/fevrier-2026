import { NextRequest, NextResponse } from 'next/server';

const LIBRESPEED_SERVICE_URL = process.env.LIBRESPEED_SERVICE_URL || 'https://librespeed.iahome.fr';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test du proxy LibreSpeed...');
    
    // Test de connexion directe au service LibreSpeed
    const testUrl = `${LIBRESPEED_SERVICE_URL}/`;
    console.log(`🔍 Test de connexion vers: ${testUrl}`);
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'IAHome-Librespeed-Test/1.0'
      },
      // Timeout de 10 secondes
      signal: AbortSignal.timeout(10000)
    });
    
    if (response.ok) {
      const contentType = response.headers.get('content-type') || '';
      console.log('✅ Connexion au service LibreSpeed réussie');
      
      return NextResponse.json({
        success: true,
        proxy_status: 'operational',
        librespeed_service_status: 'healthy',
        librespeed_service_url: LIBRESPEED_SERVICE_URL,
        content_type: contentType,
        response_size: response.headers.get('content-length') || 'unknown',
        timestamp: new Date().toISOString()
      });
    } else {
      console.log(`❌ Service LibreSpeed non accessible - Status: ${response.status}`);
      
      return NextResponse.json({
        success: false,
        proxy_status: 'operational',
        librespeed_service_status: 'unhealthy',
        librespeed_service_url: LIBRESPEED_SERVICE_URL,
        error: `Service LibreSpeed retourne ${response.status}`,
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }
    
  } catch (error) {
    console.error('❌ Erreur test proxy LibreSpeed:', error);
    
    return NextResponse.json({
      success: false,
      proxy_status: 'error',
      librespeed_service_status: 'unreachable',
      librespeed_service_url: LIBRESPEED_SERVICE_URL,
      error: error instanceof Error ? error.message : 'Erreur de connexion',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}


