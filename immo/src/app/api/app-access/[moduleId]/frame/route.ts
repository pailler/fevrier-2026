import { NextRequest, NextResponse } from 'next/server';

/**
 * Route qui charge le contenu de l'application depuis le serveur et le retourne
 * Cette route est appelée dans un iframe pour contourner Cloudflare Access
 */
// Fonction helper pour obtenir les URLs publiques des modules
function getModuleInternalUrl(moduleId: string): string | null {
  // URLs publiques (en production, les applications sont accessibles via leurs sous-domaines)
  const moduleUrls: Record<string, string> = {
    'librespeed': process.env.LIBRESPEED_INTERNAL_URL || 'https://librespeed.iahome.fr',
    'metube': process.env.METUBE_INTERNAL_URL || 'https://metube.iahome.fr',
    'pdf': process.env.PDF_INTERNAL_URL || 'https://pdf.iahome.fr',
    'psitransfer': process.env.PSITRANSFER_INTERNAL_URL || 'https://psitransfer.iahome.fr',
    'qrcodes': process.env.QRCODES_INTERNAL_URL || 'https://qrcodes.iahome.fr',
    'whisper': process.env.WHISPER_INTERNAL_URL || 'https://whisper.iahome.fr',
    'stablediffusion': process.env.STABLEDIFFUSION_INTERNAL_URL || 'https://stablediffusion.iahome.fr',
    'comfyui': process.env.COMFYUI_INTERNAL_URL || 'https://comfyui.iahome.fr',
    'meeting-reports': process.env.MEETING_REPORTS_INTERNAL_URL || 'https://meeting-reports.iahome.fr',
    'ruinedfooocus': process.env.RUINEDFOOOCUS_INTERNAL_URL || 'https://ruinedfooocus.iahome.fr',
    'cogstudio': process.env.COGSTUDIO_INTERNAL_URL || 'https://cogstudio.iahome.fr',
  };
  return moduleUrls[moduleId] || null;
}

// Fonction helper pour valider le token
function validateToken(token: string, moduleId: string): boolean {
  try {
    const decoded = JSON.parse(atob(token));
    return decoded.moduleId === moduleId && decoded.exp * 1000 > Date.now();
  } catch (e) {
    return false;
  }
}

// Fonction helper pour construire l'URL proxy
function buildProxyUrl(moduleId: string, token: string, path: string, query?: string): string {
  const basePath = `/api/app-access/${moduleId}/frame?token=${encodeURIComponent(token)}&path=${encodeURIComponent(path)}`;
  if (query) {
    return `${basePath}&${query}`;
  }
  return basePath;
}

// Script d'interception pour les requêtes AJAX/fetch
function getProxyInterceptorScript(moduleId: string, token: string): string {
  return `
<script>
(function() {
  console.log('[Proxy] Script d\'interception chargé pour', '${moduleId}');
  const MODULE_ID = '${moduleId}';
  const TOKEN = '${encodeURIComponent(token)}';
  const PROXY_BASE = '/api/app-access/' + MODULE_ID + '/frame?token=' + TOKEN + '&path=';
  console.log('[Proxy] Configuration:', { MODULE_ID, PROXY_BASE: PROXY_BASE.substring(0, 50) + '...' });
  
  // Fonction pour convertir une URL absolue en URL proxy
  function toProxyUrl(url) {
    if (!url || typeof url !== 'string') {
      return url;
    }
    
    try {
      // Si c'est déjà une URL proxy, la laisser telle quelle
      if (url.includes('/api/app-access/')) {
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
  
  // Réécrire les URLs absolues dans le document
  function rewriteUrls() {
    // Réécrire les URLs dans les liens
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (href && !href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('//') && !href.startsWith('mailto:') && !href.startsWith('#')) {
        const newHref = PROXY_BASE + encodeURIComponent(href.startsWith('/') ? href : '/' + href);
        link.setAttribute('href', newHref);
      }
    });
    
    // Réécrire les URLs dans les images
    document.querySelectorAll('img[src]').forEach(img => {
      const src = img.getAttribute('src');
      if (src && !src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('//') && !src.startsWith('data:')) {
        const newSrc = PROXY_BASE + encodeURIComponent(src.startsWith('/') ? src : '/' + src);
        img.setAttribute('src', newSrc);
      }
    });
  }
  
  // Exécuter après le chargement
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', rewriteUrls);
  } else {
    rewriteUrls();
  }
  
  // Observer les changements DOM pour réécrire les nouvelles URLs
  const observer = new MutationObserver(rewriteUrls);
  observer.observe(document.body, { childList: true, subtree: true });
  
  console.log('[Proxy] ✅ Script d\'interception complètement chargé');
})();
</script>
`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  return handleRequest(request, params, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  return handleRequest(request, params, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  return handleRequest(request, params, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  return handleRequest(request, params, 'DELETE');
}

async function handleRequest(
  request: NextRequest,
  params: Promise<{ moduleId: string }>,
  method: string
) {
  try {
    const { moduleId } = await params;
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return NextResponse.json({ error: 'Token requis' }, { status: 401 });
    }

    const appInternalUrl = getModuleInternalUrl(moduleId);
    if (!appInternalUrl) {
      return NextResponse.json({ error: 'Module non trouvé' }, { status: 404 });
    }

    if (!validateToken(token, moduleId)) {
      return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 403 });
    }

    // Construire l'URL complète avec le chemin demandé (URL interne)
    const requestedPath = url.searchParams.get('path') || '/';
    const queryString = url.search.replace(/[?&]token=[^&]*/g, '').replace(/[?&]path=[^&]*/g, '');
    const targetUrl = `${appInternalUrl}${requestedPath}${queryString}`;
    
    console.log(`🔗 ${moduleId} Frame [${method}]: Proxying vers URL interne:`, targetUrl);

    try {
      // Headers simples pour la requête interne (pas besoin de Cloudflare Access)
      const headers: Record<string, string> = {
        'User-Agent': `IAHome-${moduleId}-Access-Proxy/1.0`,
        'Accept': request.headers.get('accept') || '*/*',
      };

      // Copier les headers importants
      const requestContentType = request.headers.get('content-type');
      if (requestContentType) {
        headers['Content-Type'] = requestContentType;
      }

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

      // Faire la requête depuis le serveur vers l'application interne (sans Cloudflare Access)
      const response = await fetch(targetUrl, {
        method,
        headers,
        body,
        redirect: 'follow',
      });

      if (!response.ok) {
        console.error(`❌ ${moduleId} returned ${response.status} ${response.statusText}`);
        throw new Error(`${moduleId} returned ${response.status}`);
      }

      // Récupérer le contenu
      const contentType = response.headers.get('content-type') || 'text/html';
      const content = await response.arrayBuffer();

      // Réécrire les URLs dans le HTML si c'est du HTML
      if (contentType.includes('text/html')) {
        let html = new TextDecoder().decode(content);
        
        // Injecter le script d'interception TRÈS TÔT, avant tout autre script
        const interceptorScript = getProxyInterceptorScript(moduleId, token);
        
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
        
        // Pas besoin de réécrire les URLs absolues car on utilise les URLs internes
        // Le script d'interception gère déjà les URLs relatives

        return new NextResponse(html, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'X-Proxy-By': `IAHome-${moduleId}-Access-Frame`,
            'Cache-Control': 'no-cache',
          },
        });
      }

      // Pour les autres types de contenu (CSS, JS, images, etc.), retourner tel quel
      return new NextResponse(content, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'X-Proxy-By': `IAHome-${moduleId}-Access-Frame`,
          'Cache-Control': 'public, max-age=3600',
        },
      });

    } catch (fetchError) {
      console.error(`❌ Erreur lors du fetch vers ${moduleId}:`, fetchError);
      return NextResponse.json(
        { error: `Erreur de connexion à ${moduleId}` },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error(`❌ Frame Error:`, error);
    return NextResponse.json(
      { error: 'Erreur interne' },
      { status: 500 }
    );
  }
}


