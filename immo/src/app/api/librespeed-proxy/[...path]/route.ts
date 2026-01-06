import { NextRequest, NextResponse } from 'next/server';

const LIBRESPEED_SERVICE_URL = process.env.LIBRESPEED_SERVICE_URL || 'https://librespeed.iahome.fr';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const pathParams = await params;
    const path = pathParams.path.join('/');
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    
    // Construire l'URL de destination
    const targetUrl = `${LIBRESPEED_SERVICE_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;
    
    console.log(`🔍 Proxy LibreSpeed GET: ${targetUrl}`);
    
    // Faire la requête vers le service LibreSpeed
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'IAHome-Librespeed-Proxy/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
    });
    
    // Récupérer le contenu
    const contentType = response.headers.get('content-type') || 'text/html';
    const content = await response.text();
    
    // Réécrire les URLs si c'est du HTML
    let modifiedContent = content;
    if (contentType.includes('text/html')) {
      modifiedContent = rewriteLibrespeedUrls(content);
    }
    
    return new NextResponse(modifiedContent, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'X-Proxy-By': 'IAHome-Librespeed-Proxy',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src *; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; frame-ancestors 'self'",
        'X-Frame-Options': 'SAMEORIGIN',
      },
    });
    
  } catch (error) {
    console.error('❌ Erreur proxy LibreSpeed GET:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const pathParams = await params;
    const path = pathParams.path.join('/');
    const body = await request.text();
    
    // Construire l'URL de destination
    const targetUrl = `${LIBRESPEED_SERVICE_URL}/${path}`;
    
    console.log(`🔍 Proxy LibreSpeed POST: ${targetUrl}`);
    
    // Faire la requête vers le service LibreSpeed
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'User-Agent': 'IAHome-Librespeed-Proxy/1.0',
        'Content-Type': request.headers.get('content-type') || 'application/json',
        'Accept': 'application/json,text/html,*/*',
      },
      body: body,
    });
    
    const contentType = response.headers.get('content-type') || 'application/json';
    const content = await response.text();
    
    return new NextResponse(content, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'X-Proxy-By': 'IAHome-Librespeed-Proxy',
      },
    });
    
  } catch (error) {
    console.error('❌ Erreur proxy LibreSpeed POST:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const pathParams = await params;
    const path = pathParams.path.join('/');
    const body = await request.text();
    
    // Construire l'URL de destination
    const targetUrl = `${LIBRESPEED_SERVICE_URL}/${path}`;
    
    console.log(`🔍 Proxy LibreSpeed PUT: ${targetUrl}`);
    
    // Faire la requête vers le service LibreSpeed
    const response = await fetch(targetUrl, {
      method: 'PUT',
      headers: {
        'User-Agent': 'IAHome-Librespeed-Proxy/1.0',
        'Content-Type': request.headers.get('content-type') || 'application/json',
        'Accept': 'application/json,text/html,*/*',
      },
      body: body,
    });
    
    const contentType = response.headers.get('content-type') || 'application/json';
    const content = await response.text();
    
    return new NextResponse(content, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'X-Proxy-By': 'IAHome-Librespeed-Proxy',
      },
    });
    
  } catch (error) {
    console.error('❌ Erreur proxy LibreSpeed PUT:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const pathParams = await params;
    const path = pathParams.path.join('/');
    
    // Construire l'URL de destination
    const targetUrl = `${LIBRESPEED_SERVICE_URL}/${path}`;
    
    console.log(`🔍 Proxy LibreSpeed DELETE: ${targetUrl}`);
    
    // Faire la requête vers le service LibreSpeed
    const response = await fetch(targetUrl, {
      method: 'DELETE',
      headers: {
        'User-Agent': 'IAHome-Librespeed-Proxy/1.0',
        'Accept': 'application/json,text/html,*/*',
      },
    });
    
    const contentType = response.headers.get('content-type') || 'application/json';
    const content = await response.text();
    
    return new NextResponse(content, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'X-Proxy-By': 'IAHome-Librespeed-Proxy',
      },
    });
    
  } catch (error) {
    console.error('❌ Erreur proxy LibreSpeed DELETE:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

// Fonction pour réécrire les URLs dans le HTML
function rewriteLibrespeedUrls(html: string): string {
  let modified = html;
  
  // Injecter/normaliser <base> pour les chemins relatifs
  if (/\<base\s+href=/i.test(modified)) {
    modified = modified.replace(/<base\s+href="[^"]*"\s*\/>|<base\s+href="[^"]*"\s*>/i, '<base href="/api/librespeed-proxy/">');
  } else if (modified.includes('<head>')) {
    modified = modified.replace('<head>', '<head><base href="/api/librespeed-proxy/">');
  }
  
  // Réécrire les URLs absolues
  modified = modified.replace(/<(script|link|img|a)([^>]*?)\s(src|href)="\/([^"']+)"/gi, (m, tag, attrs, attr, path) => {
    if (path.startsWith('api/librespeed-proxy/')) return m;
    return `<${tag}${attrs} ${attr}="/api/librespeed-proxy/${path}"`;
  });
  
  // Réécrire les URLs complètes vers librespeed.iahome.fr
  modified = modified.replace(/https?:\/\/librespeed\.regispailler\.fr\//g, '/api/librespeed-proxy/');
  
  return modified;
}


