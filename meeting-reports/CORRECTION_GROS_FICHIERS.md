# Correction du problème avec les gros fichiers - Meeting Reports

## 🔍 Problème identifié

L'application meeting-reports ne fonctionnait plus pour les gros fichiers (fichiers > 16MB environ).

### Cause racine
1. **FastAPI/Starlette** : Limite par défaut de ~16MB pour la taille du body des requêtes
2. **Uvicorn** : Ne permet pas de configurer facilement la limite de taille de body
3. **Mémoire** : L'ancien code chargeait le fichier entier en mémoire avant de l'écrire sur disque

## ✅ Solutions appliquées

### 1. Remplacement d'Uvicorn par Hypercorn

**Fichier modifié :** `meeting-reports/backend/Dockerfile`

- Remplacement de `uvicorn` par `hypercorn` qui permet de configurer `max-incomplete-size`
- Configuration : `--max-incomplete-size 524288000` (500MB)

```dockerfile
CMD ["hypercorn", "main:app", "--bind", "0.0.0.0:8000", "--max-incomplete-size", "524288000", "--reload"]
```

### 2. Upload en streaming

**Fichier modifié :** `meeting-reports/backend/main.py`

- Utilisation de `aiofiles` pour écrire les fichiers en streaming (par chunks de 8KB)
- Évite de charger tout le fichier en mémoire
- Logs de progression toutes les 10MB pour les gros fichiers

**Avant :**
```python
content = await file.read()  # Charge tout en mémoire
with open(file_path, "wb") as buffer:
    buffer.write(content)
```

**Après :**
```python
async with aiofiles.open(file_path, "wb") as buffer:
    chunk_size = 8192
    while True:
        chunk = await file.read(chunk_size)
        if not chunk:
            break
        await buffer.write(chunk)
```

### 3. Middleware de validation

**Fichier modifié :** `meeting-reports/backend/main.py`

- Ajout d'un middleware pour valider la taille des fichiers avant traitement
- Limite configurée à 500MB

### 4. Configuration frontend

**Fichier modifié :** `meeting-reports/frontend/src/App.js`

- Augmentation des limites axios : `maxContentLength` et `maxBodyLength` à 500MB
- Timeout étendu à 10 minutes pour les gros fichiers
- Affichage de la progression de l'upload en temps réel

### 5. Dépendances ajoutées

**Fichier modifié :** `meeting-reports/backend/requirements.txt`

- `hypercorn==0.14.4` : Serveur ASGI avec support des gros fichiers
- `aiofiles==23.2.1` : Pour l'écriture asynchrone des fichiers

## 📋 Configuration actuelle

| Composant | Limite | Statut |
|-----------|--------|--------|
| **Nginx** | 500MB (client_max_body_size) | ✅ Configuré |
| **Traefik** | 500MB (maxRequestBodyBytes) | ✅ Configuré |
| **Hypercorn** | 500MB (max-incomplete-size) | ✅ Configuré |
| **FastAPI** | Streaming (sans limite mémoire) | ✅ Optimisé |
| **Frontend** | 500MB (timeout 10min) | ✅ Configuré |

## 🔄 Redémarrage requis

Pour appliquer les changements, exécutez :

```powershell
cd meeting-reports
.\restart-backend-for-large-files.ps1
```

Ou manuellement :

```bash
docker-compose down
docker-compose build backend
docker-compose up -d
```

## 🧪 Test

1. **Tester avec un fichier moyen** (10-50MB) pour valider le fonctionnement
2. **Tester avec un fichier volumineux** (100-300MB) pour vérifier les limites
3. **Vérifier les logs** pour voir la progression de l'upload

## 📊 Améliorations

- ✅ Support des fichiers jusqu'à 500MB
- ✅ Upload en streaming (économie mémoire)
- ✅ Progression de l'upload visible dans l'interface
- ✅ Timeouts adaptés pour les gros fichiers
- ✅ Logs de progression pour le debugging

## ⚠️ Notes importantes

1. **Traefik** : La configuration est déjà correcte dans `traefik/dynamic/traefik-meeting-reports-api.yml`
2. **Nginx** : La configuration est déjà correcte dans `meeting-reports/nginx/nginx.conf`
3. **Premier redémarrage** : Le backend peut prendre quelques secondes de plus au démarrage (chargement de hypercorn)
4. **Mémoire** : L'upload en streaming réduit significativement l'utilisation mémoire

## 🎯 Résultat attendu

Les utilisateurs peuvent maintenant uploader des fichiers audio jusqu'à 500MB sans erreur 413 (Request Entity Too Large).

