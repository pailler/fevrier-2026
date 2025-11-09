# Code Cloudflare Worker corrigé

## ✅ Code complet corrigé

Voici le code corrigé pour le Worker `protect-sous-domaines-iahome` :

```javascript
/**
 * Cloudflare Worker pour protéger les applis iahome.fr
 * Redirige uniquement la requête HTML principale sans token
 * Laisse passer toutes les ressources (JS, CSS, WebSockets, etc.)
 * 
 * FIX : Exclut les requêtes API et POST pour permettre les uploads
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;
    
    // ============================================
    // FIX CRITIQUE : Laisser passer les uploads et API
    // ============================================
    
    // Toutes les requêtes API (inclut /api/upload)
    if (url.pathname.startsWith('/api/')) {
      return fetch(request);
    }
    
    // Toutes les requêtes POST (uploads de fichiers)
    if (method === 'POST') {
      return fetch(request);
    }
    
    // Toutes les requêtes PUT, DELETE (modifications)
    if (method === 'PUT' || method === 'DELETE') {
      return fetch(request);
    }
    
    // ============================================
    // Laisser passer les ressources statiques
    // ============================================
    
    const resourceExtensions = [
      '.js', '.css', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico',
      '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.webm', '.json',
      '.xml', '.pdf', '.zip', '.txt', '.map', '.webp', '.avif'
    ];
    
    const isResource = resourceExtensions.some(ext => 
      url.pathname.toLowerCase().endsWith(ext)
    );
    
    if (isResource) {
      return fetch(request);
    }
    
    // ============================================
    // Laisser passer WebSockets et SSE
    // ============================================
    
    const isWebSocket = request.headers.get('Upgrade') === 'websocket' ||
                        request.headers.get('Connection')?.includes('Upgrade');
    
    const isSSE = request.headers.get('Accept')?.includes('text/event-stream');
    
    if (isWebSocket || isSSE) {
      return fetch(request);
    }
    
    // ============================================
    // Laisser passer les health checks
    // ============================================
    
    const isHealthCheck = url.pathname.includes('/health') ||
                          url.pathname.includes('/ping') ||
                          url.pathname.includes('/status');
    
    if (isHealthCheck) {
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
      
      if (!hasToken) {
        // Pas de token sur la requête principale → Rediriger vers iahome.fr
        return Response.redirect('https://iahome.fr/encours?error=direct_access_denied', 302);
      }
    }
    
    // Token présent OU ce n'est pas la requête principale → Laisser passer normalement
    return fetch(request);
  }
};
```

## 🔧 Corrections apportées

1. **Syntaxe unifiée** : Utilisation de `export default { async fetch(...) }` (syntaxe moderne ES modules)
2. **Suppression du doublon** : Retiré `addEventListener` et `handleRequest` (ancienne syntaxe)
3. **Ordre des vérifications** : Les exclusions (API, POST) sont en premier pour garantir qu'elles passent
4. **Structure claire** : Code organisé en sections commentées

## 📋 Instructions de déploiement

1. **Ouvrez** : https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/workers/services/view/protect-sous-domaines-iahome/production

2. **Cliquez sur "Edit code"**

3. **Remplacez tout le code** par le code corrigé ci-dessus

4. **Cliquez sur "Save and deploy"**

5. **Testez** : Essayez d'uploader un fichier de 34 MB

## ✅ Résultat attendu

- ✅ Les uploads POST vers `/api/upload` passent directement
- ✅ Les requêtes API passent directement
- ✅ La protection des pages principales (GET /) fonctionne toujours
- ✅ Les ressources statiques passent toujours

## 📝 Fichier source

Le code complet est disponible dans : `cloudflare-worker-protect-sous-domaines.js`





