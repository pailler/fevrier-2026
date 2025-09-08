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
  
  return modified;
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Proxy PDF+ racine - redirection vers le service');
    
    const response = await fetch(PDF_SERVICE_URL, {
      method: 'GET',
      headers: {
        'User-Agent': request.headers.get('user-agent') || '',
        'Accept': request.headers.get('accept') || '*/*',
        'Accept-Language': request.headers.get('accept-language') || '',
        'Cache-Control': request.headers.get('cache-control') || '',
      },
    });

    if (!response.ok) {
      console.error(`❌ Erreur proxy PDF+ racine: ${response.status} ${response.statusText}`);
      return new NextResponse(`Erreur PDF+ Service: ${response.status}`, { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'text/html';
    const content = await response.text();
    
    let modifiedContent = content;
    
    // Réécrire les URLs seulement pour le contenu HTML
    if (contentType.includes('text/html')) {
      modifiedContent = rewritePdfUrls(content);
    }
    
    return new NextResponse(modifiedContent, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': response.headers.get('cache-control') || 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
    
  } catch (error) {
    console.error('❌ Erreur proxy PDF+ racine:', error);
    return new NextResponse('Erreur interne du proxy PDF+', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Proxy PDF+ racine POST - redirection vers le service');
    
    const body = await request.text();
    const headers = new Headers();
    
    // Copier les headers pertinents
    request.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'host' && key.toLowerCase() !== 'origin') {
        headers.set(key, value);
      }
    });
    
    const response = await fetch(PDF_SERVICE_URL, {
      method: 'POST',
      headers,
      body,
    });

    if (!response.ok) {
      console.error(`❌ Erreur proxy PDF+ racine POST: ${response.status} ${response.statusText}`);
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
    console.error('❌ Erreur proxy PDF+ racine POST:', error);
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


