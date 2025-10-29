# Correction de l'erreur d'upload - Meeting Reports

## ✅ Problème identifié

Le backend meeting-reports utilisait des chemins relatifs (`../uploads` et `../reports`) qui causaient des problèmes dans Docker.

## 🔧 Solution appliquée

### Modification du fichier `backend/main.py`

Les chemins ont été modifiés de :
```python
UPLOAD_DIR = Path("../uploads")
REPORTS_DIR = Path("../reports")
```

Vers :
```python
UPLOAD_DIR = Path("/app/uploads")
REPORTS_DIR = Path("/app/reports")
UPLOAD_DIR.mkdir(exist_ok=True, parents=True)
REPORTS_DIR.mkdir(exist_ok=True, parents=True)
```

## ✅ Résultat

Le backend utilise maintenant des chemins absolus corrects dans le conteneur Docker :
- `/app/uploads` pour les fichiers uploadés
- `/app/reports` pour les rapports générés

## 🧪 Tests

### API de santé
```bash
curl http://localhost:8000/health
# Résultat : {"status":"healthy","whisper_loaded":true}
```

### Dossiers créés dans le conteneur
```bash
docker exec meeting-reports-backend-1 ls -la /app/
# On vérifie que les dossiers uploads et reports existent

docker exec meeting-reports-backend-1 ls -la /app/uploads/
# Vérification des fichiers uploadés existants
```

## 📝 Prochaines étapes

1. Tester l'upload de fichier via l'interface web
2. Vérifier que la transcription fonctionne correctement
3. Contrôler la génération de rapports

## 🌐 Accès

- Interface web : https://meeting-reports.iahome.fr
- API backend : http://localhost:8000
- Via Traefik : https://meeting-reports.iahome.fr/api

