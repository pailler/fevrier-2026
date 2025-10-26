import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'iahome-jwt-secret-2024-production-secure-key';

// Mapping des modules vers leurs ports locaux
const APPLICATION_PORTS: { [key: string]: number } = {
  'librespeed': 8085,
  'metube': 8081,
  'whisper': 8093,
  'psitransfer': 8087,
  'qrcodes': 7006,
  'pdf': 8086,
  'stablediffusion': 7880,
  'comfyui': 8188,
  'meeting-reports': 3050,
  'ruinedfooocus': 7870,
  'cogstudio': 8080,
};

// Mapping des modules vers leurs hôtes locaux (si différent de localhost)
const APPLICATION_HOSTS: { [key: string]: string } = {
  'stablediffusion': '192.168.1.150',
  'comfyui': '192.168.1.150',
  'ruinedfooocus': '192.168.1.150',
  'cogstudio': '192.168.1.150',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const moduleId = searchParams.get('module');

  if (!token || !moduleId) {
    return NextResponse.json(
      { error: 'Token et module sont requis' },
      { status: 400 }
    );
  }

  try {
    let decoded: any;
    
    // Essayer d'abord JWT, puis base64 simple
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      // Si JWT échoue, essayer base64 simple
      try {
        decoded = JSON.parse(atob(token));
      } catch (base64Error) {
        return NextResponse.json(
          { error: 'Token invalide' },
          { status: 401 }
        );
      }
    }

    if (decoded.exp * 1000 < Date.now()) {
      return NextResponse.json(
        { error: 'Token expiré' },
        { status: 401 }
      );
    }

    // Vérifier que le module correspond
    if (decoded.moduleId === moduleId) {
      const port = APPLICATION_PORTS[moduleId as keyof typeof APPLICATION_PORTS];
      const host = APPLICATION_HOSTS[moduleId as keyof typeof APPLICATION_HOSTS] || 'localhost';
      
      if (port) {
        // Faire un proxy vers l'application locale
        const localUrl = `http://${host}:${port}`;
        
        try {
          const response = await fetch(localUrl, {
            method: 'GET',
            headers: {
              'User-Agent': request.headers.get('User-Agent') || 'IAHome-Proxy',
              'Accept': request.headers.get('Accept') || '*/*',
            },
          });

          if (!response.ok) {
            return NextResponse.json(
              { error: 'Application non disponible' },
              { status: 503 }
            );
          }

          // Retourner le contenu de l'application
          const content = await response.text();
          const contentType = response.headers.get('Content-Type') || 'text/html';
          
          return new NextResponse(content, {
            status: response.status,
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0',
            },
          });
        } catch (error) {
          console.error('Erreur proxy vers application locale:', error);
          return NextResponse.json(
            { error: 'Erreur de connexion à l\'application' },
            { status: 503 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Module non trouvé' },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Token invalide pour ce module' },
        { status: 403 }
      );
    }
  } catch (error) {
    console.error('Erreur de validation du token:', error);
    return NextResponse.json(
      { error: 'Token invalide' },
      { status: 401 }
    );
  }
}