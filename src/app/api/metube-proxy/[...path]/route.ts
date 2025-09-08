import { NextRequest, NextResponse } from 'next/server';

const METUBE_SERVICE_URL = process.env.METUBE_SERVICE_URL || 'https://metube.regispailler.fr';

function rewriteMetubeUrls(html: string): string {
  let modified = html;
  
  // Normaliser ou injecter <base> pour résoudre les chemins relatifs via le proxy
  if (/\<base\s+href=/i.test(modified)) {
    modified = modified.replace(/<base\s+href="[^"]*"\s*\/>|<base\s+href="[^"]*"\s*>/i, '<base href="/api/metube-proxy/">');
  } else if (modified.includes('<head>')) {
    modified = modified.replace('<head>', '<head><base href="/api/metube-proxy/">');
  }
  
  // Réécrire les chemins absolus src/href sur les balises clés pour passer par le proxy
  modified = modified.replace(/<(script|link|img|a)([^>]*?)\s(src|href)="\/([^"']+)"/gi, (m, tag, attrs, attr, path) => {
    if (path.startsWith('api/metube-proxy/')) return m;
    return `<${tag}${attrs} ${attr}="/api/metube-proxy/${path}"`;
  });
  
  // Réécrire les URLs absolues vers metube.regispailler.fr
  modified = modified.replace(/https?:\/\/metube\.regispailler\.fr\//g, '/api/metube-proxy/');
  
  // Réécrire les appels API
  modified = modified.replace(/fetch\(\s*['\"](\/api\/[^'\"]+)['\"]/g, (m, p) => `fetch('/api/metube-proxy${p}'`);
  modified = modified.replace(/url:\s*['\"](\/api\/[^'\"]+)['\"]/g, (m, p) => `url: '/api/metube-proxy${p}'`);
  
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
    const targetUrl = `${METUBE_SERVICE_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'IAHome-Metube-Proxy/1.0',
        'Accept': request.headers.get('accept') || '*/*',
        'Accept-Language': request.headers.get('accept-language') || 'fr-FR,fr;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
      },
    });

    const contentType = response.headers.get('content-type') || 'text/plain';
    const status = response.status;
    const body = await response.text();

    // Réécrire les URLs si c'est du HTML
    let modifiedBody = body;
    if (contentType.includes('text/html')) {
      modifiedBody = rewriteMetubeUrls(body);
    }

    return new NextResponse(modifiedBody, {
      status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'X-Proxy-By': 'IAHome-Metube-Proxy',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Erreur proxy MeTube:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
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
    const targetUrl = `${METUBE_SERVICE_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;

    const body = await request.text();
    const headers = new Headers();
    
    // Copier les headers importants
    request.headers.forEach((value, key) => {
      if (!['host', 'origin', 'referer'].includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    });

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body,
    });

    const contentType = response.headers.get('content-type') || 'text/plain';
    const status = response.status;
    const responseBody = await response.text();

    return new NextResponse(responseBody, {
      status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'X-Proxy-By': 'IAHome-Metube-Proxy',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Erreur proxy MeTube POST:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
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
    const targetUrl = `${METUBE_SERVICE_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;

    const body = await request.text();
    const headers = new Headers();
    
    request.headers.forEach((value, key) => {
      if (!['host', 'origin', 'referer'].includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    });

    const response = await fetch(targetUrl, {
      method: 'PUT',
      headers,
      body,
    });

    const contentType = response.headers.get('content-type') || 'text/plain';
    const status = response.status;
    const responseBody = await response.text();

    return new NextResponse(responseBody, {
      status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'X-Proxy-By': 'IAHome-Metube-Proxy',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Erreur proxy MeTube PUT:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
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
    const targetUrl = `${METUBE_SERVICE_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;

    const headers = new Headers();
    
    request.headers.forEach((value, key) => {
      if (!['host', 'origin', 'referer'].includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    });

    const response = await fetch(targetUrl, {
      method: 'DELETE',
      headers,
    });

    const contentType = response.headers.get('content-type') || 'text/plain';
    const status = response.status;
    const responseBody = await response.text();

    return new NextResponse(responseBody, {
      status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'X-Proxy-By': 'IAHome-Metube-Proxy',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Erreur proxy MeTube DELETE:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}


