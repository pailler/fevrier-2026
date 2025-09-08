import { NextRequest, NextResponse } from 'next/server';

const PSITRANSFER_SERVICE_URL = process.env.PSITRANSFER_SERVICE_URL || 'http://localhost:8084';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const pathParams = await params;
    const path = pathParams.path.join('/');
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    
    const targetUrl = `${PSITRANSFER_SERVICE_URL}/api/${path}${searchParams ? `?${searchParams}` : ''}`;
    
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        ...Object.fromEntries(request.headers.entries()),
        'host': new URL(PSITRANSFER_SERVICE_URL).host,
      },
    });

    if (!response.ok) {
      return new NextResponse(`PsiTransfer API error: ${response.status}`, { status: response.status });
    }

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
    console.error('PsiTransfer API proxy error:', error);
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
    
    const targetUrl = `${PSITRANSFER_SERVICE_URL}/api/${path}${searchParams ? `?${searchParams}` : ''}`;
    
    const body = await request.arrayBuffer();
    
    const response = await fetch(targetUrl, {
      method: 'POST',
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
    console.error('PsiTransfer API proxy error:', error);
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
    
    const targetUrl = `${PSITRANSFER_SERVICE_URL}/api/${path}${searchParams ? `?${searchParams}` : ''}`;
    
    const body = await request.arrayBuffer();
    
    const response = await fetch(targetUrl, {
      method: 'PUT',
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
    console.error('PsiTransfer API proxy error:', error);
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
    
    const targetUrl = `${PSITRANSFER_SERVICE_URL}/api/${path}${searchParams ? `?${searchParams}` : ''}`;
    
    const response = await fetch(targetUrl, {
      method: 'DELETE',
      headers: {
        ...Object.fromEntries(request.headers.entries()),
        'host': new URL(PSITRANSFER_SERVICE_URL).host,
      },
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
    console.error('PsiTransfer API proxy error:', error);
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
    
    const targetUrl = `${PSITRANSFER_SERVICE_URL}/api/${path}${searchParams ? `?${searchParams}` : ''}`;
    
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
    console.error('PsiTransfer API proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
