import { NextRequest, NextResponse } from 'next/server';

const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL || 'https://pdf.regispailler.fr';

// Fonction pour réécrire les URLs dans le contenu HTML
function rewritePdfUrls(html: string): string {
  let modified = html;
  
  // Gérer la balise base href
  if (/\<base\s+href=/i.test(modified)) {
    modified = modified.replace(/<base\s+href="[^"]*"\s*\/>|<base\s+href="[^"]*"\s*>/i, '<base href="/api/pdf-proxy/">');
  } else if (modified.includes('<head>')) {
    modified = modified.replace('<head>', '<head><base href="/api/pdf-proxy/">');
  }
  
  // Réécrire les URLs relatives commençant par /
  modified = modified.replace(/<(script|link|img|a)([^>]*?)\s(src|href)="\/([^"']+)"/gi, (m, tag, attrs, attr, path) => {
    if (path.startsWith('api/pdf-proxy/')) return m;
    return `<${tag}${attrs} ${attr}="/api/pdf-proxy/${path}"`;
  });
  
  // Réécrire les URLs absolues de pdf.regispailler.fr
  modified = modified.replace(/https?:\/\/pdf\.regispailler\.fr\//g, '/api/pdf-proxy/');
  
  // Réécrire les URLs d'images spécifiques qui causent des erreurs 404
  modified = modified.replace(/\/images\/([^"']+)/g, '/api/pdf-proxy/static/images/$1');
  modified = modified.replace(/\/fonts\/([^"']+)/g, '/api/pdf-proxy/static/fonts/$1');
  modified = modified.replace(/\/files\/([^"']+)/g, '/api/pdf-proxy/static/files/$1');
  
  // Réécrire les URLs de ressources statiques sans le préfixe /
  modified = modified.replace(/"(images\/[^"']+)"/g, '"/api/pdf-proxy/static/$1"');
  modified = modified.replace(/"(fonts\/[^"']+)"/g, '"/api/pdf-proxy/static/$1"');
  modified = modified.replace(/"(files\/[^"']+)"/g, '"/api/pdf-proxy/static/$1"');
  
  // Réécrire les URLs dans les attributs style
  modified = modified.replace(/url\(['"]?\/images\/([^"']+)['"]?\)/g, 'url("/api/pdf-proxy/static/images/$1")');
  modified = modified.replace(/url\(['"]?\/fonts\/([^"']+)['"]?\)/g, 'url("/api/pdf-proxy/static/fonts/$1")');
  modified = modified.replace(/url\(['"]?\/files\/([^"']+)['"]?\)/g, 'url("/api/pdf-proxy/static/files/$1")');
  
  return modified;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const pathParams = await params;
    const path = pathParams.path.join('/');
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    
    const targetUrl = `${PDF_SERVICE_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;
    
    console.log(`🔍 Proxy PDF+ GET: ${targetUrl}`);
    
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': request.headers.get('user-agent') || '',
        'Accept': request.headers.get('accept') || '*/*',
        'Accept-Language': request.headers.get('accept-language') || '',
        'Cache-Control': request.headers.get('cache-control') || '',
        'Referer': `${PDF_SERVICE_URL}/`,
        'Origin': PDF_SERVICE_URL,
        'Accept-Encoding': request.headers.get('accept-encoding') || '',
        'Connection': 'keep-alive',
      },
    });

    if (!response.ok) {
      console.error(`❌ Erreur proxy PDF+ GET: ${response.status} ${response.statusText}`);
      return new NextResponse(`Erreur PDF+ Service: ${response.status}`, { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'text/html';
    const content = await response.text();
    
    let modifiedContent = content;
    
    // Réécrire les URLs seulement pour le contenu HTML
    if (contentType.includes('text/html')) {
      modifiedContent = rewritePdfUrls(content);
    }
    
    // Copier tous les headers de la réponse originale
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      responseHeaders.set(key, value);
    });
    
    // Ajouter les headers CORS et de proxy
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // S'assurer que le Content-Type est correct
    if (contentType) {
      responseHeaders.set('Content-Type', contentType);
    }
    
    return new NextResponse(modifiedContent, {
      status: response.status,
      headers: responseHeaders,
    });
    
  } catch (error) {
    console.error('❌ Erreur proxy PDF+ GET:', error);
    return new NextResponse('Erreur interne du proxy PDF+', { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const pathParams = await params;
    const path = pathParams.path.join('/');
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    
    const targetUrl = `${PDF_SERVICE_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;
    
    console.log(`🔍 Proxy PDF+ POST: ${targetUrl}`);
    
    const body = await request.text();
    const headers = new Headers();
    
    // Copier les headers pertinents
    request.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'host' && key.toLowerCase() !== 'origin') {
        headers.set(key, value);
      }
    });
    
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body,
    });

    if (!response.ok) {
      console.error(`❌ Erreur proxy PDF+ POST: ${response.status} ${response.statusText}`);
      return new NextResponse(`Erreur PDF+ Service: ${response.status}`, { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'application/json';
    const content = await response.text();
    
    return new NextResponse(content, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
    
  } catch (error) {
    console.error('❌ Erreur proxy PDF+ POST:', error);
    return new NextResponse('Erreur interne du proxy PDF+', { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const pathParams = await params;
    const path = pathParams.path.join('/');
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    
    const targetUrl = `${PDF_SERVICE_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;
    
    console.log(`🔍 Proxy PDF+ PUT: ${targetUrl}`);
    
    const body = await request.text();
    const headers = new Headers();
    
    request.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'host' && key.toLowerCase() !== 'origin') {
        headers.set(key, value);
      }
    });
    
    const response = await fetch(targetUrl, {
      method: 'PUT',
      headers,
      body,
    });

    if (!response.ok) {
      console.error(`❌ Erreur proxy PDF+ PUT: ${response.status} ${response.statusText}`);
      return new NextResponse(`Erreur PDF+ Service: ${response.status}`, { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'application/json';
    const content = await response.text();
    
    return new NextResponse(content, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
    
  } catch (error) {
    console.error('❌ Erreur proxy PDF+ PUT:', error);
    return new NextResponse('Erreur interne du proxy PDF+', { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const pathParams = await params;
    const path = pathParams.path.join('/');
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    
    const targetUrl = `${PDF_SERVICE_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;
    
    console.log(`🔍 Proxy PDF+ DELETE: ${targetUrl}`);
    
    const headers = new Headers();
    
    request.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'host' && key.toLowerCase() !== 'origin') {
        headers.set(key, value);
      }
    });
    
    const response = await fetch(targetUrl, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      console.error(`❌ Erreur proxy PDF+ DELETE: ${response.status} ${response.statusText}`);
      return new NextResponse(`Erreur PDF+ Service: ${response.status}`, { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'application/json';
    const content = await response.text();
    
    return new NextResponse(content, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
    
  } catch (error) {
    console.error('❌ Erreur proxy PDF+ DELETE:', error);
    return new NextResponse('Erreur interne du proxy PDF+', { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
