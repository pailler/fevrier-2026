import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const QR_CODE_SERVICE_URL = process.env.QR_CODE_SERVICE_URL || 'http://localhost:7006';
const QR_CODE_JWT_SECRET = process.env.QR_CODE_JWT_SECRET || 'qr-code-secret-key-change-in-production';

// Fonction pour générer un token d'accès
function generateQRAccessToken(userId: string) {
  return jwt.sign(
    {
      userId,
      exp: Math.floor(Date.now() / 1000) + (2 * 60 * 60), // 2 heures
      iat: Math.floor(Date.now() / 1000),
      iss: 'iahome.fr',
      aud: 'qr-code-service'
    },
    QR_CODE_JWT_SECRET
  );
}

// Fonction pour récupérer l'utilisateur depuis la session Supabase
async function getCurrentUser(request: NextRequest): Promise<string> {
  try {
    // Récupérer le token depuis les headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Token d\'authentification manquant');
    }

    const token = authHeader.substring(7);
    
    // Valider le token avec Supabase
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      throw new Error('Token invalide');
    }

    return user.id;
  } catch (error) {
    console.error('Erreur authentification proxy:', error);
    throw new Error('Authentification échouée');
  }
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
    
    // Récupérer l'utilisateur depuis la session
    const userId = await getCurrentUser(request);
    
    // Générer le token d'accès
    const authToken = generateQRAccessToken(userId);
    
    // Construire l'URL de destination
    const targetUrl = `${QR_CODE_SERVICE_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;
    
    console.log(`🔍 Proxy GET: ${targetUrl}`);
    
    // Faire la requête vers le service QR
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('❌ Erreur proxy QR GET:', error);
    
    if (error instanceof Error && error.message.includes('authentification')) {
      return NextResponse.json({ 
        error: 'Authentification requise',
        message: 'Veuillez vous connecter pour accéder à cette ressource'
      }, { status: 401 });
    }
    
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
    const body = await request.json();
    
    // Récupérer l'utilisateur depuis la session
    const userId = await getCurrentUser(request);
    
    // Générer le token d'accès
    const authToken = generateQRAccessToken(userId);
    
    // Construire l'URL de destination
    const targetUrl = `${QR_CODE_SERVICE_URL}/${path}`;
    
    console.log(`🔍 Proxy POST: ${targetUrl}`);
    
    // Faire la requête vers le service QR
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('❌ Erreur proxy QR POST:', error);
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
    const body = await request.json();
    
    // Récupérer l'utilisateur depuis la session
    const userId = await getCurrentUser(request);
    
    // Générer le token d'accès
    const authToken = generateQRAccessToken(userId);
    
    // Construire l'URL de destination
    const targetUrl = `${QR_CODE_SERVICE_URL}/${path}`;
    
    console.log(`🔍 Proxy PUT: ${targetUrl}`);
    
    // Faire la requête vers le service QR
    const response = await fetch(targetUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('❌ Erreur proxy QR PUT:', error);
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
    
    // Récupérer l'utilisateur depuis la session
    const userId = await getCurrentUser(request);
    
    // Générer le token d'accès
    const authToken = generateQRAccessToken(userId);
    
    // Construire l'URL de destination
    const targetUrl = `${QR_CODE_SERVICE_URL}/${path}`;
    
    console.log(`🔍 Proxy DELETE: ${targetUrl}`);
    
    // Faire la requête vers le service QR
    const response = await fetch(targetUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('❌ Erreur proxy QR DELETE:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
