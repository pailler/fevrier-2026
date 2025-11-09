# Diagnostic complet - Erreur 413 persistante

## 🔍 Checklist de vérification

### 1. Cloudflare Worker (PROBLÈME PRINCIPAL PROBABLE)

**Action requise** : Vérifier que le Worker a été modifié dans Cloudflare Dashboard

1. Ouvrez : https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/workers/services/view/protect-sous-domaines-iahome/production
2. Cliquez sur "Edit code"
3. Vérifiez que le code contient au début :
   ```javascript
   // Toutes les requêtes API (inclut /api/upload)
   if (url.pathname.startsWith('/api/')) {
     return fetch(request);
   }
   
   // Toutes les requêtes POST (uploads de fichiers)
   if (method === 'POST') {
     return fetch(request);
   }
   ```
4. Si ce code n'est PAS présent, remplacez tout le code par celui dans `cloudflare-worker-protect-sous-domaines.js`
5. Cliquez sur "Save and deploy"
6. Attendez 1-2 minutes pour la propagation

### 2. Test direct (bypass Cloudflare/Traefik)

Pour confirmer que le problème vient du Worker Cloudflare :

```powershell
# Tester directement le backend (bypass tout)
curl -X POST http://localhost:8000/upload -F "file=@test-file.bin" -v
```

Si ça fonctionne directement mais pas via `https://meeting-reports.iahome.fr/api/upload`, c'est le Worker Cloudflare qui bloque.

### 3. Vérification des services

```powershell
# État des services
docker ps | Select-String "meeting-reports|traefik"

# Logs Nginx (chercher erreurs 413)
docker logs meeting-reports-nginx-1 --tail=50 | Select-String "413|too large"

# Logs Traefik (chercher erreurs)
docker logs iahome-traefik --tail=50 | Select-String "meeting-reports|413"

# Logs Backend (voir si la requête arrive)
docker logs meeting-reports-backend-1 --tail=50 | Select-String "upload|UPLOAD"
```

### 4. Vérification de la configuration

```powershell
# Nginx
docker exec meeting-reports-nginx-1 cat /etc/nginx/nginx.conf | Select-String "client_max_body_size"

# Traefik
docker exec iahome-traefik cat /etc/traefik/dynamic/meeting-reports-api.yml | Select-String "memRequestBodyBytes"
```

## ✅ Solutions selon le diagnostic

### Si le Worker Cloudflare bloque encore

**Solution 1 : Modifier le Worker** (recommandé)
- Suivre les étapes ci-dessus pour modifier le Worker

**Solution 2 : Exclure meeting-reports du Worker**
- Dans Cloudflare Dashboard → Workers → Triggers → Routes
- Supprimer la route `meeting-reports.iahome.fr/*`
- OU créer une exception pour `/api/*`

**Solution 3 : Désactiver temporairement le Worker**
- Dans Cloudflare Dashboard → Workers → Triggers
- Désactiver temporairement la route pour `meeting-reports.iahome.fr`
- Tester l'upload
- Si ça fonctionne, réactiver et modifier le code du Worker

### Si Nginx bloque encore

```powershell
# Redémarrer Nginx pour forcer le rechargement
docker restart meeting-reports-nginx-1

# Vérifier que la config est bien appliquée
docker exec meeting-reports-nginx-1 nginx -T | Select-String "client_max_body_size"
```

### Si Traefik bloque encore

```powershell
# Redémarrer Traefik
docker restart iahome-traefik

# Vérifier la config dans le conteneur
docker exec iahome-traefik cat /etc/traefik/dynamic/meeting-reports-api.yml
```

## 🎯 Action immédiate recommandée

1. **Modifier le Worker Cloudflare** avec le code de `cloudflare-worker-protect-sous-domaines.js`
2. **Déployer et attendre 2 minutes**
3. **Tester l'upload**

Si l'erreur persiste après modification du Worker, c'est qu'il y a un autre point de blocage à identifier.





