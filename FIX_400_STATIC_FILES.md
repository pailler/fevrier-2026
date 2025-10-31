# 🔧 Fix : Erreurs 400 pour les fichiers statiques Next.js

## Problème
Tous les fichiers statiques `_next/static/` retournent des erreurs **400 (Bad Request)** :
- CSS: `7e7d96b1e6991756.css`, `0d1c8c67e6f0c8ee.css`
- JavaScript: `webpack-8a9ecb3500ce5da8.js`, `1255-26f05d8bf86e016d.js`, etc.

## Cause identifiée
Le serveur Next.js tourne en mode **production** (`next start`) mais le dossier `.next` avec les fichiers statiques n'existait pas, car il avait été supprimé.

## Solution appliquée

### 1. ✅ Arrêt du serveur Next.js
Le serveur tournait sans les fichiers statiques nécessaires.

### 2. ✅ Reconstruction du projet
```powershell
npm run build
```
- Génère tous les fichiers statiques dans `.next/static/`
- Crée les chunks JavaScript et CSS nécessaires

### 3. ✅ Redémarrage du serveur en mode production
```powershell
npm start
```

## Vérification

### Test local
```powershell
# Tester un fichier statique
Invoke-WebRequest -Uri "http://localhost:3000/_next/static/chunks/webpack-8a9ecb3500ce5da8.js"
```

### Test via Cloudflare
1. Vérifier que le tunnel Cloudflare est actif
2. Visiter `https://iahome.fr/encours`
3. Vérifier dans la console du navigateur que les fichiers se chargent

## Problèmes résolus

- ✅ Erreur 400 sur les fichiers statiques CSS
- ✅ Erreur 400 sur les fichiers statiques JavaScript
- ✅ Erreur MIME type ('text/html' instead of JavaScript)
- ✅ Erreur ChunkLoadError

## Prévention

### Ne pas supprimer `.next` si le serveur tourne
Le dossier `.next` est nécessaire pour le mode production. Si vous devez le nettoyer :

1. **Arrêter le serveur** d'abord
2. **Supprimer `.next`**
3. **Rebuild** avec `npm run build`
4. **Redémarrer** avec `npm start`

### Script automatique
Utilisez `fix-chunkload-error.ps1` qui fait tout automatiquement :
```powershell
.\fix-chunkload-error.ps1
```

## Après correction

1. ✅ Le dossier `.next/static/` existe avec tous les fichiers
2. ✅ Le serveur Next.js tourne en mode production
3. ✅ Les fichiers statiques sont accessibles localement
4. ✅ Les fichiers statiques sont accessibles via Cloudflare

---

**⚠️ IMPORTANT** : Ne jamais supprimer `.next` pendant que le serveur tourne en mode production !

