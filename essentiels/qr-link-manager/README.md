# QR Link Manager

Application complète de gestion de QR codes et liens courts, similaire à Shlink ou Polr.

## 🚀 Démarrage Rapide

### Prérequis
- Docker et Docker Compose installés
- Ports 7000, 7001, 7002, 7080 disponibles

### Installation

1. **Cloner et naviguer vers le dossier** :
```bash
cd docker-services/qr-link-manager
```

2. **Créer le fichier d'environnement** :
```bash
cp env.example .env
```

3. **Démarrer l'application** :
```bash
# Sur Windows
.\start.ps1

# Sur Linux/Mac
./start.sh

# Ou manuellement
docker-compose up -d
```

## 📋 Services

- **Frontend** : http://localhost:7000 (React/Next.js)
- **Backend API** : http://localhost:7001 (Node.js/Express)
- **Redirector** : http://localhost:7002 (Service de redirection)
- **Nginx** : http://localhost:7080 (Reverse proxy)
- **PostgreSQL** : localhost:5432 (Base de données)
- **Redis** : localhost:6379 (Cache et sessions)

## 🛠️ Commandes Utiles

```bash
# Vérifier le statut
docker-compose ps

# Voir les logs
docker-compose logs -f backend

# Redémarrer un service
docker-compose restart backend

# Arrêter l'application
docker-compose down

# Reconstruire les images
docker-compose build --no-cache
```

## 📁 Structure du Projet

```
qr-link-manager/
├── backend/           # API Node.js/Express
├── frontend/          # Interface React/Next.js
├── redirector/        # Service de redirection
├── database/          # Scripts de base de données
├── nginx/             # Configuration Nginx
├── docker-compose.yml # Configuration Docker
├── env.example        # Variables d'environnement
├── start.sh           # Script de démarrage Linux/Mac
├── start.ps1          # Script de démarrage Windows
└── STATUS.md          # Statut actuel de l'application
```

## 🔧 Configuration

Modifiez le fichier `.env` pour personnaliser :
- Mots de passe de base de données
- Clés JWT
- URLs et ports
- Paramètres de sécurité

## 📊 Fonctionnalités

- ✅ Création de liens courts
- ✅ Génération de QR codes
- ✅ Authentification utilisateur
- ✅ Statistiques de clics
- ✅ Gestion des projets
- ✅ API publique
- ✅ Interface web moderne

## 🚧 Développement

L'application est prête pour le développement avec :
- Hot reload activé
- Rate limiting temporairement désactivé
- Logs détaillés
- Structure modulaire

## 📝 Notes

- Le rate limiting est temporairement désactivé pour le développement
- Les identifiants par défaut sont utilisés (à changer en production)
- Voir `STATUS.md` pour plus de détails sur l'état actuel
