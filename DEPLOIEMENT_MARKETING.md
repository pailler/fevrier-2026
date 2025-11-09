# Guide de Déploiement - Pages Marketing IA Home

## 🚨 Problème Identifié

Les pages marketing (`/marketing` et `/avantages`) ont été créées mais n'apparaissent pas sur le site en production `iahome.fr`.

## ✅ Solutions Appliquées

### 1. Pages Ajoutées au Sitemap
Les pages `/marketing` et `/avantages` ont été ajoutées au sitemap pour le SEO.

### 2. Routes Exclues de la Route Dynamique
Les routes `marketing` et `avantages` ont été ajoutées à la liste des routes exclues dans `src/app/[slug]/page.tsx` pour éviter qu'elles soient interceptées par la route dynamique.

## 📋 Étapes de Déploiement

### Option 1 : Déploiement Automatique (si configuré)

Si vous avez un déploiement automatique (Vercel, Netlify, etc.) :
1. Les changements sont automatiquement détectés
2. Le build se lance automatiquement
3. Attendre la fin du déploiement

### Option 2 : Déploiement Manuel

#### Étape 1 : Build Local
```bash
cd C:\Users\AAA\Documents\iahome
npm run build
```

#### Étape 2 : Vérifier le Build
Vérifiez que les pages sont bien générées :
- `/.next/server/app/marketing/page.js` doit exister
- `/.next/server/app/avantages/page.js` doit exister

#### Étape 3 : Déployer
Suivez votre processus de déploiement habituel :
- Upload des fichiers
- Redémarrage du serveur
- Vérification des logs

### Option 3 : Redémarrage du Serveur de Développement

Si vous testez en local :
```bash
# Arrêter le serveur (Ctrl+C)
npm run dev
```

Puis visitez :
- `http://localhost:3000/marketing`
- `http://localhost:3000/avantages`

## 🔍 Vérification Post-Déploiement

### 1. Vérifier les Pages
Visitez directement :
- `https://iahome.fr/marketing`
- `https://iahome.fr/avantages`

### 2. Vérifier les Liens dans le Header
Le header doit contenir :
- Lien "Découvrir" → `/marketing`
- Bouton "Tarifs" → `/pricing`

### 3. Vérifier le Sitemap
- `https://iahome.fr/sitemap.xml` doit contenir `/marketing` et `/avantages`

### 4. Vérifier le Cache
Si les pages n'apparaissent toujours pas :
1. Vider le cache du navigateur (`Ctrl + Shift + R`)
2. Vider le cache Cloudflare (si utilisé)
3. Attendre quelques minutes pour la propagation DNS

## 🐛 Dépannage

### Problème : Pages retournent 404
**Solution** : Vérifier que les fichiers existent dans `src/app/marketing/page.tsx` et `src/app/avantages/page.tsx`

### Problème : Pages affichent du contenu vide
**Solution** : Vérifier les logs du serveur pour des erreurs de compilation

### Problème : Liens dans le header ne fonctionnent pas
**Solution** : Vérifier que `src/components/Header.tsx` contient les liens vers `/marketing`

### Problème : Cache persistant
**Solution** : 
1. Vider le cache Cloudflare (si utilisé)
2. Attendre 5-10 minutes
3. Tester en navigation privée

## 📝 Checklist de Déploiement

- [x] Pages créées (`/marketing` et `/avantages`)
- [x] Pages ajoutées au sitemap
- [x] Routes exclues de `[slug]`
- [x] Liens ajoutés dans le header
- [ ] Build local réussi
- [ ] Déploiement en production
- [ ] Pages accessibles sur `iahome.fr`
- [ ] Liens fonctionnels dans le header
- [ ] Sitemap mis à jour

## 🚀 Commandes Rapides

### Build et Test Local
```bash
npm run build
npm run start
```

### Développement
```bash
npm run dev
```

### Vérification des Fichiers
```powershell
Test-Path src\app\marketing\page.tsx
Test-Path src\app\avantages\page.tsx
```

## 📞 Support

Si les pages n'apparaissent toujours pas après le déploiement :
1. Vérifier les logs du serveur
2. Vérifier la configuration Next.js
3. Vérifier que le middleware n'intercepte pas ces routes
4. Vérifier les permissions de fichiers

---

**Date de création** : 2025
**Dernière mise à jour** : 2025

