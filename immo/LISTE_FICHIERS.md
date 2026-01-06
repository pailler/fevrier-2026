# 📋 Liste des fichiers dans le dossier immo/

## ✅ Fichiers présents (à copier sur le NAS)

### Fichiers de configuration Docker
- ✅ `docker-compose.real-estate.yml` - Configuration Docker Compose
- ✅ `Dockerfile` - Configuration de build Docker

### Fichiers de configuration Node.js/Next.js
- ✅ `package.json` - Dépendances Node.js
- ✅ `package-lock.json` - Verrouillage des versions
- ✅ `next.config.ts` - Configuration Next.js
- ✅ `tsconfig.json` - Configuration TypeScript
- ✅ `postcss.config.mjs` - Configuration PostCSS (si présent)

### Code source
- ✅ `src/` - Dossier complet du code source
  - `src/app/real-estate/` - Application immobilière
  - `src/app/api/real-estate/` - APIs immobilières
  - `src/components/real-estate/` - Composants immobiliers
  - `src/lib/real-estate/` - Bibliothèques immobilières
  - Et tous les autres fichiers nécessaires

### Fichiers statiques
- ✅ `public/` - Dossier complet des fichiers statiques

### Scripts
- ✅ `scripts/create-real-estate-tables.sql` - Script SQL pour créer les tables

### Documentation
- ✅ `README.md` - Documentation du déploiement
- ✅ `COPY_TO_NAS.md` - Instructions de copie
- ✅ `.gitignore` - Fichiers à ignorer

## ⚠️ Fichier à créer manuellement sur le NAS

- ⚠️ `.env.production` - **DOIT être créé sur le NAS** avec vos variables d'environnement

## 📦 Taille approximative

- `src/` : ~10-15 MB
- `public/` : ~5-10 MB
- Fichiers de configuration : ~100 KB
- **Total** : ~15-25 MB (sans node_modules)

## 🚀 Copie sur le NAS

Copiez simplement **tout le dossier `immo/`** vers `/volume1/docker/immo/` sur le NAS.

### Méthode recommandée

**WinSCP ou FileZilla** :
1. Se connecter au NAS (192.168.1.130)
2. Naviguer vers `/volume1/docker/`
3. Copier le dossier `immo/` complet

### Ou en ligne de commande

```bash
# Depuis le dossier iahome
scp -r immo admin@192.168.1.130:/volume1/docker/
```
