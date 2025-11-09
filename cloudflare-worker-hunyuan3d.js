/**
 * Cloudflare Worker pour protéger hunyuan3d.iahome.fr
 * Redirige uniquement la requête HTML principale sans token
 * Laisse passer toutes les ressources (JS, CSS, WebSockets, etc.)
 * 
 * FIX : Exclut les requêtes API et POST pour permettre les uploads
 * FIX : Amélioration pour éviter les pages blanches
 */

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const hostname = url.hostname;
  const method = request.method;
  
  // PROTECTION UNIQUEMENT POUR hunyuan3d.iahome.fr
  if (hostname !== 'hunyuan3d.iahome.fr') {
    return fetch(request);
  }
  
  // Logs de debug
  console.log(`🛡️ Hunyuan 3D Worker: ${method} ${url.pathname}${url.search}`);
  console.log(`🛡️ Hunyuan 3D Worker: Hostname: ${hostname}`);
  
  // ============================================
  // FIX CRITIQUE : Laisser passer les uploads et API EN PREMIER
  // ============================================
  
  // Toutes les requêtes API (inclut /api/upload)
  if (url.pathname.startsWith('/api/')) {
    console.log(`🛡️ Hunyuan 3D Worker: ✅ API - Laisser passer`);
    return fetch(request);
  }
  
  // Toutes les requêtes POST (uploads de fichiers)
  if (method === 'POST') {
    console.log(`🛡️ Hunyuan 3D Worker: ✅ POST - Laisser passer`);
    return fetch(request);
  }
  
  // Toutes les requêtes PUT, DELETE (modifications)
  if (method === 'PUT' || method === 'DELETE') {
    console.log(`🛡️ Hunyuan 3D Worker: ✅ PUT/DELETE - Laisser passer`);
    return fetch(request);
  }
  
  // Toutes les requêtes OPTIONS (CORS preflight)
  if (method === 'OPTIONS') {
    console.log(`🛡️ Hunyuan 3D Worker: ✅ OPTIONS - Laisser passer`);
    return fetch(request);
  }
  
  // ============================================
  // Laisser passer les ressources statiques
  // ============================================
  
  // Liste des extensions de ressources à laisser passer directement
  const resourceExtensions = [
    '.js', '.css', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico',
    '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.webm', '.json',
    '.xml', '.pdf', '.zip', '.txt', '.map', '.webp', '.avif',
    '.woff2', '.woff', '.ttf', '.otf', '.eot', '.glb', '.gltf', // Formats 3D
    '.obj', '.mtl', '.fbx', '.dae', '.stl', '.ply' // Formats 3D supplémentaires
  ];
  
  // Vérifier si c'est une ressource statique
  const isResource = resourceExtensions.some(ext => 
    url.pathname.toLowerCase().endsWith(ext)
  );
  
  // Vérifier si c'est dans un dossier de ressources statiques
  const isStaticPath = url.pathname.startsWith('/static/') ||
                       url.pathname.startsWith('/assets/') ||
                       url.pathname.startsWith('/_next/') ||
                       url.pathname.startsWith('/favicon.ico') ||
                       url.pathname.startsWith('/models/') ||
                       url.pathname.startsWith('/textures/');
  
  // Vérifier si c'est une requête WebSocket
  const isWebSocket = request.headers.get('Upgrade') === 'websocket' ||
                      request.headers.get('Connection')?.includes('Upgrade');
  
  // Vérifier si c'est une requête SSE (Server-Sent Events)
  const isSSE = request.headers.get('Accept')?.includes('text/event-stream');
  
  // Vérifier si c'est une requête de health check ou monitoring
  const isHealthCheck = url.pathname.includes('/health') ||
                        url.pathname.includes('/ping') ||
                        url.pathname.includes('/status');
  
  // Si c'est une ressource, WebSocket, SSE ou health check → Laisser passer directement
  if (isResource || isStaticPath || isWebSocket || isSSE || isHealthCheck) {
    console.log(`🛡️ Hunyuan 3D Worker: ✅ Ressource/Static/WebSocket/SSE/Health - Laisser passer`);
    return fetch(request);
  }
  
  // ============================================
  // PROTECTION : Vérifier le token pour GET /
  // ============================================
  
  // Vérifier si c'est la requête principale (GET / ou GET /index.html)
  const isMainRequest = (
    method === 'GET' && 
    (url.pathname === '/' || 
     url.pathname === '' ||
     url.pathname.toLowerCase() === '/index.html' ||
     url.pathname.toLowerCase().endsWith('/index'))
  );
  
  if (isMainRequest) {
    // Vérifier si un token est présent dans l'URL
    const hasToken = url.searchParams.has('token');
    console.log(`🛡️ Hunyuan 3D Worker: Requête principale - Token présent: ${hasToken}`);
    
    if (!hasToken) {
      // Pas de token sur la requête principale → Rediriger vers iahome.fr
      console.log(`🛡️ Hunyuan 3D Worker: ❌ Pas de token - Redirection`);
      return Response.redirect('https://iahome.fr/encours?error=direct_access_denied', 302);
    }
    
    // Token présent → Laisser passer avec le token pour que l'app puisse le lire
    console.log(`🛡️ Hunyuan 3D Worker: ✅ Token présent - Laisser passer`);
    return fetch(request);
  }
  
  // Token présent OU ce n'est pas la requête principale → Laisser passer normalement
  console.log(`🛡️ Hunyuan 3D Worker: ✅ Autre requête - Laisser passer`);
  return fetch(request);
}

