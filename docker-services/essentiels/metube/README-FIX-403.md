# Guide pour corriger l'erreur 403 YouTube dans MeTube

## Problème
L'erreur `ERROR: unable to download video data: HTTP Error 403: Forbidden` indique que YouTube bloque les requêtes sans cookies de session valides.

## Solutions

### Solution 1 : Utiliser des cookies de navigateur (Recommandé)

1. **Exporter les cookies depuis votre navigateur :**
   - Chrome/Edge : Utilisez l'extension "Get cookies.txt LOCALLY" ou "cookies.txt"
   - Firefox : Utilisez l'extension "cookies.txt"
   - Exportez les cookies pour `youtube.com`

2. **Ajouter les cookies dans MeTube :**
   - Connectez-vous à l'interface MeTube
   - Allez dans les paramètres/configuration
   - Ajoutez le fichier cookies.txt ou collez les cookies

### Solution 2 : Mettre à jour yt-dlp dans le conteneur

Exécutez le script `fix-metube-403.ps1` à la racine du projet :

```powershell
powershell -ExecutionPolicy Bypass -File fix-metube-403.ps1
```

### Solution 3 : Mettre à jour l'image Docker

```powershell
docker pull alexta69/metube:latest
cd docker-services\essentiels\metube
docker compose down
docker compose up -d
```

### Solution 4 : Utiliser les options yt-dlp via l'interface MeTube

Dans l'interface MeTube, vous pouvez configurer des options yt-dlp personnalisées :

```
--extractor-args "youtube:player_client=android,web"
--user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
--referer "https://www.youtube.com/"
```

## Vérification

1. Vérifiez que le conteneur est en cours d'exécution :
   ```powershell
   docker ps --filter name=metube-iahome
   ```

2. Vérifiez les logs :
   ```powershell
   docker logs metube-iahome --tail 50
   ```

3. Testez le téléchargement d'une vidéo YouTube depuis l'interface MeTube

## Notes importantes

- YouTube bloque de plus en plus les requêtes sans cookies valides
- Les cookies doivent être régulièrement mis à jour (tous les quelques jours/semaines)
- L'utilisation de cookies de votre propre compte YouTube est recommandée
- Assurez-vous que yt-dlp est toujours à jour pour supporter les dernières modifications de YouTube













