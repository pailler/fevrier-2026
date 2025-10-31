import { NextRequest, NextResponse } from 'next/server';
import { LibreSpeedAccessService } from '../../../../utils/librespeedAccess';

/**
 * Script d'interception pour les requêtes AJAX/fetch
 */
function getProxyInterceptorScript(token: string): string {
  return `
<script>
(function() {
  console.log('[Proxy] Script d\'interception chargé pour LibreSpeed');
  const TOKEN = '${encodeURIComponent(token)}';
  const PROXY_BASE = '/api/librespeed-access/frame?token=' + TOKEN + '&path=';
  console.log('[Proxy] Configuration:', { PROXY_BASE: PROXY_BASE.substring(0, 50) + '...' });
  
  // Fonction pour convertir une URL en URL proxy
  function toProxyUrl(url) {
    if (!url || typeof url !== 'string') {
      return url;
    }
    
    try {
      // Si c'est déjà une URL proxy, la laisser telle quelle
      if (url.includes('/api/librespeed-access/')) {
        return url;
      }
      
      // Si c'est une URL absolue externe, la laisser telle quelle (sauf si c'est une URL relative transformée)
      if (url.startsWith('http://') || url.startsWith('https://')) {
        // Si c'est une URL externe différente, la laisser telle quelle
        const urlObj = new URL(url);
        if (urlObj.origin !== window.location.origin) {
          return url;
        }
        // Si c'est le même domaine, convertir en proxy
        const path = urlObj.pathname + urlObj.search;
        return PROXY_BASE + encodeURIComponent(path);
      }
      
      // Si c'est une URL relative, convertir en proxy
      const fullUrl = new URL(url, window.location.origin);
      if (fullUrl.origin !== window.location.origin) {
        return url; // URL externe différente
      }
      
      // Convertir en URL proxy
      const path = fullUrl.pathname + fullUrl.search;
      return PROXY_BASE + encodeURIComponent(path);
    } catch (e) {
      // En cas d'erreur, retourner l'URL originale
      return url;
    }
  }
  
  // Intercepter fetch()
  const originalFetch = window.fetch;
  window.fetch = function(input, init) {
    console.log('[Proxy] fetch() appelé avec:', typeof input === 'string' ? input : input?.url || 'unknown');
    if (typeof input === 'string') {
      const proxyUrl = toProxyUrl(input);
      if (proxyUrl !== input) {
        console.log('[Proxy] ✅ Intercepting fetch:', input, '->', proxyUrl);
      } else {
        console.log('[Proxy] ⏭️ fetch() pas intercepté (URL externe ou déjà proxy):', input);
      }
      return originalFetch.call(this, proxyUrl, init);
    } else if (input instanceof Request) {
      const url = input.url;
      const proxyUrl = toProxyUrl(url);
      if (proxyUrl !== url) {
        console.log('[Proxy] ✅ Intercepting fetch Request:', url, '->', proxyUrl);
        return originalFetch.call(this, new Request(proxyUrl, input), init);
      }
      console.log('[Proxy] ⏭️ fetch() Request pas intercepté:', url);
      return originalFetch.call(this, input, init);
    } else {
      console.log('[Proxy] ⏭️ fetch() avec input non reconnu:', input);
      return originalFetch.call(this, input, init);
    }
  };
  console.log('[Proxy] ✅ fetch() intercepté');
  
  // Intercepter XMLHttpRequest
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    console.log('[Proxy] XMLHttpRequest.open() appelé:', method, url);
    const proxyUrl = toProxyUrl(url);
    
    if (proxyUrl !== url) {
      console.log('[Proxy] ✅ Intercepting XHR:', url, '->', proxyUrl);
    } else {
      console.log('[Proxy] ⏭️ XHR pas intercepté:', url);
    }
    
    return originalOpen.call(this, method, proxyUrl, ...args);
  };
  console.log('[Proxy] ✅ XMLHttpRequest.open() intercepté');
  
  // Intercepter WebSocket (si utilisé)
  const originalWebSocket = window.WebSocket;
  window.WebSocket = function(url, protocols) {
    const proxyUrl = toProxyUrl(url);
    
    if (proxyUrl !== url) {
      console.log('[Proxy] Intercepting WebSocket:', url, '->', proxyUrl);
    }
    
    return new originalWebSocket(proxyUrl, protocols);
  };
  
  // Copier les propriétés statiques de WebSocket
  Object.setPrototypeOf(window.WebSocket, originalWebSocket);
  Object.setPrototypeOf(window.WebSocket.prototype, originalWebSocket.prototype);
  
  console.log('[Proxy] ✅ Script d\'interception complètement chargé');
})();
</script>
`;
}

/**
 * Route qui charge le contenu de LibreSpeed depuis le serveur et le retourne
 * Cette route est appelée dans un iframe pour contourner Cloudflare Access
 */
export async function GET(request: NextRequest) {
  return handleRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
  return handleRequest(request, 'POST');
}

export async function PUT(request: NextRequest) {
  return handleRequest(request, 'PUT');
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request, 'DELETE');
}

async function handleRequest(request: NextRequest, method: string) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return NextResponse.json({ error: 'Token requis' }, { status: 401 });
    }

    // Vérifier le token rapidement
    const librespeedService = LibreSpeedAccessService.getInstance();
    let tokenValidation = await librespeedService.validateToken(token);
    
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

    // Utiliser l'URL publique de LibreSpeed (accessible depuis le serveur en production)
    // En production, les applications sont accessibles via leurs sous-domaines publics
    const librespeedUrl = process.env.LIBRESPEED_INTERNAL_URL || 'https://librespeed.iahome.fr';
    
    // Construire l'URL complète avec le chemin demandé
    const requestedPath = url.searchParams.get('path') || '/';
    const targetUrl = `${librespeedUrl}${requestedPath}${url.search.replace(/[?&]token=[^&]*/g, '').replace(/[?&]path=[^&]*/g, '')}`;
    
    console.log('🔗 LibreSpeed Frame: Proxying vers:', targetUrl);

    try {
      // Headers simples pour la requête interne (pas besoin de Cloudflare Access)
      const headers: Record<string, string> = {
        'User-Agent': 'IAHome-Librespeed-Access-Proxy/1.0',
        'Accept': request.headers.get('accept') || '*/*',
      };

      const referer = request.headers.get('referer');
      if (referer) {
        headers['Referer'] = referer;
      }

      // Préparer le body pour les requêtes POST/PUT
      let body: BodyInit | undefined;
      if (method === 'POST' || method === 'PUT') {
        try {
          body = await request.text();
        } catch (e) {
          // Ignorer si pas de body
        }
      }

      // Faire la requête depuis le serveur vers LibreSpeed (URL publique en production)
      const response = await fetch(targetUrl, {
        method,
        headers,
        body,
        redirect: 'follow',
      });

      if (!response.ok) {
        throw new Error(`LibreSpeed returned ${response.status}`);
      }

      // Récupérer le contenu
      const contentType = response.headers.get('content-type') || 'text/html';
      const content = await response.arrayBuffer();

      // Réécrire les URLs dans le HTML si c'est du HTML
      if (contentType.includes('text/html')) {
        let html = new TextDecoder().decode(content);
        
        // Injecter le script d'interception AVANT tout autre script
        const interceptorScript = getProxyInterceptorScript(token);
        
        // Injecter au tout début de <head> pour qu'il soit exécuté en premier
        if (html.includes('<head>')) {
          html = html.replace('<head>', '<head>' + interceptorScript);
        } else if (html.includes('</head>')) {
          html = html.replace('</head>', interceptorScript + '</head>');
        } else if (html.includes('<html>')) {
          html = html.replace('<html>', '<html><head>' + interceptorScript + '</head>');
        } else if (html.includes('<body')) {
          html = interceptorScript + html;
        } else {
          html = interceptorScript + html;
        }
        
        // Réécrire les URLs pour qu'elles passent par notre proxy frame
        html = html.replace(/href=["']([^"']+)["']/gi, (match, path) => {
          if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//') || path.startsWith('mailto:') || path.startsWith('#')) {
            return match;
          }
          const newPath = path.startsWith('/') ? path : '/' + path;
          return `href="/api/librespeed-access/frame?token=${encodeURIComponent(token)}&path=${encodeURIComponent(newPath)}"`;
        });

        html = html.replace(/src=["']([^"']+)["']/gi, (match, path) => {
          if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//') || path.startsWith('data:')) {
            return match;
          }
          const newPath = path.startsWith('/') ? path : '/' + path;
          return `src="/api/librespeed-access/frame?token=${encodeURIComponent(token)}&path=${encodeURIComponent(newPath)}"`;
        });

        html = html.replace(/action=["']([^"']+)["']/gi, (match, path) => {
          if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
            return match;
          }
          const newPath = path.startsWith('/') ? path : '/' + path;
          return `action="/api/librespeed-access/frame?token=${encodeURIComponent(token)}&path=${encodeURIComponent(newPath)}"`;
        });

        return new NextResponse(html, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'X-Proxy-By': 'IAHome-Librespeed-Access-Frame',
            'Cache-Control': 'no-cache',
          },
        });
      }

      // Pour les autres types de contenu (CSS, JS, images, etc.), retourner tel quel
      return new NextResponse(content, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'X-Proxy-By': 'IAHome-Librespeed-Access-Frame',
          'Cache-Control': 'public, max-age=3600',
        },
      });

    } catch (fetchError) {
      console.error('❌ Erreur lors du fetch vers LibreSpeed:', fetchError);
      return NextResponse.json(
        { error: 'Erreur de connexion à LibreSpeed' },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('❌ LibreSpeed Frame Error:', error);
    return NextResponse.json(
      { error: 'Erreur interne' },
      { status: 500 }
    );
  }
}

