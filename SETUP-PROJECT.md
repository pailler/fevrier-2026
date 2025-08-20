# 🚀 Configuration du Projet IAHome

## 📦 Installation des dépendances

Après avoir cloné le projet, exécutez les commandes suivantes :

```bash
# Installer les dépendances Node.js
npm install

# Construire le projet Next.js
npm run build
```

## 🐳 Configuration Docker

```bash
# Construire l'image Docker
docker build -t iahome:latest .

# Démarrer les services
docker-compose -f docker-compose.prod.yml up -d
```

## 📁 Dossiers supprimés pour optimiser la taille

Les dossiers suivants ont été supprimés car ils peuvent être régénérés :

- `node_modules/` (391 MB) - Dépendances npm
- `.next/` (271 MB) - Build Next.js
- `docker-services/pdf-temp/` - Fichiers temporaires PDF
- `docker-services/polr-db-data/` - Données de base de données
- `docker-services/portainer-data/` - Données Portainer
- `docker-services/psitransfer-data/` - Données PsiTransfer
- `docker-services/metube-downloads/` - Téléchargements MeTube
- `logs/` - Fichiers de logs
- `.cursor/` - Configuration IDE

## 📊 Taille du projet

- **Avant nettoyage** : ~873 MB
- **Après nettoyage** : ~2.17 MB
- **Réduction** : 99.75%

## 🔧 Variables d'environnement

Assurez-vous d'avoir les fichiers suivants :
- `env.production.local` - Variables de production
- `.env.local` - Variables locales

## 🌐 Accès

- **Site principal** : https://iahome.fr
- **Applications** : 
  - PsiTransfer : https://psitransfer.regispailler.fr
  - MeTube : https://metube.regispailler.fr
  - PDF+ : https://pdf.regispailler.fr
