import { NextRequest, NextResponse } from 'next/server';

// IPs autorisées
const ALLOWED_IPS = [
  '90.90.226.59', // Votre IP principale
  '127.0.0.1',    // Localhost pour le développement
  '::1',          // IPv6 localhost
  'localhost'     // Localhost
];

// URL de l'application RuinedFooocus
const RUINEDFOOOCUS_URL = 'https://da4be546aab3e23055.gradio.live/';

export async function GET(request: NextRequest) {
  try {
    // Récupérer l'IP du client
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                    request.headers.get('x-real-ip') ||
                    'unknown';
    
    // Vérifier si l'IP est autorisée
    const isAllowed = ALLOWED_IPS.includes(clientIP);
    
    if (!isAllowed) {
      // Rediriger vers la page d'accès refusé
      const errorUrl = new URL('/access-denied', request.url);
      errorUrl.searchParams.set('reason', 'ip_restricted');
      errorUrl.searchParams.set('requested_path', '/api/proxy-ruinedfooocus');
      
      return NextResponse.redirect(errorUrl);
    }
    
    // Rediriger vers l'application RuinedFooocus
    return NextResponse.redirect(RUINEDFOOOCUS_URL);
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Récupérer l'IP du client
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                    request.headers.get('x-real-ip') ||
                    'unknown';
    
    // Vérifier si l'IP est autorisée
    const isAllowed = ALLOWED_IPS.includes(clientIP);
    
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }
    
    // Récupérer le body de la requête
    const body = await request.text();
    
    // Transférer la requête vers RuinedFooocus
    const response = await fetch(RUINEDFOOOCUS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': request.headers.get('content-type') || 'application/json',
        'User-Agent': request.headers.get('user-agent') || '',
      },
      body: body,
    });
    
    // Retourner la réponse
    const responseData = await response.text();
    
    return new NextResponse(responseData, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
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

