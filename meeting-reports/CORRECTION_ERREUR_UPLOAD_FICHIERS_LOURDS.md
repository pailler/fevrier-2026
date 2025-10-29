# Correction erreur upload fichiers audio lourds - Meeting Reports

## ❌ Problème identifié

Les uploads de fichiers audio échouaient avec l'erreur **413 Request Entity Too Large** pour tous les types de fichiers audio.

### Symptômes observés dans les logs
```
[error] client intended to send too large body: 4582560 bytes
[error] client intended to send too large body: 34869343 bytes
[error] client intended to send too large body: 256282914 bytes
```

### Cause racine
La configuration Nginx avait une limite de taille par défaut trop faible pour les fichiers audio/vidéo. La directive `client_max_body_size` était définie localement dans le bloc `location /api/` mais pas au niveau global `http {}`.

## ✅ Solution appliquée

### Modification du fichier `nginx/nginx.conf`

Ajout de la directive `client_max_body_size` au niveau global :

```nginx
http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Taille max pour les uploads audio/vidéo (nécessaire pour fichiers volumineux)
    client_max_body_size 500M;

    # ... reste de la configuration
```

## 📝 Résultat

- Limite d'upload augmentée à **500 MB**
- Accepte maintenant tous les types de fichiers audio :
  - `.mp3`
  - `.wav`
  - `.m4a`
  - `.webm`
  - `.ogg`
  - etc.

## 🧪 Test

1. Upload d'un fichier audio volumineux via l'interface web
2. Vérification que l'upload passe sans erreur 413
3. Vérification de la transcription et génération du rapport

## 🔄 Actions effectuées

1. Modification de `meeting-reports/nginx/nginx.conf`
2. Redémarrage du conteneur frontend : `docker-compose restart frontend`

## 🌐 Accessibilité

- Interface web : https://meeting-reports.iahome.fr
- API backend : http://localhost:8000
- Frontend : http://localhost:3001
- Via Traefik : https://meeting-reports.iahome.fr/api

## 📊 Limites actuelles

- **Taille max d'upload** : 500 MB
- **Rate limiting API** : 10 requêtes/seconde
- **Rate limiting upload** : 2 requêtes/seconde
- **Timeouts** : 300 secondes pour les opérations longues

## ✅ Statut

- ✅ Configuration Nginx mise à jour
- ✅ Frontend redémarré
- ✅ Ready pour les uploads de fichiers lourds

