import { NextRequest, NextResponse } from 'next/server';

/**
 * Route proxy générique pour accéder à n'importe quelle application sans passer par Cloudflare Access
 * Cette route génère une page HTML avec un iframe qui charge l'application depuis le serveur
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const { moduleId } = await params;
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return NextResponse.redirect('https://iahome.fr/account?error=no_token', 302);
    }

    // Vérifier rapidement le token (décodage Base64 JSON)
    try {
      const decoded = JSON.parse(atob(token));
      if (decoded.moduleId !== moduleId || decoded.exp * 1000 <= Date.now()) {
        return NextResponse.redirect('https://iahome.fr/account?error=invalid_token', 302);
      }
    } catch (e) {
      return NextResponse.redirect('https://iahome.fr/account?error=invalid_token', 302);
    }

    console.log(`🔗 ${moduleId} Access: Génération de la page avec iframe (proxy interne)`);
    
    // Créer une page HTML qui charge l'application dans un iframe
    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${moduleId.charAt(0).toUpperCase() + moduleId.slice(1)} - IA Home</title>
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
        #app-iframe {
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
            z-index: 1;
        }
    </style>
</head>
<body>
    <div class="loading" id="loading">Chargement de ${moduleId}...</div>
    <iframe 
        id="app-iframe"
        src="/api/app-access/${moduleId}/frame?token=${encodeURIComponent(token)}"
        allow="fullscreen"
        onload="document.getElementById('loading').style.display='none';"
    ></iframe>
    <script>
        // Gérer les erreurs de chargement
        document.getElementById('app-iframe').addEventListener('error', function() {
            document.getElementById('loading').innerHTML = 'Erreur de chargement. Veuillez réessayer.';
        });
    </script>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Proxy-By': 'IAHome-App-Access',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    console.error(`❌ ${params} Access Proxy Error:`, error);
    return NextResponse.redirect('https://iahome.fr/account?error=internal_error', 302);
  }
}



