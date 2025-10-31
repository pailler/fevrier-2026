# 🔧 Fix : Erreur ChunkLoadError - Loading chunk failed

## Problème
```
Uncaught ChunkLoadError: Loading chunk 1446 failed.
(error: https://iahome.fr/_next/static/chunks/app/encours/page-e5db1cb3f0b2b8fe.js)
```

## Causes possibles
1. **Cache Cloudflare/CDN obsolète** - Le CDN sert une ancienne version des fichiers
2. **Build Next.js avec nouveau hash** - Le nouveau build a généré un nouveau hash de fichier
3. **Cache navigateur** - Le navigateur essaie de charger l'ancien fichier

## Solutions

### ✅ Solution 1 : Rebuild et purge cache (FAIT)
1. ✅ Dossier `.next` supprimé
2. ✅ Nouveau build créé
3. ⚠️ Cache Cloudflare doit être purgé

### Solution 2 : Purger le cache Cloudflare

#### Option A : Via le Dashboard Cloudflare (RECOMMANDÉ)
1. Connectez-vous à https://dash.cloudflare.com/
2. Sélectionnez votre zone: **iahome.fr**
3. Allez dans **Mise en cache** > **Configuration**
4. Cliquez sur **"Purger tout"** ou **"Purger par URL"**
5. Purger ces URLs spécifiques :
   - `https://iahome.fr/_next/static/chunks/app/encours/page-*.js`
   - `https://iahome.fr/_next/static/chunks/**/*.js`
   - `https://iahome.fr/encours`

#### Option B : Via l'API Cloudflare
Si vous avez configuré `CLOUDFLARE_API_TOKEN` dans `env.production.local` :
```powershell
.\purge-cloudflare-cache-manual.ps1
```

### Solution 3 : Vider le cache du navigateur
1. **Ouvrir les DevTools** (F12)
2. **Clic droit sur le bouton de rafraîchissement**
3. **Sélectionner "Vider le cache et forcer le rechargement"**
   - Ou utiliser **Ctrl+Shift+R** (Windows/Linux)
   - Ou utiliser **Cmd+Shift+R** (Mac)

### Solution 4 : Service Worker (si présent)
Si vous avez un Service Worker :
1. Ouvrir DevTools > Application > Service Workers
2. Cliquer sur **"Unregister"**
3. Recharger la page

### Solution 5 : Mode incognito
Tester en mode incognito pour vérifier si c'est un problème de cache :
- **Chrome/Edge** : Ctrl+Shift+N
- **Firefox** : Ctrl+Shift+P

## Vérification

### 1. Vérifier que le nouveau build est déployé
```powershell
# Vérifier que le serveur utilise le nouveau build
npm run start
# Visiter http://localhost:3000/encours
```

### 2. Vérifier les fichiers générés
```powershell
# Vérifier que le nouveau fichier existe
Get-ChildItem ".next\static\chunks\app\encours\" | Select-Object Name
```

### 3. Vérifier la console du navigateur
- Ouvrir la console (F12)
- Regarder les erreurs réseau dans l'onglet **Network**
- Vérifier si le fichier est chargé avec le bon hash

## Script de correction automatique

```powershell
# Script pour nettoyer et reconstruire
.\fix-chunkload-error.ps1
```

## Après correction

1. ✅ Le cache Cloudflare est purgé
2. ✅ Le navigateur est vidé
3. ✅ Le nouveau build est actif
4. ✅ La page `/encours` se charge correctement

---

**⚠️ IMPORTANT** : Après chaque nouveau build, purgez le cache Cloudflare pour éviter ce problème !

