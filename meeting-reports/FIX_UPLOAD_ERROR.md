# Correction de l'erreur d'upload

## 🔍 Problèmes identifiés

### 1. Healthcheck Docker échoue
**Problème** : Le healthcheck utilise `curl` qui n'est pas installé dans l'image Python slim.

**Solution** : Remplacer par Python qui est disponible dans le conteneur.

**Fichier modifié** : `meeting-reports/docker-compose.yml`

```yaml
healthcheck:
  test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/health').read()"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### 2. Sous-domaine upload-meeting-reports.iahome.fr non résolu
**Problème** : Le DNS ne résout pas `upload-meeting-reports.iahome.fr`.

**Solutions possibles** :
1. **Vérifier dans Cloudflare Dashboard** :
   - DNS → Records
   - Vérifier que `upload-meeting-reports.iahome.fr` existe
   - Type : A ou CNAME
   - Proxy : **Désactivé (gris)** - DNS only
   - Contenu : IP de votre serveur

2. **Attendre la propagation DNS** : 2-5 minutes après création/modification

3. **Tester la résolution DNS** :
   ```powershell
   nslookup upload-meeting-reports.iahome.fr
   ```

## ✅ Actions effectuées

- ✅ Healthcheck Docker corrigé
- ✅ Backend redémarré

## ⚠️ Action requise : Vérifier Cloudflare DNS

**Dans Cloudflare Dashboard → DNS → Records** :

1. Vérifier que `upload-meeting-reports.iahome.fr` existe
2. Si absent, créer :
   - **Type** : A
   - **Nom** : `upload-meeting-reports`
   - **IPv4** : IP de votre serveur
   - **Proxy** : **Désactivé (gris)** ⚠️ CRITIQUE
   - **TTL** : Auto

3. Attendre 2-5 minutes pour la propagation

## 🧪 Test après correction

1. Vérifier la résolution DNS :
   ```powershell
   nslookup upload-meeting-reports.iahome.fr
   ```

2. Vérifier le healthcheck :
   ```powershell
   docker ps --filter "name=meeting-reports-backend"
   ```
   Le statut doit être "healthy" après quelques minutes.

3. Tester l'upload :
   - Ouvrir `https://meeting-reports.iahome.fr/?token=VOTRE_TOKEN`
   - Tester l'upload d'un fichier
   - Vérifier dans la console (F12) que la requête va vers `upload-meeting-reports.iahome.fr`

## 📝 Note alternative

Si le sous-domaine ne peut pas être créé immédiatement, vous pouvez temporairement utiliser le domaine principal `meeting-reports.iahome.fr` en modifiant le frontend :

```javascript
const UPLOAD_API_URL = isDevelopment 
  ? 'http://localhost:8000/upload'
  : 'https://meeting-reports.iahome.fr/api/upload';  // Temporaire
```

Mais cela nécessitera que `meeting-reports.iahome.fr` soit aussi en DNS only pour bypasser la limite Cloudflare 1MB.


