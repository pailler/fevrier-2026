# Solution définitive pour l'erreur 413

## 🔍 Diagnostic

L'erreur 413 "Request Entity Too Large" vient de **Traefik** qui est le premier reverse proxy avant d'atteindre le backend.

### Configuration actuelle

1. **Client** → **Traefik** (port 443) → **Nginx** (port 3050) → **Backend** (port 8000)

### Problème identifié

Traefik a une limite par défaut de **body request** qui n'a pas été correctement configurée.

## ✅ Solutions proposées

### Solution 1 : Contourner Traefik pour les gros fichiers

Utiliser directement Nginx sur `localhost:3050` au lieu de passer par Traefik.

**Avantage** : Configuration déjà testée et fonctionnelle

### Solution 2 : Configurer Traefik avec buffering

Ajouter dans `traefik/dynamic/traefik-meeting-reports-api.yml` :

```yaml
middlewares:
  meeting-reports-upload-limit:
    buffering:
      maxRequestBodyBytes: 524288000  # 500 MB
```

⚠️ **Note** : Cette solution a déjà été tentée mais Traefik semble avoir du cache.

### Solution 3 : Créer un endpoint direct backend

Contourner complètement Traefik pour l'upload :

1. Backend accessible directement sur `http://votre-serveur:8000`
2. Frontend appelle directement le backend (pas via Traefik)
3. Utiliser un domaine différent ou un sous-domaine direct

### Solution 4 : Augmenter la limite au niveau Traefik global

Modifier `traefik/traefik.yml` :

```yaml
entryPoints:
  websecure:
    address: ":443"
    http:
      middleware:
        upload-limit:
          buffering:
            maxRequestBodyBytes: 524288000
```

## 🎯 Recommandation immédiate

**Utiliser l'URL directe du backend en développement** :

Au lieu de : `https://meeting-reports.iahome.fr`
Utiliser : `http://localhost:8000` (en développement)

Ou via Nginx : `http://localhost:3050`

## 📊 Test avec fichiers de différentes tailles

- **< 500 KB** : ✅ Fonctionne parfaitement
- **500 KB - 1 MB** : ⚠️ Fonctionne parfois
- **> 1 MB** : ❌ Erreur 413 dans la plupart des cas

## 🔧 Actions à effectuer

1. Modifier temporairement le frontend pour utiliser l'URL directe du backend
2. Ou configurer un sous-domaine direct vers le backend
3. Ou contourner Traefik complètement pour l'upload

## ⚠️ Note importante

L'erreur 413 ne vient **PAS** du backend (qui fonctionne pour les fichiers < 1MB).

Le problème est au niveau de **Traefik** qui bloque les requêtes avant qu'elles n'atteignent le backend.

