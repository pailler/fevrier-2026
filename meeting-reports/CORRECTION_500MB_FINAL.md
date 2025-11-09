# Correction : Accepter les fichiers jusqu'à 500 MB

## ✅ Modifications appliquées

### 1. Backend (FastAPI/Hypercorn)
- ✅ **Middleware** : Limite à 500 MB (`MAX_UPLOAD_SIZE = 500 * 1024 * 1024`)
- ✅ **Hypercorn** : Timeout de lecture à 1800s (30 minutes)
- ✅ **Streaming** : Upload par chunks de 64 KB pour éviter la saturation mémoire

### 2. Traefik - Sous-domaine upload-meeting-reports
- ✅ **Fichier** : `traefik/dynamic/upload-meeting-reports.yml`
- ✅ **maxRequestBodyBytes** : 524288000 (500 MB)
- ✅ **memRequestBodyBytes** : 524288000 (500 MB) - streaming pur
- ✅ **Route** : `upload-meeting-reports.iahome.fr/api/upload` avec priorité 100

### 3. Nginx
- ✅ **client_max_body_size** : 500M (global et dans `/api/`)
- ✅ **Timeouts** : proxy_send_timeout et proxy_read_timeout à 1800s (30 min)
- ✅ **Buffers** : Augmentés pour les gros uploads

### 4. Frontend
- ✅ **URL d'upload** : `https://upload-meeting-reports.iahome.fr/api/upload` (production)
- ✅ **maxContentLength** : 524288000 (500 MB)
- ✅ **maxBodyLength** : 524288000 (500 MB)
- ✅ **Timeout** : 1800000ms (30 minutes)

## 📊 Vérification des limites

| Composant | Paramètre | Valeur | Statut |
|-----------|-----------|--------|--------|
| **Backend Middleware** | MAX_UPLOAD_SIZE | 500 MB | ✅ |
| **Traefik** | maxRequestBodyBytes | 500 MB | ✅ |
| **Traefik** | memRequestBodyBytes | 500 MB | ✅ |
| **Nginx** | client_max_body_size | 500 MB | ✅ |
| **Nginx** | proxy timeouts | 30 min | ✅ |
| **Hypercorn** | read-timeout | 30 min | ✅ |
| **Frontend** | maxContentLength | 500 MB | ✅ |
| **Frontend** | maxBodyLength | 500 MB | ✅ |
| **Frontend** | timeout | 30 min | ✅ |

## 🔄 Redémarrage effectué

- ✅ Frontend reconstruit et redémarré
- ✅ Backend reconstruit et redémarré
- ✅ Traefik redémarré

## ⚠️ Important : Vérifications Cloudflare

**Le sous-domaine `upload-meeting-reports.iahome.fr` DOIT être en DNS only (gris) dans Cloudflare** :
1. Cloudflare Dashboard → DNS → Records
2. Trouver `upload-meeting-reports.iahome.fr`
3. L'icône doit être **gris (DNS only)**, pas orange (proxy)
4. Si orange, cliquer pour passer en gris

## 🧪 Test

1. Attendre 2-5 minutes pour la propagation DNS et le redémarrage des services
2. Ouvrir `https://meeting-reports.iahome.fr/?token=VOTRE_TOKEN`
3. Tester l'upload d'un fichier > 35 MB (jusqu'à 500 MB)
4. Vérifier dans la console du navigateur (F12) que la requête va vers `upload-meeting-reports.iahome.fr`

## 📝 Notes

- Les fichiers sont uploadés via le sous-domaine dédié `upload-meeting-reports.iahome.fr`
- Le sous-domaine contourne la limite Cloudflare de 1 MB
- Tous les composants sont configurés pour accepter jusqu'à 500 MB
- Le streaming est utilisé pour éviter la saturation mémoire






