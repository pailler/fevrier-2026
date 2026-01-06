# 📦 Dossier de déploiement pour immo.regispailler.fr

Ce dossier contient tous les fichiers nécessaires pour déployer l'application de recherche immobilière sur le NAS.

## 🚀 Déploiement rapide

### Copier tout le dossier sur le NAS

```bash
# Depuis votre machine locale (dans le dossier iahome)
scp -r immo admin@192.168.1.130:/volume1/docker/
```

Ou avec WinSCP/FileZilla, copiez simplement le dossier `immo/` vers `/volume1/docker/immo/` sur le NAS.

### Sur le NAS (via PuTTY)

```bash
cd /volume1/docker/immo
docker-compose -f docker-compose.real-estate.yml build --no-cache
docker-compose -f docker-compose.real-estate.yml up -d
```

## 📋 Contenu du dossier

- `docker-compose.real-estate.yml` - Configuration Docker
- `Dockerfile` - Configuration de build
- `package.json` - Dépendances Node.js
- `package-lock.json` - Verrouillage des versions
- `next.config.ts` - Configuration Next.js
- `tsconfig.json` - Configuration TypeScript
- `postcss.config.mjs` - Configuration PostCSS
- `src/` - Code source de l'application
- `public/` - Fichiers statiques
- `scripts/` - Scripts SQL
- `.env.production` - **À créer sur le NAS** avec vos variables d'environnement

## ⚠️ Important

Le fichier `.env.production` doit être créé **manuellement** sur le NAS dans ce dossier avec vos variables d'environnement.

Voir `docs/FICHIERS_A_COPIER_NAS.md` pour plus de détails.
