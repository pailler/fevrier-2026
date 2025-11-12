# Correction du blocage des uploads au début

## 🔍 Problème identifié

Les uploads de fichiers bloquaient au tout début (0.7 MB / 244.4 MB transférés puis blocage).

## ✅ Solutions appliquées

### 1. Augmentation des timeouts Nginx

**Fichier modifié :** `meeting-reports/nginx/nginx.conf`

- `proxy_connect_timeout` : 60s → 120s
- `proxy_send_timeout` : 300s → 1800s (30 minutes)
- `proxy_read_timeout` : 300s → 1800s (30 minutes)
- Ajout de buffers plus grands pour les gros uploads

```nginx
proxy_connect_timeout 120s;
proxy_send_timeout 1800s;  # 30 minutes
proxy_read_timeout 1800s;  # 30 minutes
proxy_buffer_size 128k;
proxy_buffers 4 256k;
proxy_busy_buffers_size 256k;
```

### 2. Augmentation des timeouts Frontend

**Fichier modifié :** `meeting-reports/frontend/src/App.js`

- `timeout` axios : 600000ms (10 min) → 1800000ms (30 minutes)
- Ajout de logs de progression pour debugging
- Meilleure gestion des erreurs

### 3. Optimisation du streaming backend

**Fichier modifié :** `meeting-reports/backend/main.py`

- Taille des chunks : 8KB → 64KB (meilleures performances)
- Ajout de timeout par chunk (300 secondes = 5 minutes)
- Logs plus fréquents (toutes les 5MB au lieu de 10MB)
- Meilleure gestion des erreurs de timeout

### 4. Configuration Hypercorn

**Fichier modifié :** `meeting-reports/backend/Dockerfile`

- Ajout de `--read-timeout 1800` (30 minutes)

## 📊 Améliorations

| Composant | Avant | Après |
|-----------|-------|-------|
| **Nginx timeout** | 5 minutes | 30 minutes |
| **Frontend timeout** | 10 minutes | 30 minutes |
| **Hypercorn timeout** | Défaut | 30 minutes |
| **Chunk size backend** | 8KB | 64KB |
| **Logs progress** | Toutes les 10MB | Toutes les 5MB |

## 🔄 Redémarrage requis

```powershell
cd meeting-reports
docker-compose restart nginx
docker-compose build backend
docker-compose up -d backend
```

## 🎯 Résultat attendu

Les uploads de fichiers volumineux (244MB) devraient maintenant progresser correctement sans blocage au début.

## 🐛 Debugging

Si le problème persiste, vérifier les logs :

```powershell
# Logs backend
docker-compose logs -f backend

# Logs nginx
docker-compose logs -f nginx
```

Les logs montreront maintenant la progression toutes les 5MB.










