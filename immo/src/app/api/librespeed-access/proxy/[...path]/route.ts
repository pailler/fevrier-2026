import { NextRequest, NextResponse } from 'next/server';
import { LibreSpeedAccessService } from '../../../../../utils/librespeedAccess';

/**
 * Proxy pour les ressources statiques et les requêtes vers LibreSpeed
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return NextResponse.json({ error: 'Token requis' }, { status: 401 });
    }

    // Vérifier rapidement le token
    const librespeedService = LibreSpeedAccessService.getInstance();
    let tokenValidation = await librespeedService.validateToken(token);
    
    // Si le token n'est pas dans la DB, essayer de le décoder en Base64 JSON
    if (!tokenValidation.hasAccess) {
      try {
        const decoded = JSON.parse(atob(token));
        if (decoded.moduleId === 'librespeed' && decoded.exp * 1000 > Date.now()) {
          tokenValidation = { hasAccess: true, token: token };
        }
      } catch (e) {
        // Token invalide
      }
    }
    
    if (!tokenValidation.hasAccess) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 403 });
    }

    // Construire l'URL vers LibreSpeed interne
    const librespeedInternalUrl = process.env.LIBRESPEED_INTERNAL_URL || 'http://localhost:8085';
    const pathString = path.join('/');
    const targetUrl = `${librespeedInternalUrl}/${pathString}${url.search}`;
    
    console.log(`🔗 LibreSpeed Proxy: ${request.method} ${targetUrl}`);

    // Faire la requête vers LibreSpeed
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'User-Agent': request.headers.get('user-agent') || 'IAHome-Librespeed-Proxy/1.0',
        'Accept': request.headers.get('accept') || '*/*',
        'Referer': `${librespeedInternalUrl}/`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `LibreSpeed returned ${response.status}` },
        { status: response.status }
      );
    }

    // Retourner la réponse avec les bons headers
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const body = await response.arrayBuffer();

    return new NextResponse(body, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'X-Proxy-By': 'IAHome-Librespeed-Access',
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (error) {
    console.error('❌ LibreSpeed Proxy Error:', error);
    return NextResponse.json(
      { error: 'Erreur proxy' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return NextResponse.json({ error: 'Token requis' }, { status: 401 });
    }

    const librespeedService = LibreSpeedAccessService.getInstance();
    let tokenValidation = await librespeedService.validateToken(token);
    
    // Si le token n'est pas dans la DB, essayer de le décoder en Base64 JSON
    if (!tokenValidation.hasAccess) {
      try {
        const decoded = JSON.parse(atob(token));
        if (decoded.moduleId === 'librespeed' && decoded.exp * 1000 > Date.now()) {
          tokenValidation = { hasAccess: true, token: token };
        }
      } catch (e) {
        // Token invalide
      }
    }
    
    if (!tokenValidation.hasAccess) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 403 });
    }

    const librespeedInternalUrl = process.env.LIBRESPEED_INTERNAL_URL || 'http://localhost:8085';
    const pathString = path.join('/');
    const targetUrl = `${librespeedInternalUrl}/${pathString}${url.search}`;
    
    const body = await request.arrayBuffer();

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'User-Agent': request.headers.get('user-agent') || 'IAHome-Librespeed-Proxy/1.0',
        'Content-Type': request.headers.get('content-type') || 'application/json',
      },
      body: body,
    });

    const contentType = response.headers.get('content-type') || 'application/json';
    const responseBody = await response.arrayBuffer();

    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'X-Proxy-By': 'IAHome-Librespeed-Access',
      },
    });

  } catch (error) {
    console.error('❌ LibreSpeed Proxy POST Error:', error);
    return NextResponse.json({ error: 'Erreur proxy' }, { status: 500 });
  }
}

