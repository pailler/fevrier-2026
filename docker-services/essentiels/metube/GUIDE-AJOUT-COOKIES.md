# Guide : Comment ajouter des cookies YouTube dans MeTube

## Étape 1 : Exporter les cookies YouTube depuis votre navigateur

### Option A : Chrome ou Edge (Recommandé)

1. **Installer l'extension :**
   - Ouvrez Chrome/Edge
   - Allez sur le Chrome Web Store : https://chrome.google.com/webstore
   - Recherchez "Get cookies.txt LOCALLY" ou "cookies.txt"
   - Installez l'extension (par exemple : "Get cookies.txt LOCALLY" par kairi003)

2. **Exporter les cookies :**
   - Allez sur https://www.youtube.com
   - **Connectez-vous à votre compte YouTube** (important !)
   - Cliquez sur l'icône de l'extension dans la barre d'outils
   - Sélectionnez "Export" ou "Export cookies"
   - Choisissez le format "Netscape" ou "cookies.txt"
   - Sauvegardez le fichier `cookies.txt` sur votre ordinateur

### Option B : Firefox

1. **Installer l'extension :**
   - Ouvrez Firefox
   - Allez sur https://addons.mozilla.org
   - Recherchez "cookies.txt"
   - Installez l'extension "cookies.txt"

2. **Exporter les cookies :**
   - Allez sur https://www.youtube.com
   - **Connectez-vous à votre compte YouTube** (important !)
   - Cliquez sur l'icône de l'extension dans la barre d'outils
   - Cliquez sur "Export" pour `youtube.com`
   - Sauvegardez le fichier `cookies.txt` sur votre ordinateur

### Option C : Utiliser yt-dlp directement (Avancé)

Si vous avez yt-dlp installé localement, vous pouvez extraire les cookies :

```powershell
# Chrome (Windows)
yt-dlp --cookies-from-browser chrome --cookies cookies.txt https://www.youtube.com

# Firefox (Windows)
yt-dlp --cookies-from-browser firefox --cookies cookies.txt https://www.youtube.com
```

## Étape 2 : Ajouter les cookies dans MeTube

### Méthode 1 : Via l'interface MeTube (Recommandé)

1. **Accéder à l'interface MeTube :**
   - Ouvrez votre navigateur
   - Allez sur : `http://192.168.1.150:8081` ou `https://metube.iahome.fr`
   - Connectez-vous si nécessaire

2. **Accéder aux paramètres :**
   - Cherchez un bouton "Settings", "Configuration", "Paramètres" ou une icône d'engrenage ⚙️
   - Cliquez dessus pour ouvrir les paramètres

3. **Ajouter les cookies :**
   - Cherchez une section "Cookies", "yt-dlp Options", "Advanced Settings" ou "Configuration"
   - Il y a généralement :
     - Un champ de texte pour coller les cookies
     - OU un bouton "Upload" ou "Choose File" pour sélectionner le fichier `cookies.txt`
   
4. **Sauvegarder :**
   - Collez le contenu du fichier `cookies.txt` dans le champ
   - OU sélectionnez le fichier `cookies.txt` avec le bouton "Upload"
   - Cliquez sur "Save", "Apply" ou "Enregistrer"

### Méthode 2 : Via l'API MeTube (Avancé)

Si l'interface ne permet pas d'ajouter des cookies, vous pouvez utiliser l'API :

```powershell
# Lire le fichier cookies.txt
$cookies = Get-Content -Path "cookies.txt" -Raw

# Envoyer les cookies à l'API MeTube (si supporté)
# Note: Cette méthode dépend de l'API MeTube disponible
```

### Méthode 3 : Via un volume Docker (Avancé)

1. **Créer le dossier cookies :**
   ```powershell
   mkdir docker-services\essentiels\metube\cookies
   ```

2. **Copier le fichier cookies.txt :**
   ```powershell
   copy cookies.txt docker-services\essentiels\metube\cookies\cookies.txt
   ```

3. **Modifier le docker-compose.yml :**
   Ajoutez le volume dans la section volumes :
   ```yaml
   volumes:
     - ./downloads:/downloads
     - ./cookies:/config/cookies:ro
   ```

4. **Redémarrer le conteneur :**
   ```powershell
   cd docker-services\essentiels\metube
   docker compose down
   docker compose up -d
   ```

5. **Configurer dans MeTube :**
   - Dans l'interface MeTube, ajoutez l'option :
     ```
     --cookies /config/cookies/cookies.txt
     ```

## Étape 3 : Vérifier que les cookies fonctionnent

1. **Tester le téléchargement :**
   - Allez dans l'interface MeTube
   - Essayez de télécharger une vidéo YouTube
   - Si l'erreur 403 disparaît, les cookies fonctionnent !

2. **Vérifier les logs :**
   ```powershell
   docker logs metube-iahome --tail 50
   ```
   - Vous ne devriez plus voir l'erreur "HTTP Error 403: Forbidden"

## Dépannage

### Les cookies ne fonctionnent pas ?

1. **Vérifiez que vous êtes connecté à YouTube :**
   - Les cookies doivent être exportés pendant que vous êtes connecté à votre compte YouTube

2. **Vérifiez que les cookies sont à jour :**
   - Les cookies expirent après quelques jours/semaines
   - Réexportez-les si nécessaire

3. **Vérifiez le format du fichier :**
   - Le fichier `cookies.txt` doit être au format Netscape
   - Il doit commencer par `# Netscape HTTP Cookie File`

4. **Vérifiez les permissions :**
   - Assurez-vous que le fichier `cookies.txt` est lisible

### Où trouver les paramètres dans MeTube ?

L'interface MeTube peut varier selon la version. Cherchez :
- Un bouton "Settings" ou "⚙️" en haut à droite
- Un menu "Configuration" ou "Advanced"
- Une section "yt-dlp Options" ou "Download Options"
- Un champ "Cookies" ou "Cookie File"

## Notes importantes

- ⚠️ **Les cookies contiennent vos identifiants de session** - gardez-les privés
- 🔄 **Mettez à jour les cookies régulièrement** (tous les 7-14 jours)
- ✅ **Utilisez les cookies de votre propre compte** pour éviter les problèmes
- 🔒 **Ne partagez jamais vos cookies** avec d'autres personnes

## Exemple de fichier cookies.txt

Un fichier `cookies.txt` valide ressemble à ceci :

```
# Netscape HTTP Cookie File
# This file was generated by libcurl! Edit at your own risk.

.youtube.com	TRUE	/	FALSE	1735689600	VISITOR_INFO1_LIVE	...
.youtube.com	TRUE	/	FALSE	1735689600	YSC	...
.youtube.com	TRUE	/	FALSE	1735689600	PREF	...
```


