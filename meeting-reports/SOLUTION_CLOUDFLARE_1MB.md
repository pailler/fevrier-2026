# Solution : Cloudflare bloque les fichiers > 1 Mo

## 🔍 Problème

Cloudflare bloque les fichiers supérieurs à 1 Mo même si le Worker laisse passer les requêtes POST et `/api/`.

## ⚠️ Cause probable

**Cloudflare Proxy** (pas le Worker) a une limite de **1 MB** pour les plans gratuits lorsqu'il intercepte les requêtes avant même qu'elles n'atteignent le Worker.

Cette limite est appliquée par le proxy Cloudflare lui-même, indépendamment du Worker.

## ✅ Solutions

### Solution 1 : Désactiver le proxy Cloudflare pour meeting-reports (RECOMMANDÉ)

**Dans Cloudflare Dashboard :**

1. Allez dans **DNS → Records**
2. Trouvez `meeting-reports.iahome.fr`
3. **Cliquez sur l'icône orange (proxy)** pour la passer en **gris (DNS only)**
4. Sauvegardez

**Avantages :**
- ✅ Pas de limite de taille Cloudflare
- ✅ Les uploads fonctionnent sans restriction
- ✅ Le Worker Cloudflare peut toujours protéger la page principale

**Inconvénients :**
- ⚠️ Pas de protection DDoS Cloudflare pour ce sous-domaine
- ⚠️ L'IP de votre serveur sera visible publiquement

### Solution 2 : Utiliser un sous-domaine séparé pour les uploads ✅ IMPLÉMENTÉ

Créez un sous-domaine dédié qui ne passe pas par Cloudflare :

1. **Dans Cloudflare Dashboard → DNS → Records** ✅
   - **Type** : A ou CNAME
   - **Nom** : `upload-meeting-reports` (donne `upload-meeting-reports.iahome.fr`)
   - **Contenu** : IP de votre serveur
   - **Proxy** : **Désactivé (gris)** - DNS only ⚠️ **CRITIQUE**
   - **TTL** : Auto

2. **Dans Traefik** ✅ **FAIT**
   - Fichier créé : `traefik/dynamic/upload-meeting-reports.yml`
   - Route `/api/upload` configurée avec priorité 100
   - Buffer 500 MB pour les uploads
   - CORS configuré pour accepter les requêtes depuis `meeting-reports.iahome.fr`

3. **Dans le frontend** ✅ **FAIT**
   - Fichier modifié : `meeting-reports/frontend/src/App.js`
   - Variable `UPLOAD_API_URL` ajoutée
   - En production : `https://upload-meeting-reports.iahome.fr/api/upload`
   - En développement : `http://localhost:8000/upload`
   - Détection automatique de l'environnement

**Voir** : `meeting-reports/CONFIGURATION_UPLOAD_SUBDOMAIN.md` pour les détails complets.

### Solution 3 : Utiliser Cloudflare R2 pour les uploads

Pour les très gros fichiers, utilisez Cloudflare R2 (stockage objet) :
- Upload direct vers R2 depuis le frontend
- Backend récupère depuis R2 pour traitement

## 🎯 Solution immédiate (recommandée)

**Désactiver le proxy Cloudflare pour `meeting-reports.iahome.fr` :**

1. Cloudflare Dashboard → DNS → Records
2. Trouvez `meeting-reports.iahome.fr`
3. Cliquez sur l'icône 🟠 pour passer en ⚪ (DNS only)
4. Attendez 2-5 minutes pour la propagation DNS
5. Testez l'upload

## 📊 Vérification

Après avoir désactivé le proxy :

```powershell
# Vérifier que le DNS pointe directement vers votre serveur
nslookup meeting-reports.iahome.fr

# Devrait retourner l'IP de votre serveur (pas une IP Cloudflare)
```

## ⚠️ Note importante

Si vous gardez le proxy Cloudflare activé :
- Les fichiers > 1 MB seront bloqués par Cloudflare (plan gratuit)
- Le Worker ne peut pas contourner cette limite
- C'est une limitation du proxy Cloudflare lui-même

**Recommandation** : Désactivez le proxy pour `meeting-reports.iahome.fr` si vous avez besoin d'uploads > 1 MB.

