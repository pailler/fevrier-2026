# Configuration : Sous-domaine upload-meeting-reports.iahome.fr

## ✅ Configuration appliquée

### 1. Traefik - Route pour upload-meeting-reports

**Fichier créé** : `traefik/dynamic/upload-meeting-reports.yml`

**Configuration** :
- ✅ Route `/api/upload` avec priorité 100
- ✅ Route `/api/*` (hors upload) avec priorité 1
- ✅ Buffer 500 MB pour les uploads
- ✅ CORS configuré pour accepter les requêtes depuis `meeting-reports.iahome.fr`
- ✅ Backend : `host.docker.internal:8000`

### 2. Frontend - Utilisation du sous-domaine pour les uploads

**Fichier modifié** : `meeting-reports/frontend/src/App.js`

**Modifications** :
- ✅ Variable `UPLOAD_API_URL` ajoutée
- ✅ En développement : `http://localhost:8000/upload`
- ✅ En production : `https://upload-meeting-reports.iahome.fr/api/upload`
- ✅ Détection automatique de l'environnement

### 3. DNS Cloudflare

**Vérification nécessaire** :
- ✅ Sous-domaine `upload-meeting-reports.iahome.fr` créé
- ⚠️ **IMPORTANT** : Doit être en **DNS only (gris)** pour bypasser la limite 1MB
- ⚠️ Ne pas activer le proxy Cloudflare (orange) sur ce sous-domaine

## 🔄 Redémarrage effectué

Traefik a été redémarré pour charger la nouvelle configuration.

## 📊 Flux de requêtes

### Upload de fichier
```
Frontend (meeting-reports.iahome.fr)
    ↓ POST https://upload-meeting-reports.iahome.fr/api/upload
Traefik (route upload-meeting-reports-upload)
    ↓ http://host.docker.internal:8000/upload
Backend (FastAPI/Hypercorn)
```

### Autres requêtes API
```
Frontend (meeting-reports.iahome.fr)
    ↓ GET /api/reports (relative URL)
Traefik (route meeting-reports-api)
    ↓ http://host.docker.internal:8000/reports
Backend
```

## ✅ Avantages

1. ✅ **Bypass limite Cloudflare 1MB** : Le sous-domaine est en DNS only
2. ✅ **Pas de proxy Cloudflare** : Pas de limite de taille
3. ✅ **Sécurité maintenue** : Le domaine principal reste protégé par Cloudflare
4. ✅ **Uploads illimités** : Jusqu'à 500 MB (limite configurée dans Traefik/Nginx/Backend)

## 🧪 Test

1. **Attendez 2-5 minutes** pour la propagation DNS et le redémarrage Traefik
2. **Ouvrez** `https://meeting-reports.iahome.fr/?token=VOTRE_TOKEN`
3. **Testez l'upload** d'un fichier > 1 MB
4. **Vérifiez** dans la console du navigateur (F12) que la requête va vers `upload-meeting-reports.iahome.fr`

## 📝 Vérifications DNS

Dans Cloudflare Dashboard → DNS → Records :
- `upload-meeting-reports.iahome.fr` doit être **DNS only (gris)**
- Doit pointer vers l'IP de votre serveur
- TTL : Auto ou 300

## ⚠️ Important

- Le sous-domaine `upload-meeting-reports.iahome.fr` **DOIT** être en DNS only (pas de proxy)
- Le domaine principal `meeting-reports.iahome.fr` peut rester en proxy Cloudflare
- Les autres endpoints API (`/api/reports`, `/api/status`, etc.) continuent d'utiliser le domaine principal













