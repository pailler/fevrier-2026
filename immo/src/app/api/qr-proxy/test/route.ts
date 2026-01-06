import { NextRequest, NextResponse } from 'next/server';

const QR_CODE_SERVICE_URL = process.env.QR_CODE_SERVICE_URL || 'https://qrcode.iahome.fr';

export async function GET(request: NextRequest) {
  try {
    ;
    
    // Test de connexion directe au service QR
    const healthUrl = `${QR_CODE_SERVICE_URL}/health`;
    console.log(`🔍 Test de connexion vers: ${healthUrl}`);
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'IAHome-Proxy-Test/1.0'
      },
      // Timeout de 10 secondes
      signal: AbortSignal.timeout(10000)
    });
    
    if (response.ok) {
      const data = await response.json();
      ;
      
      return NextResponse.json({
        success: true,
        proxy_status: 'operational',
        qr_service_status: 'healthy',
        qr_service_version: data.version,
        qr_service_url: QR_CODE_SERVICE_URL,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log(`❌ Service QR non accessible - Status: ${response.status}`);
      
      return NextResponse.json({
        success: false,
        proxy_status: 'operational',
        qr_service_status: 'unhealthy',
        qr_service_url: QR_CODE_SERVICE_URL,
        error: `Service QR retourne ${response.status}`,
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }
    
  } catch (error) {
    console.error('❌ Erreur test proxy QR:', error);
    
    return NextResponse.json({
      success: false,
      proxy_status: 'error',
      qr_service_status: 'unreachable',
      qr_service_url: QR_CODE_SERVICE_URL,
      error: error instanceof Error ? error.message : 'Erreur de connexion',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

