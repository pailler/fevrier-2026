# IAHome - Plateforme IA Modulaire

![IAHome Logo](public/images/iahome-logo.png)

## 🚀 Description

IAHome est une plateforme SAAS moderne qui offre un accès direct à la puissance et aux outils d'intelligence artificielle. La plateforme propose une collection de modules IA prêts à l'emploi, créés par la communauté Bubble.

## ✨ Fonctionnalités

### 🎯 Interface Moderne
- Design SAAS professionnel avec interface "Bubble"
- Navigation intuitive et responsive
- Système de recherche avancé
- Filtres par catégorie, prix et niveau d'expérience

### 🔧 Modules IA Disponibles
- **Stable Diffusion** - Génération d'images IA
- **ChatGPT** - Assistant conversationnel
- **IAPhoto** - Édition d'images intelligente
- **IATube** - Outils vidéo IA
- **MeTube** - Téléchargement et conversion vidéo
- **Stirling-PDF** - Traitement de documents PDF
- **LibreSpeed** - Test de vitesse réseau
- **PSITransfer** - Partage de fichiers sécurisé
- **Polr** - Raccourcissement d'URL et QR Codes

### 💳 Système de Paiement
- Intégration Stripe complète
- Gestion des abonnements
- Paiements sécurisés
- Webhooks automatiques

### 🔐 Sécurité
- Authentification Supabase
- Magic links sécurisés
- Gestion des tokens d'accès
- Middleware de protection

## 🛠️ Architecture

### Stack Technique
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: API Routes Next.js
- **Base de données**: Supabase (PostgreSQL)
- **Authentification**: Supabase Auth
- **Paiements**: Stripe
- **Conteneurisation**: Docker & Docker Compose
- **Reverse Proxy**: Traefik

### Services Docker
- **IAHome App**: Application principale Next.js
- **Traefik**: Reverse proxy et load balancer
- **Stirling-PDF**: Service de traitement PDF
- **MeTube**: Service de téléchargement vidéo
- **LibreSpeed**: Service de test de vitesse
- **PSITransfer**: Service de partage de fichiers
- **Polr**: Service de raccourcissement d'URL
- **MySQL**: Base de données pour Polr

## 🚀 Installation et Déploiement

### Prérequis
- Docker et Docker Compose
- Node.js 20+
- Git

### Installation Locale

1. **Cloner le repository**
```bash
git clone https://github.com/votre-username/iahome.git
cd iahome
```

2. **Configuration des variables d'environnement**
```bash
cp env.example .env.local
# Éditer .env.local avec vos configurations
```

3. **Installation des dépendances**
```bash
npm install
```

4. **Démarrage en mode développement**
```bash
npm run dev
```

### Déploiement Production

1. **Configuration production**
```bash
cp env.production.example env.production
# Éditer env.production avec vos configurations
```

2. **Construction de l'image Docker**
```bash
docker build -t iahome:latest .
```

3. **Démarrage des services**
```bash
# Services principaux
docker-compose -f docker-compose.prod.yml up -d

# Services additionnels
docker-compose -f docker-services/docker-compose.services.yml up -d
```

## 📁 Structure du Projet

```
iahome/
├── src/
│   ├── app/                 # Pages et API Routes Next.js
│   ├── components/          # Composants React réutilisables
│   └── utils/              # Utilitaires et services
├── docker-services/        # Services Docker additionnels
├── scripts/               # Scripts de déploiement et maintenance
├── public/               # Assets statiques
├── traefik/              # Configuration Traefik
└── docs/                 # Documentation
```

## 🔧 Configuration

### Variables d'Environnement Principales

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret

# Application
NEXT_PUBLIC_APP_URL=https://iahome.fr
NODE_ENV=production
```

### Configuration Traefik

Le projet utilise Traefik comme reverse proxy avec :
- Gestion automatique des certificats SSL
- Load balancing
- Middleware de sécurité
- Redirection HTTP vers HTTPS

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests d'intégration
npm run test:integration

# Tests E2E
npm run test:e2e
```

## 📊 Monitoring

### Logs
```bash
# Logs de l'application
docker logs iahome-app

# Logs des services
docker-compose -f docker-services/docker-compose.services.yml logs
```

### Santé des Services
- Dashboard Traefik: http://localhost:8080
- Health checks automatiques configurés

## 🔄 Maintenance

### Mise à Jour
```bash
# Mise à jour des images Docker
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-services/docker-compose.services.yml pull

# Redémarrage des services
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-services/docker-compose.services.yml up -d
```

### Sauvegarde
```bash
# Sauvegarde de la base de données
./scripts/backup-database.sh

# Sauvegarde des données utilisateurs
./scripts/backup-user-data.sh
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

- **Email**: support@iahome.fr
- **Documentation**: [docs.iahome.fr](https://docs.iahome.fr)
- **Issues**: [GitHub Issues](https://github.com/votre-username/iahome/issues)

## 🏆 Statut du Projet

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue.svg)
![Next.js](https://img.shields.io/badge/next.js-15-black.svg)

---

**IAHome** - Accès direct à la puissance et aux outils IA 🚀