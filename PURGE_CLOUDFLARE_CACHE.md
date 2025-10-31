# 🗑️ Guide : Purge du Cache Cloudflare

## ✅ Réparation Cloudflare Effectuée

- ✅ Tunnel Cloudflare redémarré et actif
- ✅ Services accessibles (200 OK)
- ⚠️ Cache Cloudflare : Purge manuelle requise (pas de token API)

---

## 📋 Méthode 1 : Purge via Dashboard Cloudflare (Recommandé)

### Étape par étape :

1. **Connectez-vous à Cloudflare Dashboard**
   - URL: https://dash.cloudflare.com/
   - Connectez-vous avec votre compte

2. **Sélectionnez votre zone**
   - Cliquez sur **iahome.fr** dans la liste des zones

3. **Allez dans la section Cache**
   - Dans le menu de gauche, cliquez sur **Mise en cache** (ou **Caching**)
   - Puis cliquez sur **Configuration** (ou **Configuration**)

4. **Purgez le cache**
   
   **Option A : Purger tout le cache**
   - Cliquez sur le bouton **Purger tout** (ou **Purge Everything**)
   - Confirmez l'action
   - ✅ Tous les fichiers en cache seront supprimés
   
   **Option B : Purger par URL**
   - Cliquez sur **Purger par URL** (ou **Purge by URL**)
   - Entrez les URLs à purger :
     ```
     https://iahome.fr
     https://www.iahome.fr
     https://qrcodes.iahome.fr
     https://librespeed.iahome.fr
     https://whisper.iahome.fr
     https://meeting-reports.iahome.fr
     ```
   - Cliquez sur **Purger**

5. **Vérification**
   - Attendez quelques secondes
   - Le cache sera vidé dans les 30 secondes

---

## 📋 Méthode 2 : Purge via API (Automatique)

### Créer un Token API Cloudflare

1. **Accéder aux tokens API**
   - Connectez-vous à https://dash.cloudflare.com/
   - Cliquez sur votre profil (icône en haut à droite)
   - Cliquez sur **Mes profils API** (ou **My Profile** > **API Tokens**)

2. **Créer un nouveau token**
   - Cliquez sur **Créer un token** (ou **Create Token**)
   - Cliquez sur **Modèle personnalisé** (ou **Custom token**)

3. **Configurer les permissions**
   - **Nom du token** : `IAHome-Purge-Cache`
   - **Permissions** :
     - Zone > Zone Settings > Edit
     - Zone > Zone > Read (optionnel)
   - **Zones** : Sélectionnez uniquement `iahome.fr`
   - **Durée** : 1 an (ou selon vos besoins)

4. **Créer et copier le token**
   - Cliquez sur **Créer un token** (ou **Continue to summary**)
   - ⚠️ **IMPORTANT** : Copiez le token immédiatement (il ne sera plus visible après)
   - Le token ressemble à : `abc123def456ghi789jkl012mno345pqr678stu901vwx234yz`

5. **Ajouter le token dans la configuration**
   - Ouvrez le fichier `env.production.local`
   - Ajoutez la ligne :
     ```env
     CLOUDFLARE_API_TOKEN=votre_token_ici
     ```
   - Sauvegardez le fichier

6. **Utiliser le script automatique**
   ```powershell
   .\purge-cloudflare-cache-manual.ps1
   ```
   Ou utilisez le script complet :
   ```powershell
   .\repair-cloudflare-complete.ps1
   ```

---

## 📋 Méthode 3 : Purge via curl (Ligne de commande)

Si vous avez un token API :

```powershell
# 1. Définir les variables
$ZoneId = "votre_zone_id_ici"
$ApiToken = "votre_token_ici"

# 2. Purger tout le cache
$headers = @{
    "Authorization" = "Bearer $ApiToken"
    "Content-Type" = "application/json"
}

$body = @{
    purge_everything = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/purge_cache" -Method POST -Headers $headers -Body $body
```

---

## 📋 Vidage du Cache Navigateur

Pour vider le cache de votre navigateur local :

### Méthode 1 : Page dédiée
- Visitez : **https://iahome.fr/clear-cache.html**
- Cliquez sur le bouton de vidage de cache

### Méthode 2 : Raccourcis clavier
- **Chrome/Edge** : `Ctrl + Shift + Delete`
- **Firefox** : `Ctrl + Shift + Delete`
- **Safari** : `Cmd + Option + E`

### Méthode 3 : Rechargement forcé
- **Windows** : `Ctrl + F5` ou `Ctrl + Shift + R`
- **Mac** : `Cmd + Shift + R`

---

## 🔍 Vérification Après Purge

Après avoir vidé le cache :

1. **Test de connectivité**
   ```powershell
   .\diagnostic-cloudflare-complete.ps1
   ```

2. **Vérifier les headers de cache**
   - Ouvrez les DevTools (F12)
   - Onglet Network
   - Rechargez la page
   - Vérifiez le header `CF-Cache-Status` :
     - `MISS` = Pas en cache (première requête après purge)
     - `HIT` = En cache (cache reconstruit)
     - `DYNAMIC` = Contenu dynamique (non mis en cache)

---

## 📊 Statut Actuel

D'après la dernière vérification :

- ✅ **Tunnel Cloudflare** : Actif
- ✅ **Services** : Accessibles (200 OK)
- ✅ **Cache status** : DYNAMIC (contenu dynamique, pas de mise en cache statique)

---

## 💡 Notes Importantes

1. **Cache Cloudflare vs Cache Navigateur**
   - Le cache Cloudflare est sur les serveurs Cloudflare
   - Le cache navigateur est local sur votre machine
   - Il faut vider les deux pour un rafraîchissement complet

2. **Impact de la purge**
   - La purge prend quelques secondes à quelques minutes
   - Les premières requêtes après purge seront plus lentes (pas de cache)
   - Le cache sera reconstruit progressivement

3. **Quand purger le cache**
   - Après une mise à jour importante du site
   - Après des modifications de contenu qui ne se rafraîchissent pas
   - En cas de problèmes d'affichage ou d'erreurs 502/503

---

## ✅ Scripts Disponibles

- `repair-cloudflare-complete.ps1` : Réparation complète + purge (si token API)
- `purge-cloudflare-cache-manual.ps1` : Purge via API uniquement
- `repair-cloudflare.ps1` : Réparation tunnel uniquement

---

**Prochaine fois** : Pour purger automatiquement, ajoutez `CLOUDFLARE_API_TOKEN` dans `env.production.local` !

