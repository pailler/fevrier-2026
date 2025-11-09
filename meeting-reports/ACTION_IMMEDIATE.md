# ⚡ Action immédiate - Erreur 413 persistante

## 🎯 Solution rapide en 3 étapes

### Étape 1 : Modifier le Worker Cloudflare (OBLIGATOIRE)

1. **Ouvrez** : https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/workers/services/view/protect-sous-domaines-iahome/production

2. **Cliquez sur "Edit code"**

3. **Remplacez TOUT le code** par le contenu du fichier :
   ```
   cloudflare-worker-protect-sous-domaines.js
   ```

4. **Cliquez sur "Save and deploy"**

5. **Attendez 2 minutes** pour la propagation

### Étape 2 : Vérifier les services

```powershell
# Redémarrer tous les services pour être sûr
docker restart meeting-reports-nginx-1
docker restart iahome-traefik
docker restart meeting-reports-backend-1
```

### Étape 3 : Tester

Essayez d'uploader un fichier de 34 MB.

## 🔍 Si l'erreur persiste

### Option A : Contourner complètement le Worker

Dans Cloudflare Dashboard → Workers → Triggers → Routes :
- Trouvez la route `meeting-reports.iahome.fr/*`
- **Supprimez-la temporairement**
- Testez l'upload
- Si ça fonctionne, réactivez et modifiez le Worker

### Option B : Utiliser directement le backend

Modifiez temporairement le frontend pour utiliser directement le backend :

Dans `meeting-reports/frontend/src/App.js`, ligne 11 :
```javascript
// Au lieu de :
const API_BASE_URL = '/api';

// Utilisez temporairement :
const API_BASE_URL = 'http://localhost:8000';
```

Puis testez directement depuis `http://localhost:3050` (bypass Cloudflare).

## ⚠️ Cause probable

Si l'erreur persiste malgré toutes les corrections :
- **99% de chance** que ce soit le Worker Cloudflare qui bloque encore
- Le Worker doit être modifié dans Cloudflare Dashboard
- Les modifications locales ne suffisent pas - il faut déployer dans Cloudflare

## 📝 Vérification finale

Après modification du Worker, vérifiez dans Cloudflare Dashboard → Analytics :
- Les erreurs 4xx devraient diminuer
- Les requêtes vers `/api/upload` devraient passer





