import { NextRequest, NextResponse } from 'next/server';

const QR_CODE_SERVICE_URL = process.env.QR_CODE_SERVICE_URL || 'https://qrcode.iahome.fr';

export async function GET(request: NextRequest) {
  try {
    // Test de connexion au service QR
    const healthUrl = `${QR_CODE_SERVICE_URL}/health`;
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'IAHome-Proxy-Health/1.0'
      },
      // Timeout de 5 secondes
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      const data = await response.json();
      
      return NextResponse.json({
        service: "IAHome QR Code Proxy",
        status: "healthy",
        qr_service_status: "healthy",
        qr_service_version: data.version,
        timestamp: new Date().toISOString(),
        version: "1.0.0"
      });
    } else {
      return NextResponse.json({
        service: "IAHome QR Code Proxy",
        status: "degraded",
        qr_service_status: "unhealthy",
        error: `QR service returned ${response.status}`,
        timestamp: new Date().toISOString(),
        version: "1.0.0"
      }, { status: 503 });
    }
    
  } catch (error) {
    return NextResponse.json({
      service: "IAHome QR Code Proxy",
      status: "unhealthy",
      qr_service_status: "unreachable",
      error: error instanceof Error ? error.message : 'Connection error',
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    }, { status: 503 });
  }
}


