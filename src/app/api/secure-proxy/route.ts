import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'iahome-jwt-secret-2024-production-secure-key';

/** JWT historique ou payload JSON en Base64 URL-safe (/api/generate-access-token). */
function decodeModuleAccessToken(token: string): Record<string, unknown> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });
    return decoded as Record<string, unknown>;
  } catch {
    let b64 = token.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4;
    if (pad) b64 += '='.repeat(4 - pad);
    const json = Buffer.from(b64, 'base64').toString('utf8');
    return JSON.parse(json) as Record<string, unknown>;
  }
}

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
  'hunyuan3d': 8888,
  'apprendre-autrement': 9001,
  'photomaker': 7881,
  'animagine-xl': 7881,
  'florence-2': 7884,
  'birefnet': 7882,
  'musetalk': 7886,
  'photobooth': 7885,
  'vote': 7890,
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
    const decoded = decodeModuleAccessToken(token);

    // Pas de contrôle temporel sur le jeton d’accès module.

    // Vérifier que le module correspond
    if (decoded.moduleId === moduleId) {
      const port = APPLICATION_PORTS[moduleId as keyof typeof APPLICATION_PORTS];
      const host = APPLICATION_HOSTS[moduleId as keyof typeof APPLICATION_HOSTS] || 'localhost';
      
      if (port) {
        // Faire un proxy vers l'application locale
        // Pour apprendre-autrement, inclure le chemin /apprendre-autrement
        const path = moduleId === 'apprendre-autrement' ? '/apprendre-autrement' : '';
        const localUrl = `http://${host}:${port}${path}`;
        
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