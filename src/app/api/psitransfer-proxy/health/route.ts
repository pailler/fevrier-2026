import { NextRequest, NextResponse } from 'next/server';

const PSITRANSFER_SERVICE_URL = process.env.PSITRANSFER_SERVICE_URL || 'https://psitransfer.iahome.fr';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(PSITRANSFER_SERVICE_URL, {
      method: 'GET',
      headers: {
        'User-Agent': 'IAHome-PsiTransfer-Proxy/1.0',
      },
    });

    if (response.ok) {
      return NextResponse.json({
        status: 'healthy',
        service: 'psitransfer-proxy',
        target: PSITRANSFER_SERVICE_URL,
        timestamp: new Date().toISOString(),
        responseStatus: response.status,
      });
    } else {
      return NextResponse.json({
        status: 'unhealthy',
        service: 'psitransfer-proxy',
        target: PSITRANSFER_SERVICE_URL,
        timestamp: new Date().toISOString(),
        error: `Target service returned ${response.status}`,
        responseStatus: response.status,
      }, { status: 503 });
    }
  } catch (error) {
    console.error('PsiTransfer health check error:', error);
    return NextResponse.json({
      status: 'error',
      service: 'psitransfer-proxy',
      target: PSITRANSFER_SERVICE_URL,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

