# Solution erreur 413 - Cloudflare Worker `protect-sous-domaines-iahome`

## 🔍 Problème identifié

Le dashboard Cloudflare montre que le Worker `protect-sous-domaines-iahome` génère **200 erreurs 4xx**, ce qui inclut probablement les erreurs 413 pour les uploads de fichiers.

Le Worker intercepte toutes les requêtes vers `meeting-reports.iahome.fr` et bloque les requêtes POST avec body volumineux.

## ✅ Solution : Modifier le Worker Cloudflare

### Étape 1 : Accéder au Worker dans Cloudflare Dashboard

1. Ouvrez : https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/workers/services/view/protect-sous-domaines-iahome/production
2. Cliquez sur **"Edit code"** ou **"Quick edit"**

### Étape 2 : Modifier le code du Worker

Ajoutez une vérification pour **exclure `/api/upload`** du traitement du Worker :

```javascript
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // EXCLUSION IMPORTANTE : Laisser passer les uploads d'API
    // Le Worker ne doit PAS intercepter les requêtes POST vers /api/upload
    if (url.pathname.startsWith('/api/upload') || 
        url.pathname.startsWith('/api/') ||
        request.method === 'POST' && url.pathname.includes('/upload')) {
      // Laisser passer toutes les requêtes API et uploads
      return fetch(request);
    }
    
    // Liste des sous-domaines protégés
    const protectedSubdomains = [
      'librespeed.iahome.fr',
      'metube.iahome.fr',
      'pdf.iahome.fr',
      'psitransfer.iahome.fr',
      'qrcodes.iahome.fr',
      'meeting-reports.iahome.fr'  // Ajouté si pas déjà présent
    ];
    
    // Vérifier si le hostname est protégé
    const isProtected = protectedSubdomains.includes(url.hostname);
    
    if (!isProtected) {
      // Sous-domaine non protégé → Laisser passer
      return fetch(request);
    }
    
    // ... reste du code de vérification du token pour les requêtes GET /
    // (garder le code existant pour la protection des pages principales)
    
    // Pour les autres requêtes (ressources, API, etc.), laisser passer
    return fetch(request);
  }
};
```

### Étape 3 : Code complet recommandé

```javascript
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;
    
    // ============================================
    // EXCLUSIONS : Laisser passer ces requêtes
    // ============================================
    
    // 1. Toutes les requêtes API (inclut /api/upload)
    if (url.pathname.startsWith('/api/')) {
      return fetch(request);
    }
    
    // 2. Toutes les requêtes POST (uploads)
    if (method === 'POST') {
      return fetch(request);
    }
    
    // 3. Toutes les requêtes PUT, DELETE (modifications)
    if (method === 'PUT' || method === 'DELETE') {
      return fetch(request);
    }
    
    // 4. Ressources statiques (JS, CSS, images, etc.)
    const resourceExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'];
    const isResource = resourceExtensions.some(ext => url.pathname.toLowerCase().endsWith(ext));
    if (isResource) {
      return fetch(request);
    }
    
    // 5. WebSockets et SSE
    if (request.headers.get('Upgrade') === 'websocket' || 
        request.headers.get('Accept')?.includes('text/event-stream')) {
      return fetch(request);
    }
    
    // ============================================
    // PROTECTION : Vérifier le token pour GET /
    // ============================================
    
    // Liste des sous-domaines protégés
    const protectedSubdomains = [
      'librespeed.iahome.fr',
      'metube.iahome.fr',
      'pdf.iahome.fr',
      'psitransfer.iahome.fr',
      'qrcodes.iahome.fr',
      'meeting-reports.iahome.fr'
    ];
    
    const isProtected = protectedSubdomains.includes(url.hostname);
    
    if (!isProtected) {
      return fetch(request);
    }
    
    // Pour les requêtes GET vers la page principale uniquement
    if (method === 'GET' && (url.pathname === '/' || url.pathname === '')) {
      const token = url.searchParams.get('token');
      
      if (!token) {
        // Pas de token → Rediriger vers iahome.fr
        return Response.redirect('https://iahome.fr', 302);
      }
    }
    
    // Pour toutes les autres requêtes, laisser passer
    return fetch(request);
  }
};
```

### Étape 4 : Déployer le Worker

1. Cliquez sur **"Save and deploy"** ou **"Deploy"**
2. Attendez quelques secondes pour la propagation

## 🔍 Vérification

Après le déploiement :

1. **Tester l'upload** : Essayez d'uploader un fichier de 34 MB
2. **Vérifier les logs** : Dans Cloudflare Dashboard → Workers → Logs
3. **Vérifier les analytics** : Les erreurs 4xx devraient diminuer

## 📊 Alternative : Exclure meeting-reports du Worker

Si vous préférez, vous pouvez **exclure complètement** `meeting-reports.iahome.fr` du Worker :

### Option A : Retirer de la liste des sous-domaines protégés

Dans le code du Worker, retirez `'meeting-reports.iahome.fr'` de la liste `protectedSubdomains`.

### Option B : Créer une route d'exception dans Cloudflare

1. Cloudflare Dashboard → Workers & Pages → `protect-sous-domaines-iahome`
2. **Triggers** → **Routes**
3. Ajoutez une route d'exception : `meeting-reports.iahome.fr/api/*` avec action "Skip Worker"

## ⚠️ Important

**Les Workers Cloudflare ont une limite de 100 MB pour les requêtes** :
- Plan gratuit : 100 MB max par requête
- Plan payant : jusqu'à 500 MB

Si vous avez besoin d'uploader des fichiers > 100 MB, vous **devez** exclure `/api/upload` du Worker car le Worker ne peut pas transmettre des requêtes > 100 MB.

## 📝 Résumé

**Action immédiate** : Modifier le Worker pour exclure `/api/upload` et toutes les requêtes POST.

**Code clé à ajouter** :
```javascript
if (url.pathname.startsWith('/api/') || method === 'POST') {
  return fetch(request);
}
```

Cela permettra aux uploads de passer directement sans être interceptés par le Worker.













