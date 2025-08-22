import { NextRequest, NextResponse } from 'next/server';

const STABLEDIFFUSION_URL = 'https://stablediffusion.regispailler.fr';
const STABLEDIFFUSION_CREDENTIALS = {
  username: 'admin',
  password: 'Rasulova75'
};

export async function GET(request: NextRequest) {
  try {
    // Créer les headers avec authentification HTTP Basic
    const credentials = Buffer.from(`${STABLEDIFFUSION_CREDENTIALS.username}:${STABLEDIFFUSION_CREDENTIALS.password}`).toString('base64');
    
    const headers = new Headers();
    headers.set('Authorization', `Basic ${credentials}`);
    headers.set('User-Agent', 'IAHome-Direct/1.0');

    // Faire la requête vers Stable Diffusion
    const response = await fetch(STABLEDIFFUSION_URL, {
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

    // Retourner le contenu avec les bons headers et CORS
    const proxyResponse = new NextResponse(content, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'X-Proxy-By': 'IAHome-Direct',
        // Headers CORS pour permettre l'accès depuis le domaine public
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

    return proxyResponse;

  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Gérer les requêtes OPTIONS pour CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 