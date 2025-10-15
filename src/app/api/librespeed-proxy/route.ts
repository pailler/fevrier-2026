import { NextRequest, NextResponse } from 'next/server';

const LIBRESPEED_SERVICE_URL = process.env.LIBRESPEED_SERVICE_URL || 'https://librespeed.iahome.fr';

export async function GET(request: NextRequest) {
  try {
    ;
    
    // Rediriger vers le service LibreSpeed
    const response = await fetch(LIBRESPEED_SERVICE_URL, {
      method: 'GET',
      headers: {
        'User-Agent': 'IAHome-Librespeed-Proxy/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
    });
    
    // Récupérer le contenu
    const contentType = response.headers.get('content-type') || 'text/html';
    const content = await response.text();
    
    // Réécrire les URLs si c'est du HTML
    let modifiedContent = content;
    if (contentType.includes('text/html')) {
      modifiedContent = rewriteLibrespeedUrls(content);
    }
    
    return new NextResponse(modifiedContent, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'X-Proxy-By': 'IAHome-Librespeed-Proxy',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src *; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; frame-ancestors 'self'",
        'X-Frame-Options': 'SAMEORIGIN',
      },
    });
    
  } catch (error) {
    console.error('❌ Erreur proxy LibreSpeed racine:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

// Fonction pour réécrire les URLs dans le HTML
function rewriteLibrespeedUrls(html: string): string {
  let modified = html;
  
  // Injecter/normaliser <base> pour les chemins relatifs
  if (/\<base\s+href=/i.test(modified)) {
    modified = modified.replace(/<base\s+href="[^"]*"\s*\/>|<base\s+href="[^"]*"\s*>/i, '<base href="/api/librespeed-proxy/">');
  } else if (modified.includes('<head>')) {
    modified = modified.replace('<head>', '<head><base href="/api/librespeed-proxy/">');
  }
  
  // Réécrire les URLs absolues
  modified = modified.replace(/<(script|link|img|a)([^>]*?)\s(src|href)="\/([^"']+)"/gi, (m, tag, attrs, attr, path) => {
    if (path.startsWith('api/librespeed-proxy/')) return m;
    return `<${tag}${attrs} ${attr}="/api/librespeed-proxy/${path}"`;
  });
  
  // Réécrire les URLs complètes vers librespeed.iahome.fr
  modified = modified.replace(/https?:\/\/librespeed\.regispailler\.fr\//g, '/api/librespeed-proxy/');
  
  return modified;
}

