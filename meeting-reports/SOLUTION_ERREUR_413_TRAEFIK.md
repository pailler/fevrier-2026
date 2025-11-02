# Solution erreur 413 (Content Too Large) - Traefik

## 🔍 Problème identifié

L'erreur **413 (Content Too Large)** provient de **Traefik** qui bloque les uploads de fichiers volumineux avant même qu'ils n'atteignent le backend.

### Cause racine

Traefik a une limite par défaut de `memRequestBodyBytes` (2 MB) qui bloque les fichiers volumineux même si `maxRequestBodyBytes` est configuré à 500 MB.

## ✅ Solutions appliquées

### 1. Configuration Traefik - Route dédiée pour `/api/upload`

**Fichiers modifiés :**
- `traefik/dynamic/meeting-reports-api.yml`
- `traefik/dynamic/traefik-meeting-reports-api.yml`

**Configuration appliquée :**

```yaml
http:
  routers:
    meeting-reports-upload:
      rule: "Host(`meeting-reports.iahome.fr`) && PathPrefix(`/api/upload`)"
      service: meeting-reports-api-service
      middlewares:
        - meeting-reports-upload-nobuffer
        - meeting-reports-stripprefix
        - meeting-reports-api-headers
        - meeting-reports-cors

  middlewares:
    meeting-reports-upload-nobuffer:
      buffering:
        maxRequestBodyBytes: 524288000  # 500 MB maximum
        memRequestBodyBytes: 52428800   # 50 MB en mémoire avant streaming
        memResponseBodyBytes: 10485760  # 10 MB pour les réponses
```

### 2. Explication des paramètres

- **maxRequestBodyBytes** : Limite maximale totale du body (500 MB)
- **memRequestBodyBytes** : Quantité de mémoire utilisée avant de streamer sur disque (50 MB)
  - Par défaut : 2 MB (trop faible, causait le blocage)
  - Augmenté à 50 MB pour permettre le streaming efficace
- **memResponseBodyBytes** : Limite mémoire pour les réponses (10 MB)

### 3. Pourquoi cette configuration fonctionne

1. **Route spécifique** : `/api/upload` a sa propre route avec middleware dédié
2. **memRequestBodyBytes augmenté** : Permet à Traefik de bufferiser plus de données en mémoire avant de streamer
3. **Streaming activé** : Au-delà de 50 MB, Traefik stream directement vers le backend sans bloquer

## 🔄 Application des changements

Traefik recharge automatiquement les fichiers de configuration grâce à `watch: true` dans `traefik.yml`.

Si besoin de forcer le rechargement :

```powershell
# Trouver le conteneur Traefik
docker ps | Select-String traefik

# Redémarrer (remplacer CONTAINER_NAME)
docker restart CONTAINER_NAME
```

## 📊 Configuration complète

| Composant | Configuration | Valeur |
|-----------|----------------|--------|
| **Traefik maxRequestBodyBytes** | Route `/api/upload` | 500 MB |
| **Traefik memRequestBodyBytes** | Route `/api/upload` | 50 MB |
| **Nginx client_max_body_size** | Global | 500 MB |
| **Nginx proxy timeouts** | Route `/api/` | 30 minutes |
| **Hypercorn read-timeout** | Backend | 30 minutes |
| **Frontend axios timeout** | Upload | 30 minutes |

## 🧪 Test

Pour tester si la correction fonctionne :

1. Tenter un upload d'un fichier de ~244 MB
2. Vérifier les logs Traefik (s'il y a accès)
3. Vérifier que l'upload progresse au lieu de bloquer à 0%

## ⚠️ Notes importantes

- **Traefik doit recharger automatiquement** la configuration (watch: true)
- Si l'erreur 413 persiste, vérifier que Traefik utilise bien le bon fichier de configuration
- Il existe deux fichiers de config : `meeting-reports-api.yml` et `traefik-meeting-reports-api.yml`
- S'assurer que les deux sont cohérents ou supprimer celui qui n'est pas utilisé

## 🎯 Résultat attendu

L'erreur 413 ne devrait plus apparaître pour les fichiers jusqu'à 500 MB, et les uploads devraient progresser normalement.

