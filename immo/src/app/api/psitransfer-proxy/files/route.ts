import { NextRequest, NextResponse } from 'next/server';

const PSITRANSFER_SERVICE_URL = process.env.PSITRANSFER_SERVICE_URL || 'http://localhost:8084';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    
    const targetUrl = `${PSITRANSFER_SERVICE_URL}/files${searchParams ? `?${searchParams}` : ''}`;
    
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        ...Object.fromEntries(request.headers.entries()),
        'host': new URL(PSITRANSFER_SERVICE_URL).host,
      },
    });

    if (!response.ok) {
      return new NextResponse(`PsiTransfer files error: ${response.status}`, { status: response.status });
    }

    // Flux direct pour tous les contenus non transformés
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
  } catch (error) {
    console.error('PsiTransfer files proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    
    const targetUrl = `${PSITRANSFER_SERVICE_URL}/files${searchParams ? `?${searchParams}` : ''}`;
    
    // Préparer les en-têtes et corriger Upload-Metadata si besoin (filename -> name)
    const incomingHeaders = new Headers(request.headers);
    const tusMeta = incomingHeaders.get('upload-metadata');
    if (tusMeta) {
      // upload-metadata est une liste de paires key base64Value séparées par des virgules
      const pairs = tusMeta.split(',').map(s => s.trim()).filter(Boolean);
      const normalized = pairs.map(p => {
        const spaceIdx = p.indexOf(' ');
        if (spaceIdx === -1) return p;
        const key = p.substring(0, spaceIdx);
        const val = p.substring(spaceIdx + 1);
        if (key.toLowerCase() === 'filename') {
          return `name ${val}`;
        }
        return `${key} ${val}`;
      });
      // Si aucun 'name' après remplacement, mais 'filename' existait sans espace, fallback
      const hasNameAfter = normalized.some(p => p.toLowerCase().startsWith('name '));
      if (!hasNameAfter) {
        incomingHeaders.set('upload-metadata', tusMeta.replace(/^filename\s/i, 'name '));
      } else {
        incomingHeaders.set('upload-metadata', normalized.join(', '));
      }
    }

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: (() => {
        const h = new Headers(incomingHeaders);
        h.set('host', new URL(PSITRANSFER_SERVICE_URL).host);
        return h;
      })(),
      body: request.body,
      // @ts-expect-error: duplex is required for streaming request in Node fetch
      duplex: 'half',
    });

    const status = response.status === 304 ? 200 : response.status;
    const passthroughHeaders = new Headers(response.headers);
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
  } catch (error) {
    console.error('PsiTransfer files proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    
    const targetUrl = `${PSITRANSFER_SERVICE_URL}/files${searchParams ? `?${searchParams}` : ''}`;
    
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
    const status = response.status === 304 ? 200 : response.status;
    const passthroughHeaders = new Headers(response.headers);
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
  } catch (error) {
    console.error('PsiTransfer files proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    
    const targetUrl = `${PSITRANSFER_SERVICE_URL}/files${searchParams ? `?${searchParams}` : ''}`;
    
    const response = await fetch(targetUrl, {
      method: 'DELETE',
      headers: {
        ...Object.fromEntries(request.headers.entries()),
        'host': new URL(PSITRANSFER_SERVICE_URL).host,
      },
    });

    const status = response.status === 304 ? 200 : response.status;
    const passthroughHeaders = new Headers(response.headers);
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
  } catch (error) {
    console.error('PsiTransfer files proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    
    const targetUrl = `${PSITRANSFER_SERVICE_URL}/files${searchParams ? `?${searchParams}` : ''}`;
    
    const response = await fetch(targetUrl, {
      method: 'OPTIONS',
      headers: {
        ...Object.fromEntries(request.headers.entries()),
        'host': new URL(PSITRANSFER_SERVICE_URL).host,
      },
    });

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
    console.error('PsiTransfer files proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function HEAD(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    
    const targetUrl = `${PSITRANSFER_SERVICE_URL}/files${searchParams ? `?${searchParams}` : ''}`;
    
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
    console.error('PsiTransfer files proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    
    const targetUrl = `${PSITRANSFER_SERVICE_URL}/files${searchParams ? `?${searchParams}` : ''}`;
    
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
    console.error('PsiTransfer files proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
