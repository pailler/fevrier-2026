# Configuration MeTube pour contourner l'erreur 403 YouTube

## Problème
L'erreur `ERROR: unable to download video data: HTTP Error 403: Forbidden` indique que YouTube bloque les requêtes sans cookies de session valides.

## Solution 1 : Utiliser des cookies de navigateur (RECOMMANDÉ)

### Étape 1 : Exporter les cookies YouTube

**Chrome/Edge :**
1. Installez l'extension "Get cookies.txt LOCALLY" ou "cookies.txt"
2. Allez sur https://www.youtube.com
3. Cliquez sur l'extension
4. Exportez les cookies pour `youtube.com`
5. Sauvegardez le fichier `cookies.txt`

**Firefox :**
1. Installez l'extension "cookies.txt"
2. Allez sur https://www.youtube.com
3. Cliquez sur l'extension
4. Exportez les cookies pour `youtube.com`
5. Sauvegardez le fichier `cookies.txt`

### Étape 2 : Ajouter les cookies dans MeTube

1. Accédez à l'interface MeTube : `http://192.168.1.150:8081` ou `https://metube.iahome.fr`
2. Allez dans les paramètres/configuration
3. Cherchez la section "Cookies" ou "yt-dlp Options"
4. Ajoutez le fichier `cookies.txt` ou collez le contenu
5. Sauvegardez la configuration

## Solution 2 : Configurer les options yt-dlp dans MeTube

Dans l'interface MeTube, ajoutez ces options yt-dlp dans les paramètres :

```
--extractor-args "youtube:player_client=android,web"
--user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
--referer "https://www.youtube.com/"
--add-header "Accept-Language:en-US,en;q=0.9"
```

## Solution 3 : Mettre à jour yt-dlp dans le conteneur

Exécutez le script `fix-metube-403.ps1` :

```powershell
powershell -ExecutionPolicy Bypass -File fix-metube-403.ps1
```

## Solution 4 : Utiliser un fichier de configuration yt-dlp

1. Créez un fichier `cookies.txt` avec vos cookies YouTube
2. Placez-le dans le dossier `docker-services/essentiels/metube/cookies/`
3. Modifiez le `docker-compose.yml` pour monter le volume :

```yaml
volumes:
  - ./downloads:/downloads
  - ./cookies:/config/cookies:ro
```

4. Dans l'interface MeTube, ajoutez l'option :
   ```
   --cookies /config/cookies/cookies.txt
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

- **Les cookies sont la solution la plus efficace** pour contourner l'erreur 403
- Les cookies doivent être régulièrement mis à jour (tous les quelques jours/semaines)
- L'utilisation de cookies de votre propre compte YouTube est recommandée
- Assurez-vous que yt-dlp est toujours à jour pour supporter les dernières modifications de YouTube

## Dépannage

Si l'erreur 403 persiste après avoir ajouté les cookies :

1. Vérifiez que les cookies sont valides et à jour
2. Vérifiez que yt-dlp est à jour : `docker exec metube-iahome yt-dlp --version`
3. Vérifiez les logs pour plus de détails : `docker logs metube-iahome --tail 100`
4. Essayez de télécharger une autre vidéo YouTube pour vérifier si le problème est spécifique à une vidéo










