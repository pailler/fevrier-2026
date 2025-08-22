import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-change-this-in-production';
const STABLEDIFFUSION_URL = 'https://stablediffusion.regispailler.fr';
const STABLEDIFFUSION_CREDENTIALS = {
  username: 'admin',
  password: 'Rasulova75'
};

// Fonction pour vérifier le JWT
function verifyJWT(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Token JWT invalide');
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    
    // Vérifier la signature
    const expectedSignature = createHmac('sha256', JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    if (signature !== expectedSignature) {
      throw new Error('Signature invalide');
    }

    // Décoder le payload
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());
    
    // Vérifier l'expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('Token expiré');
    }

    // Vérifier l'émetteur et l'audience
    if (payload.iss !== 'iahome.regispailler.fr' || payload.aud !== 'stablediffusion.regispailler.fr') {
      throw new Error('Token invalide (iss/aud)');
    }

    return payload;
  } catch (error) {
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jwt = searchParams.get('jwt');
    const path = searchParams.get('path') || '';

    // Vérifier le JWT
    if (!jwt) {
      return NextResponse.json({ error: 'Token JWT manquant' }, { status: 401 });
    }

    let userPayload;
    try {
      userPayload = verifyJWT(jwt);
      } catch (error) {
      return NextResponse.json({ error: 'Token JWT invalide' }, { status: 401 });
    }

    // Construire l'URL de destination
    const targetUrl = `${STABLEDIFFUSION_URL}${path}`;
    // Créer les headers avec authentification HTTP Basic
    const credentials = Buffer.from(`${STABLEDIFFUSION_CREDENTIALS.username}:${STABLEDIFFUSION_CREDENTIALS.password}`).toString('base64');
    
    const headers = new Headers();
    headers.set('Authorization', `Basic ${credentials}`);
    headers.set('User-Agent', 'IAHome-Proxy/1.0');
    headers.set('X-Forwarded-For', request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown');
    headers.set('X-Original-User', userPayload.email);

    // Faire la requête vers Stable Diffusion
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Erreur Stable Diffusion: ${response.status}` },
        { status: response.status }
      );
    }

    // Récupérer le contenu
    const contentType = response.headers.get('content-type') || '';
    const content = await response.text();

    // Retourner le contenu avec les bons headers
    const proxyResponse = new NextResponse(content, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'X-Proxy-By': 'IAHome',
        'X-Authenticated-User': userPayload.email,
      },
    });

    return proxyResponse;

  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur interne du proxy' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jwt = searchParams.get('jwt');
    const path = searchParams.get('path') || '';

    // Vérifier le JWT
    if (!jwt) {
      return NextResponse.json({ error: 'Token JWT manquant' }, { status: 401 });
    }

    let userPayload;
    try {
      userPayload = verifyJWT(jwt);
      } catch (error) {
      return NextResponse.json({ error: 'Token JWT invalide' }, { status: 401 });
    }

    // Construire l'URL de destination
    const targetUrl = `${STABLEDIFFUSION_URL}${path}`;
    // Récupérer le body de la requête
    const body = await request.text();

    // Créer les headers avec authentification HTTP Basic
    const credentials = Buffer.from(`${STABLEDIFFUSION_CREDENTIALS.username}:${STABLEDIFFUSION_CREDENTIALS.password}`).toString('base64');
    
    const headers = new Headers();
    headers.set('Authorization', `Basic ${credentials}`);
    headers.set('User-Agent', 'IAHome-Proxy/1.0');
    headers.set('X-Forwarded-For', request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown');
    headers.set('X-Original-User', userPayload.email);
    
    // Copier les headers de contenu
    const contentType = request.headers.get('content-type');
    if (contentType) {
      headers.set('Content-Type', contentType);
    }

    // Faire la requête POST vers Stable Diffusion
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: headers,
      body: body,
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Erreur Stable Diffusion: ${response.status}` },
        { status: response.status }
      );
    }

    // Récupérer le contenu
    const responseContentType = response.headers.get('content-type') || '';
    const responseContent = await response.text();

    // Retourner le contenu avec les bons headers
    const proxyResponse = new NextResponse(responseContent, {
      status: response.status,
      headers: {
        'Content-Type': responseContentType,
        'Cache-Control': 'no-cache',
        'X-Proxy-By': 'IAHome',
        'X-Authenticated-User': userPayload.email,
      },
    });

    return proxyResponse;

  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur interne du proxy' },
      { status: 500 }
    );
  }
} 