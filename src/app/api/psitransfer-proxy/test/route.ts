import { NextRequest, NextResponse } from 'next/server';

const PSITRANSFER_SERVICE_URL = process.env.PSITRANSFER_SERVICE_URL || 'https://psitransfer.iahome.fr';

export async function GET(request: NextRequest) {
  try {
    // Test de connectivité de base
    const response = await fetch(PSITRANSFER_SERVICE_URL, {
      method: 'GET',
      headers: {
        'User-Agent': 'IAHome-PsiTransfer-Proxy-Test/1.0',
      },
    });

    const contentType = response.headers.get('content-type') || '';
    const isHtml = contentType.includes('text/html');
    
    return NextResponse.json({
      status: 'success',
      service: 'psitransfer-proxy-test',
      target: PSITRANSFER_SERVICE_URL,
      timestamp: new Date().toISOString(),
      responseStatus: response.status,
      contentType: contentType,
      isHtml: isHtml,
      contentLength: response.headers.get('content-length'),
      server: response.headers.get('server'),
      poweredBy: response.headers.get('x-powered-by'),
      testResult: response.ok ? 'Target service is accessible' : 'Target service returned error status',
    });
  } catch (error) {
    console.error('PsiTransfer test error:', error);
    return NextResponse.json({
      status: 'error',
      service: 'psitransfer-proxy-test',
      target: PSITRANSFER_SERVICE_URL,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      testResult: 'Failed to connect to target service',
    }, { status: 500 });
  }
}


