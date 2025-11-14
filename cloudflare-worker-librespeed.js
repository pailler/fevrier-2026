/**
 * Cloudflare Worker pour protéger librespeed.iahome.fr
 * Redirige uniquement la requête HTML principale sans token
 * Laisse passer toutes les ressources (JS, CSS, WebSockets, etc.)
 */

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Liste des extensions de ressources à laisser passer directement
  const resourceExtensions = [
    '.js', '.css', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico',
    '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.webm', '.json',
    '.xml', '.pdf', '.zip', '.txt', '.map', '.webp', '.avif'
  ];
  
  // Vérifier si c'est une ressource statique
  const isResource = resourceExtensions.some(ext => 
    url.pathname.toLowerCase().endsWith(ext)
  );
  
  // Vérifier si c'est une requête WebSocket
  const isWebSocket = request.headers.get('Upgrade') === 'websocket' ||
                      request.headers.get('Connection')?.includes('Upgrade');
  
  // Vérifier si c'est une requête SSE (Server-Sent Events)
  const isSSE = request.headers.get('Accept')?.includes('text/event-stream');
  
  // Vérifier si c'est une requête API
  const isAPI = url.pathname.startsWith('/api/') ||
                url.pathname.startsWith('/socket.io/') ||
                url.pathname.startsWith('/ws');
  
  // Vérifier si c'est une requête de health check ou monitoring
  const isHealthCheck = url.pathname.includes('/health') ||
                        url.pathname.includes('/ping') ||
                        url.pathname.includes('/status');
  
  // Si c'est une ressource, WebSocket, SSE, API ou health check → Laisser passer directement
  if (isResource || isWebSocket || isSSE || isAPI || isHealthCheck) {
    return fetch(request);
  }
  
  // Vérifier si c'est la requête principale (GET / ou GET /index.html)
  const isMainRequest = (
    request.method === 'GET' && 
    (url.pathname === '/' || 
     url.pathname === '' ||
     url.pathname.toLowerCase() === '/index.html' ||
     url.pathname.toLowerCase().endsWith('/index'))
  );
  
  if (isMainRequest) {
    // Vérifier si un token est présent dans l'URL
    const hasToken = url.searchParams.has('token');
    
    if (!hasToken) {
      // Pas de token sur la requête principale → Rediriger vers iahome.fr
      return Response.redirect('https://iahome.fr/encours?error=direct_access_denied', 302);
    }
  }
  
  // Token présent OU ce n'est pas la requête principale → Laisser passer normalement
  return fetch(request);
}














