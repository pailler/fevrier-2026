import { NextRequest, NextResponse } from 'next/server';
import { LibreSpeedAccessService } from '../../../utils/librespeedAccess';

/**
 * Route proxy pour accéder à LibreSpeed sans passer par Cloudflare Access
 * Cette route génère une page HTML avec un iframe qui charge LibreSpeed depuis le serveur
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return NextResponse.redirect('https://iahome.fr/account?error=no_token', 302);
    }

    console.log('🔒 LibreSpeed Access Proxy: Vérification du token');
    
    // Essayer d'abord avec le service LibreSpeed (token DB)
    const librespeedService = LibreSpeedAccessService.getInstance();
    let tokenValidation = await librespeedService.validateToken(token);
    
    // Si le token n'est pas dans la DB, essayer de le décoder en Base64 JSON
    if (!tokenValidation.hasAccess) {
      try {
        const decoded = JSON.parse(atob(token));
        // Vérifier que c'est un token valide pour librespeed
        if (decoded.moduleId === 'librespeed' && decoded.exp * 1000 > Date.now()) {
          console.log('✅ LibreSpeed Access: Token Base64 JSON valide');
          tokenValidation = { hasAccess: true, token: token };
        }
      } catch (e) {
        // Token invalide
      }
    }
    
    if (!tokenValidation.hasAccess) {
      console.log('❌ LibreSpeed Access: Token invalide ou expiré');
      return NextResponse.redirect('https://iahome.fr/account?error=invalid_token', 302);
    }

    // URL publique de LibreSpeed (accessible depuis le serveur en production)
    // En production, les applications sont accessibles via leurs sous-domaines publics
    const librespeedUrl = process.env.LIBRESPEED_INTERNAL_URL || 'https://librespeed.iahome.fr';
    
    console.log('🔗 LibreSpeed Access: Génération de la page avec iframe vers:', librespeedUrl);
    
    // Créer une page HTML qui charge LibreSpeed dans un iframe
    // L'iframe pointe vers une route proxy qui charge le contenu depuis le serveur
    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LibreSpeed - IA Home</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        html, body {
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
        #librespeed-iframe {
            width: 100%;
            height: 100vh;
            border: none;
            display: block;
        }
        .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-family: Arial, sans-serif;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="loading" id="loading">Chargement de LibreSpeed...</div>
    <iframe 
        id="librespeed-iframe"
        src="/api/librespeed-access/frame?token=${encodeURIComponent(token)}"
        allow="fullscreen"
        onload="document.getElementById('loading').style.display='none';"
    ></iframe>
    <script>
        // Gérer les erreurs de chargement
        document.getElementById('librespeed-iframe').addEventListener('error', function() {
            document.getElementById('loading').innerHTML = 'Erreur de chargement. Veuillez réessayer.';
        });
    </script>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Proxy-By': 'IAHome-Librespeed-Access',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    console.error('❌ LibreSpeed Access Proxy Error:', error);
    return NextResponse.redirect('https://iahome.fr/account?error=internal_error', 302);
  }
}

