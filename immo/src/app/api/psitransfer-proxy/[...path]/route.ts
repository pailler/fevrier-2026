import { NextRequest, NextResponse } from 'next/server';

const PSITRANSFER_SERVICE_URL = process.env.PSITRANSFER_SERVICE_URL || 'http://localhost:8084';

function rewritePsitransferUrls(html: string): string {
  let modified = html;
  
  // Remplacer les URLs absolues de PsiTransfer (ancien et nouveau)
  modified = modified.replace(/https?:\/\/psitransfer\.regispailler\.fr\//g, '/api/psitransfer-proxy/');
  modified = modified.replace(/https?:\/\/localhost:8084\//g, '/api/psitransfer-proxy/');
  
  // Remplacer le base href pour pointer vers le proxy
  modified = modified.replace(/<base href="\/">/g, '<base href="/api/psitransfer-proxy/">');
  
  // Remplacer les chemins relatifs pour les ressources (sans slash initial)
  modified = modified.replace(/href="assets\//g, 'href="/api/psitransfer-proxy/assets/');
  modified = modified.replace(/src="app\//g, 'src="/api/psitransfer-proxy/app/');
  modified = modified.replace(/src="assets\//g, 'src="/api/psitransfer-proxy/assets/');
  
  // Remplacer les chemins absolus (avec slash initial)
  modified = modified.replace(/href="\/assets\//g, 'href="/api/psitransfer-proxy/assets/');
  modified = modified.replace(/src="\/app\//g, 'src="/api/psitransfer-proxy/app/');
  modified = modified.replace(/src="\/assets\//g, 'src="/api/psitransfer-proxy/assets/');
  
  // Remplacer les chemins dans les attributs style (url())
  modified = modified.replace(/url\(assets\//g, 'url(/api/psitransfer-proxy/assets/');
  modified = modified.replace(/url\(app\//g, 'url(/api/psitransfer-proxy/app/');
  modified = modified.replace(/url\(\/assets\//g, 'url(/api/psitransfer-proxy/assets/');
  modified = modified.replace(/url\(\/app\//g, 'url(/api/psitransfer-proxy/app/');
  
  // Remplacer les URLs dans les attributs data ou autres
  modified = modified.replace(/"(https?:\/\/psitransfer\.regispailler\.fr\/[^"]*)"/g, '"/api/psitransfer-proxy/$1"');
  modified = modified.replace(/"(https?:\/\/localhost:8084\/[^"]*)"/g, '"/api/psitransfer-proxy/$1"');
  
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
    
    const targetUrl = `${PSITRANSFER_SERVICE_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;
    
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        ...Object.fromEntries(request.headers.entries()),
        'host': new URL(PSITRANSFER_SERVICE_URL).host,
      },
    });

    if (!response.ok) {
      return new NextResponse(`PsiTransfer service error: ${response.status}`, { status: response.status });
    }

    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('text/html')) {
      const html = await response.text();
      const modifiedHtml = rewritePsitransferUrls(html);
      
      // Gérer le code de statut 304 qui n'est pas valide pour NextResponse
      const status = response.status === 304 ? 200 : response.status;
      
      return new NextResponse(modifiedHtml, {
        status: status,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          'content-type': 'text/html; charset=utf-8',
          'content-encoding': 'identity',
          'cache-control': 'no-cache, no-store, must-revalidate',
          'X-Frame-Options': 'SAMEORIGIN',
          'Content-Security-Policy': "frame-ancestors 'self' https://iahome.fr;",
          'X-Proxy-By': 'IAHome-PsiTransfer-Proxy'
        },
      });
    } else {
      // Flux direct pour contenus non HTML
      const status = response.status === 304 ? 200 : response.status;
      const passthroughHeaders = new Headers(response.headers);
      // Normaliser encodage pour éviter les erreurs de décodage côté navigateur
      passthroughHeaders.delete('content-encoding');
      passthroughHeaders.delete('content-length');
      passthroughHeaders.set('content-encoding', 'identity');
      passthroughHeaders.set('cache-control', 'no-cache, no-store, must-revalidate');
      passthroughHeaders.set('X-Frame-Options', 'SAMEORIGIN');
      passthroughHeaders.set('Content-Security-Policy', "frame-ancestors 'self' https://iahome.fr;");
      passthroughHeaders.set('X-Proxy-By', 'IAHome-PsiTransfer-Proxy');

      return new Response(response.body, {
        status,
        headers: passthroughHeaders,
      });
    }
  } catch (error) {
    console.error('PsiTransfer proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
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
    
    const targetUrl = `${PSITRANSFER_SERVICE_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;
    
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        ...Object.fromEntries(request.headers.entries()),
        'host': new URL(PSITRANSFER_SERVICE_URL).host,
      },
      body: request.body,
      // @ts-expect-error: duplex is required for streaming request in Node fetch
      duplex: 'half',
    });
    const statusPost = response.status === 304 ? 200 : response.status;
    const postHeaders = new Headers(response.headers);
    postHeaders.delete('content-encoding');
    postHeaders.delete('content-length');
    postHeaders.set('content-encoding', 'identity');
    return new Response(response.body, { status: statusPost, headers: postHeaders });
  } catch (error) {
    console.error('PsiTransfer proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
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
    
    const targetUrl = `${PSITRANSFER_SERVICE_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;
    
    const response = await fetch(targetUrl, {
      method: 'PUT',
      headers: {
        ...Object.fromEntries(request.headers.entries()),
        'host': new URL(PSITRANSFER_SERVICE_URL).host,
      },
      body: request.body,
      // @ts-expect-error: duplex is required for streaming request in Node fetch
      duplex: 'half',
    });
    const statusPut = response.status === 304 ? 200 : response.status;
    const putHeaders = new Headers(response.headers);
    putHeaders.delete('content-encoding');
    putHeaders.delete('content-length');
    putHeaders.set('content-encoding', 'identity');
    return new Response(response.body, { status: statusPut, headers: putHeaders });
  } catch (error) {
    console.error('PsiTransfer proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
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
    
    const targetUrl = `${PSITRANSFER_SERVICE_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;
    
    const response = await fetch(targetUrl, {
      method: 'DELETE',
      headers: {
        ...Object.fromEntries(request.headers.entries()),
        'host': new URL(PSITRANSFER_SERVICE_URL).host,
      },
    });
    const statusDel = response.status === 304 ? 200 : response.status;
    const delHeaders = new Headers(response.headers);
    delHeaders.delete('content-encoding');
    delHeaders.delete('content-length');
    delHeaders.set('content-encoding', 'identity');
    return new Response(response.body, { status: statusDel, headers: delHeaders });
  } catch (error) {
    console.error('PsiTransfer proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function OPTIONS(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const pathParams = await params;
    const path = pathParams.path.join('/');
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    
    const targetUrl = `${PSITRANSFER_SERVICE_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;
    
    const response = await fetch(targetUrl, {
      method: 'OPTIONS',
      headers: {
        ...Object.fromEntries(request.headers.entries()),
        'host': new URL(PSITRANSFER_SERVICE_URL).host,
      },
    });

    return new NextResponse(null, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    console.error('PsiTransfer proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}


export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const pathParams = await params;
    const path = pathParams.path.join('/');
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();

    const targetUrl = `${PSITRANSFER_SERVICE_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;

    let response: Response;
    try {
      response = await fetch(targetUrl, {
        method: 'HEAD',
        headers: {
          ...Object.fromEntries(request.headers.entries()),
          'host': new URL(PSITRANSFER_SERVICE_URL).host,
        },
      });
    } catch (err) {
      // Fallback si le serveur ne supporte pas HEAD
      response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          ...Object.fromEntries(request.headers.entries()),
          'host': new URL(PSITRANSFER_SERVICE_URL).host,
          'x-http-method-override': 'HEAD',
        },
      });
    }

    // Gérer le code de statut 304 qui n'est pas valide pour NextResponse
    const status = response.status === 304 ? 200 : response.status;

    return new NextResponse(null, {
      status: status,
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        'content-encoding': 'identity',
        'cache-control': 'no-cache, no-store, must-revalidate',
        'X-Frame-Options': 'SAMEORIGIN',
        'Content-Security-Policy': "frame-ancestors 'self' https://iahome.fr;",
        'X-Proxy-By': 'IAHome-PsiTransfer-Proxy'
      },
    });
  } catch (error) {
    console.error('PsiTransfer proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const pathParams = await params;
    const path = pathParams.path.join('/');
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();

    const targetUrl = `${PSITRANSFER_SERVICE_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;

    const body = await request.arrayBuffer();

    const response = await fetch(targetUrl, {
      method: 'PATCH',
      headers: {
        ...Object.fromEntries(request.headers.entries()),
        'host': new URL(PSITRANSFER_SERVICE_URL).host,
      },
      body,
    });

    const data = await response.arrayBuffer();

    // Gérer le code de statut 304 qui n'est pas valide pour NextResponse
    const status = response.status === 304 ? 200 : response.status;

    return new NextResponse(data, {
      status: status,
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        'content-encoding': 'identity',
        'cache-control': 'no-cache, no-store, must-revalidate',
        'X-Frame-Options': 'SAMEORIGIN',
        'Content-Security-Policy': "frame-ancestors 'self' https://iahome.fr;",
        'X-Proxy-By': 'IAHome-PsiTransfer-Proxy'
      },
    });
  } catch (error) {
    console.error('PsiTransfer proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}


