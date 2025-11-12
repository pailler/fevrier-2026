/**
 * Cloudflare Worker pour protéger pdf.iahome.fr
 * Version simplifiée pour debug
 */

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const hostname = url.hostname;
  
  // PROTECTION UNIQUEMENT POUR pdf.iahome.fr
  if (hostname !== 'pdf.iahome.fr') {
    return fetch(request);
  }
  
  // Logs de debug
  console.log(`🛡️ PDF Worker: ${request.method} ${url.pathname}${url.search}`);
  console.log(`🛡️ PDF Worker: Hostname: ${hostname}`);
  
  // Laisser passer toutes les ressources statiques, API, etc.
  const isResource = url.pathname.match(/\.(js|css|jpg|jpeg|png|gif|svg|ico|woff|woff2|ttf|eot|mp4|webm|json|xml|pdf|zip|txt|map|webp|avif)$/i);
  const isAPI = url.pathname.startsWith('/api/');
  const isStatic = url.pathname.startsWith('/static/') || url.pathname.startsWith('/assets/') || url.pathname.startsWith('/_next/');
  const isPost = request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE' || request.method === 'OPTIONS';
  
  if (isResource || isAPI || isStatic || isPost) {
    console.log(`🛡️ PDF Worker: ✅ Ressource/API/Static/Post - Laisser passer`);
    return fetch(request);
  }
  
  // Vérifier si c'est la requête principale (GET /)
  const isMainRequest = request.method === 'GET' && (url.pathname === '/' || url.pathname === '');
  
  if (isMainRequest) {
    const hasToken = url.searchParams.has('token');
    console.log(`🛡️ PDF Worker: Requête principale - Token présent: ${hasToken}`);
    
    if (!hasToken) {
      console.log(`🛡️ PDF Worker: ❌ Pas de token - Redirection`);
      return Response.redirect('https://iahome.fr/encours?error=direct_access_denied', 302);
    }
    
    console.log(`🛡️ PDF Worker: ✅ Token présent - Laisser passer`);
    return fetch(request);
  }
  
  // Autres requêtes - laisser passer
  console.log(`🛡️ PDF Worker: ✅ Autre requête - Laisser passer`);
  return fetch(request);
}











