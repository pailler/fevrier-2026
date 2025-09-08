import { NextRequest, NextResponse } from 'next/server';

const LIBRESPEED_SERVICE_URL = process.env.LIBRESPEED_SERVICE_URL || 'https://librespeed.regispailler.fr';

export async function GET(request: NextRequest) {
  try {
    // Test de connexion au service LibreSpeed
    const healthUrl = `${LIBRESPEED_SERVICE_URL}/`;
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'IAHome-Librespeed-Health/1.0'
      },
      // Timeout de 5 secondes
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      return NextResponse.json({
        service: "IAHome LibreSpeed Proxy",
        status: "healthy",
        librespeed_service_status: "healthy",
        librespeed_service_url: LIBRESPEED_SERVICE_URL,
        timestamp: new Date().toISOString(),
        version: "1.0.0"
      });
    } else {
      return NextResponse.json({
        service: "IAHome LibreSpeed Proxy",
        status: "degraded",
        librespeed_service_status: "unhealthy",
        error: `LibreSpeed service returned ${response.status}`,
        timestamp: new Date().toISOString(),
        version: "1.0.0"
      }, { status: 503 });
    }
    
  } catch (error) {
    return NextResponse.json({
      service: "IAHome LibreSpeed Proxy",
      status: "unhealthy",
      librespeed_service_status: "unreachable",
      error: error instanceof Error ? error.message : 'Connection error',
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    }, { status: 503 });
  }
}


