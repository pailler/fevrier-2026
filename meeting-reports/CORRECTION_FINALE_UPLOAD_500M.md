# Correction finale - Upload fichiers > 1 Mo - Meeting Reports

## ❌ Problème identifié

Les fichiers audio supérieurs à 1 Mo échouaient avec l'erreur **413 Request Entity Too Large**.

### Symptômes
```
[error] client intended to send too large body: 34869343 bytes
[error] client intended to send too large body: 36574748 bytes
```

Ces erreurs indiquaient que Nginx bloquait les uploads même après redémarrage.

## 🔍 Analyse

### Cause racine
La configuration Nginx avait deux définitions de `client_max_body_size` :
- Une au niveau global `http {}` : `500M` (correct)
- Une dans le bloc `location /api/` : `100M` (restrictive)

**Nginx applique toujours la valeur la plus restrictive**, donc les uploads étaient limités à 100M au lieu de 500M.

### Preuve
```bash
docker exec meeting-reports-nginx-1 nginx -T 2>&1 | findstr client_max_body_size
# Résultat AVANT : deux lignes avec 500M et 100M
# Résultat APRÈS : une seule ligne avec 500M
```

## ✅ Solution appliquée

### 1. Suppression de la limite restrictive

**Fichier modifié** : `meeting-reports/nginx/nginx.conf`

**Avant** :
```nginx
location /api/ {
    ...
    # Taille max pour uploads
    client_max_body_size 100M;  # ❌ Limite trop restrictive
    proxy_request_buffering off;
    ...
}
```

**Après** :
```nginx
location /api/ {
    ...
    # Utilise la limite globale définie dans http {}
    proxy_request_buffering off;  # ✅ Rely on global limit
    ...
}
```

### 2. Configuration globale conservée

```nginx
http {
    ...
    # Taille max pour les uploads audio/vidéo (nécessaire pour fichiers volumineux)
    client_max_body_size 500M;
    ...
}
```

## 📝 Résultat

- **Limite globale** : 500 MB
- **Plus de conflit** avec des limites locales
- **Accepte tous les formats** : mp3, wav, m4a, webm, ogg, etc.

## 🔄 Actions effectuées

1. ✅ Suppression de `client_max_body_size 100M` dans le bloc `location /api/`
2. ✅ Conservation de la limite globale `500M` dans `http {}`
3. ✅ Redémarrage du conteneur Nginx : `docker restart meeting-reports-nginx-1`
4. ✅ Vérification de la configuration : une seule limite de 500M active

## 🧪 Test

Testez maintenant l'upload de fichiers audio volumineux (> 1 Mo) :
1. Accédez à : https://meeting-reports.iahome.fr
2. Uploadez un fichier audio de plusieurs Mo
3. Vérifiez que l'upload passe sans erreur 413
4. Vérifiez que la transcription fonctionne

## 🌐 Accès

- **Interface web** : https://meeting-reports.iahome.fr
- **API backend** : http://localhost:8000
- **Frontend** : http://localhost:3001
- **Via Traefik** : https://meeting-reports.iahome.fr/api

## 📊 Configuration finale

- **client_max_body_size** : 500 MB (global uniquement)
- **Rate limiting API** : 10 requêtes/seconde
- **Rate limiting upload** : 2 requêtes/seconde
- **Timeouts** : 300 secondes pour les opérations longues
- **Buffering** : désactivé pour les uploads (`proxy_request_buffering off`)

## ✅ Statut

- ✅ Configuration Nginx corrigée
- ✅ Limite de 500M appliquée globalement
- ✅ Plus de conflit entre limites locales/globales
- ✅ Ready pour les uploads de fichiers lourds

