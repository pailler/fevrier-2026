# Action immédiate : Corriger l'erreur d'upload

## 🔍 Problème identifié

**Le sous-domaine `upload-meeting-reports.iahome.fr` n'existe pas dans le DNS**, ce qui fait échouer les uploads.

## ✅ Solution temporaire appliquée

Le frontend utilise maintenant temporairement `meeting-reports.iahome.fr/api/upload` au lieu du sous-domaine inexistant.

**Fichier modifié** : `meeting-reports/frontend/src/App.js`

## ⚠️ IMPORTANT : Créer le sous-domaine dans Cloudflare

Pour que les uploads > 1 MB fonctionnent, vous **DEVEZ** créer le sous-domaine dans Cloudflare :

### Étapes dans Cloudflare Dashboard :

1. **Aller dans** : https://dash.cloudflare.com/
2. **Sélectionner** votre domaine `iahome.fr`
3. **Aller dans** : DNS → Records
4. **Cliquer sur** "Add record"
5. **Configurer** :
   - **Type** : A
   - **Nom** : `upload-meeting-reports`
   - **IPv4** : IP de votre serveur (même IP que `meeting-reports.iahome.fr`)
   - **Proxy** : **Désactivé (gris)** ⚠️ **CRITIQUE** - Doit être en DNS only
   - **TTL** : Auto
6. **Sauvegarder**

### Après création :

1. **Attendre 2-5 minutes** pour la propagation DNS
2. **Vérifier la résolution** :
   ```powershell
   nslookup upload-meeting-reports.iahome.fr
   ```
3. **Modifier le frontend** pour utiliser le sous-domaine :
   ```javascript
   const UPLOAD_API_URL = isDevelopment 
     ? 'http://localhost:8000/upload'
     : 'https://upload-meeting-reports.iahome.fr/api/upload';  // Sous-domaine créé
   ```
4. **Reconstruire le frontend** :
   ```powershell
   cd meeting-reports
   docker-compose build frontend
   docker-compose up -d frontend
   ```

## 🔄 Redémarrage effectué

- ✅ Healthcheck Docker corrigé (utilise Python au lieu de curl)
- ✅ Backend redémarré
- ✅ Frontend reconstruit avec solution temporaire

## 📝 Statut actuel

- ✅ Upload fonctionne temporairement via `meeting-reports.iahome.fr`
- ⚠️ Limite Cloudflare 1 MB toujours active sur le domaine principal
- ⚠️ **Créer le sous-domaine pour permettre les uploads > 1 MB**

## 🧪 Test

1. Tester l'upload maintenant (fonctionne pour fichiers < 1 MB)
2. Après création du sous-domaine, tester avec fichiers > 1 MB











