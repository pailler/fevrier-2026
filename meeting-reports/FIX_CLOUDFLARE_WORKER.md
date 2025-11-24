# Fix rapide : Cloudflare Worker bloque les uploads

## 🎯 Action immédiate

Le Worker `protect-sous-domaines-iahome` bloque les uploads. Voici le fix rapide :

### Dans Cloudflare Dashboard

1. **Ouvrez** : https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/workers/services/view/protect-sous-domaines-iahome/production

2. **Cliquez sur "Edit code"**

3. **Ajoutez au début de la fonction `fetch`** :

```javascript
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // FIX : Laisser passer toutes les requêtes API et POST (uploads)
    if (url.pathname.startsWith('/api/') || request.method === 'POST') {
      return fetch(request);
    }
    
    // ... reste du code existant
```

4. **Cliquez sur "Save and deploy"**

5. **Testez** : Essayez d'uploader un fichier de 34 MB

## ✅ C'est tout !

Cette modification permet aux uploads de passer directement sans être interceptés par le Worker.

Voir `SOLUTION_CLOUDFLARE_WORKER_413.md` pour plus de détails.
















