import { NextRequest, NextResponse } from 'next/server';

const METUBE_SERVICE_URL = process.env.METUBE_SERVICE_URL || 'https://metube.iahome.fr';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(METUBE_SERVICE_URL, {
      method: 'GET',
      headers: {
        'User-Agent': 'IAHome-Metube-Proxy/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Cache-Control': 'no-cache',
      },
    });

    const status = response.status;
    const contentType = response.headers.get('content-type') || '';
    const isSuccess = status >= 200 && status < 400;

    return NextResponse.json({
      service: 'MeTube',
      test: 'connectivity',
      success: isSuccess,
      httpStatus: status,
      contentType: contentType,
      url: METUBE_SERVICE_URL,
      timestamp: new Date().toISOString(),
      proxy: 'IAHome-Metube-Proxy',
      message: isSuccess ? 'Connexion réussie' : 'Échec de connexion',
    }, {
      status: isSuccess ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache',
        'X-Proxy-By': 'IAHome-Metube-Proxy',
      },
    });
  } catch (error) {
    console.error('Erreur de test MeTube:', error);
    return NextResponse.json({
      service: 'MeTube',
      test: 'connectivity',
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      url: METUBE_SERVICE_URL,
      timestamp: new Date().toISOString(),
      proxy: 'IAHome-Metube-Proxy',
      message: 'Erreur de connexion',
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache',
        'X-Proxy-By': 'IAHome-Metube-Proxy',
      },
    });
  }
}


