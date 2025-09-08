import { NextRequest, NextResponse } from 'next/server';

const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL || 'https://pdf.regispailler.fr';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const pathParams = await params;
    const path = pathParams.path.join('/');
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    
    // Construire l'URL cible pour les ressources statiques
    const targetUrl = `${PDF_SERVICE_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;
    
    console.log(`🔍 Proxy PDF+ Static GET: ${targetUrl}`);
    
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': request.headers.get('user-agent') || '',
        'Accept': request.headers.get('accept') || '*/*',
        'Accept-Language': request.headers.get('accept-language') || '',
        'Cache-Control': 'public, max-age=31536000', // Cache long pour les ressources statiques
        'Referer': `${PDF_SERVICE_URL}/`,
        'Origin': PDF_SERVICE_URL,
        'Accept-Encoding': request.headers.get('accept-encoding') || '',
        'Connection': 'keep-alive',
      },
    });

    if (!response.ok) {
      console.error(`❌ Erreur proxy PDF+ Static GET: ${response.status} ${response.statusText}`);
      return new NextResponse(`Erreur PDF+ Service: ${response.status}`, { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const content = await response.arrayBuffer(); // Utiliser arrayBuffer pour les ressources binaires
    
    // Copier tous les headers de la réponse originale
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      responseHeaders.set(key, value);
    });
    
    // Ajouter les headers CORS et de proxy
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // S'assurer que le Content-Type est correct
    if (contentType) {
      responseHeaders.set('Content-Type', contentType);
    }
    
    // Ajouter des headers de cache pour les ressources statiques
    responseHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');
    
    return new NextResponse(content, {
      status: response.status,
      headers: responseHeaders,
    });
    
  } catch (error) {
    console.error('❌ Erreur proxy PDF+ Static GET:', error);
    return new NextResponse('Erreur interne du proxy PDF+ Static', { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}


