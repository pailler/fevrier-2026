# Solution définitive pour l'erreur 413 - Cloudflare + Traefik

## 🔍 Diagnostic

L'erreur **413 (Content Too Large)** peut provenir de deux sources :

1. **Cloudflare** : Limite par défaut de **100 MB** pour les uploads
2. **Traefik** : Configuration de `memRequestBodyBytes` insuffisante

## ✅ Corrections appliquées

### 1. Configuration Traefik - `memRequestBodyBytes` augmenté à 500 MB

**Problème** : Traefik a une limite par défaut de `memRequestBodyBytes` (2 MB) qui bloque les fichiers volumineux même si `maxRequestBodyBytes` est configuré à 500 MB.

**Solution** : Augmenter `memRequestBodyBytes` à 500 MB (même valeur que `maxRequestBodyBytes`) pour éviter le streaming sur disque.

**Fichiers modifiés :**
- ✅ `traefik/dynamic/meeting-reports-api.yml`
- ✅ `traefik/dynamic/traefik-meeting-reports-api.yml`

**Configuration appliquée :**

```yaml
meeting-reports-upload-nobuffer:
  buffering:
    maxRequestBodyBytes: 524288000  # 500 MB maximum
    memRequestBodyBytes: 524288000  # 500 MB en mémoire - désactive le streaming sur disque
    memResponseBodyBytes: 10485760  # 10 MB pour les réponses
    retryExpression: "IsNetworkError() && Attempts() < 3"
```

### 2. Priorité des routes Traefik

**Problème** : La route générale `/api` pouvait capturer `/api/upload` avant la route spécifique.

**Solution** : Utiliser la priorité des routes pour que `/api/upload` soit évaluée en premier.

```yaml
meeting-reports-upload:
  rule: "Host(`meeting-reports.iahome.fr`) && PathPrefix(`/api/upload`)"
  priority: 10  # Priorité élevée

meeting-reports-api:
  rule: "Host(`meeting-reports.iahome.fr`) && PathPrefix(`/api`) && !PathPrefix(`/api/upload`)"
  priority: 1  # Priorité plus basse
```

### 3. URL du backend corrigée

**Problème** : Traefik dans un conteneur Docker ne peut pas accéder au backend via `localhost:8000`.

**Solution** : Utiliser `host.docker.internal:8000` pour accéder au host depuis le conteneur.

```yaml
servers:
  - url: "http://host.docker.internal:8000"
```

## ⚠️ Limite Cloudflare (100 MB)

**IMPORTANT** : Si l'erreur 413 persiste pour des fichiers > 100 MB, c'est **Cloudflare qui bloque**.

### Solutions pour contourner la limite Cloudflare :

#### Option 1 : Désactiver le proxy Cloudflare (DNS only)
1. Aller dans Cloudflare Dashboard
2. DNS > Records
3. Trouver `meeting-reports.iahome.fr`
4. Cliquer sur l'icône orange (proxy) pour passer en gris (DNS only)
5. ⚠️ Cela désactive la protection Cloudflare pour ce sous-domaine

#### Option 2 : Utiliser Cloudflare Workers pour les uploads
Créer un Worker qui bypass la limite pour `/api/upload`

#### Option 3 : Upload direct vers un autre endpoint
Utiliser un sous-domaine direct (ex: `upload.iahome.fr`) qui ne passe pas par Cloudflare

## 🔄 Redémarrage de Traefik

Après modification des fichiers de configuration :

```powershell
docker restart iahome-traefik
```

Ou :

```powershell
docker-compose -f docker-compose.prod.yml restart traefik
```

## 📊 État de la configuration

| Composant | Paramètre | Valeur | Statut |
|-----------|-----------|---------|--------|
| **Traefik** | maxRequestBodyBytes | 500 MB | ✅ |
| **Traefik** | memRequestBodyBytes | 500 MB | ✅ |
| **Traefik** | Priorité route upload | 10 | ✅ |
| **Traefik** | URL backend | host.docker.internal:8000 | ✅ |
| **Nginx** | client_max_body_size | 500 MB | ✅ |
| **Nginx** | proxy timeouts | 30 min | ✅ |
| **Hypercorn** | read-timeout | 30 min | ✅ |
| **Backend** | Chunk size | 64 KB | ✅ |
| **Frontend** | Axios timeout | 30 min | ✅ |
| **Cloudflare** | Limite upload | 100 MB | ⚠️ |

## 🧪 Test

1. Tester avec un fichier < 100 MB : doit fonctionner
2. Tester avec un fichier > 100 MB : si erreur 413, c'est Cloudflare qui bloque
3. Si erreur persiste pour fichiers < 100 MB : vérifier que Traefik a bien rechargé la config

## 📝 Notes

- La configuration Traefik est automatiquement rechargée grâce à `--providers.file.watch=true`
- Si le problème persiste, vérifier les logs Traefik : `docker logs iahome-traefik`
- Vérifier que le backend est accessible : `curl http://localhost:8000/health`

