# 🎯 QR Code Generator - Dynamique avec Supabase

Un service complet de génération de QR codes dynamiques avec stockage Supabase, statistiques avancées et interface web moderne.

## 🚀 Fonctionnalités

### QR Codes Dynamiques
- **Création** : Génération de QR codes avec ID unique
- **Modification** : Changement de l'URL de destination sans régénérer le QR code
- **Redirection** : Système de redirection automatique avec comptage des scans
- **Persistance** : Stockage robuste avec Supabase

### Statistiques Avancées
- **Compteur de scans** : Suivi du nombre de scans par QR code
- **Détails des scans** : IP, User-Agent, Referer, horodatage
- **Historique** : Traçabilité des modifications d'URL
- **Interface de consultation** : Visualisation des statistiques en temps réel

### Interface Web
- **Interface moderne** : Design responsive et intuitif
- **Onglets multiples** : QR codes statiques, dynamiques, gestion et statistiques
- **Téléchargement** : Export des QR codes en PNG
- **API REST** : Interface programmatique complète

## 🗄️ Architecture Base de Données

### Tables Principales

#### `dynamic_qr_codes`
```sql
- id (SERIAL PRIMARY KEY)
- qr_id (VARCHAR(8) UNIQUE) - ID unique du QR code
- name (VARCHAR(255)) - Nom optionnel
- url (TEXT) - URL de destination
- qr_url (TEXT) - URL du QR code de redirection
- size (INTEGER) - Taille du QR code
- margin (INTEGER) - Marge du QR code
- error_correction (VARCHAR(1)) - Niveau de correction d'erreur
- scans (INTEGER) - Nombre de scans
- created_at (TIMESTAMP) - Date de création
- updated_at (TIMESTAMP) - Date de dernière modification
- last_scan (TIMESTAMP) - Date du dernier scan
```

#### `scan_statistics`
```sql
- id (SERIAL PRIMARY KEY)
- qr_id (VARCHAR(8)) - Référence vers le QR code
- ip_address (INET) - Adresse IP du scanner
- user_agent (TEXT) - User-Agent du navigateur
- referer (TEXT) - Page de référence
- scanned_at (TIMESTAMP) - Date et heure du scan
```

#### `qr_code_history`
```sql
- id (SERIAL PRIMARY KEY)
- qr_id (VARCHAR(8)) - Référence vers le QR code
- old_url (TEXT) - Ancienne URL
- new_url (TEXT) - Nouvelle URL
- changed_at (TIMESTAMP) - Date de modification
```

## 🛠️ Installation et Démarrage

### Prérequis
- Docker et Docker Compose
- Ports disponibles : 7006 (service), 5432 (PostgreSQL)

### Démarrage Rapide
```bash
# Cloner ou télécharger les fichiers
cd qr-code-service

# Démarrer les services
docker-compose up -d

# Vérifier le statut
docker-compose ps
```

### Accès
- **Interface Web** : http://localhost:7006
- **API REST** : http://localhost:7006/api
- **Base de données** : localhost:5432 (qrcode_db)

## 📡 API REST

### QR Codes Statiques
```bash
# Générer un QR code statique
GET /api/qr?text=https://example.com&size=300&margin=4&errorCorrection=M

# Générer via POST
POST /api/qr
Content-Type: application/json
{
  "text": "https://example.com",
  "size": 300,
  "margin": 4,
  "errorCorrection": "M"
}
```

### QR Codes Dynamiques

#### Créer un QR code dynamique
```bash
POST /api/dynamic/qr
Content-Type: application/json
{
  "url": "https://example.com",
  "name": "Mon QR Code",
  "size": 300,
  "margin": 4,
  "errorCorrection": "M"
}
```

#### Modifier un QR code dynamique
```bash
PUT /api/dynamic/qr/{qr_id}
Content-Type: application/json
{
  "url": "https://nouvelle-url.com",
  "name": "Nouveau nom"
}
```

#### Lister tous les QR codes
```bash
GET /api/dynamic/qr
```

#### Obtenir un QR code spécifique
```bash
GET /api/dynamic/qr/{qr_id}
```

#### Statistiques d'un QR code
```bash
GET /api/dynamic/qr/{qr_id}/stats
```

#### Redirection
```bash
GET /r/{qr_id}
# Redirige vers l'URL de destination et incrémente le compteur
```

## 🔧 Configuration

### Variables d'Environnement
```yaml
DATABASE_URL: postgresql://qrcode_user:qrcode_password@postgres:5432/qrcode_db
FLASK_ENV: production
```

### Structure des Fichiers
```
qr-code-service/
├── docker-compose.yml      # Configuration Docker
├── Dockerfile             # Image Docker du service
├── qr_service.py          # Application Flask
├── init.sql              # Script d'initialisation de la DB
├── README.md             # Documentation
├── qr-codes/             # Stockage des images (volume)
└── logs/                 # Logs (volume)
```

## 📊 Utilisation

### 1. Créer un QR Code Dynamique
1. Accéder à http://localhost:7006
2. Aller dans l'onglet "QR Code Dynamique"
3. Remplir le formulaire :
   - URL de destination
   - Nom (optionnel)
   - Paramètres de personnalisation
4. Cliquer sur "Créer QR Code Dynamique"

### 2. Modifier un QR Code
1. Aller dans l'onglet "Gérer les QR Codes"
2. Cliquer sur "Modifier l'URL" pour le QR code souhaité
3. Saisir la nouvelle URL de destination
4. Le QR code reste le même, seule la redirection change

### 3. Consulter les Statistiques
1. Aller dans l'onglet "Gérer les QR Codes"
2. Cliquer sur "Voir les statistiques" pour un QR code
3. Les statistiques s'affichent dans l'onglet "Statistiques"

## 🔍 Monitoring et Logs

### Health Check
```bash
curl http://localhost:7006/health
```

### Logs des Services
```bash
# Logs du service principal
docker-compose logs qr-code-service

# Logs de la base de données
docker-compose logs postgres

# Logs en temps réel
docker-compose logs -f
```

## 🛡️ Sécurité

### Bonnes Pratiques
- **Validation des URLs** : Vérification du format des URLs
- **Limitation des tailles** : Contraintes sur les paramètres
- **Logging** : Traçabilité des actions
- **Base de données** : Transactions et rollback en cas d'erreur

### Recommandations de Production
- Utiliser HTTPS en production
- Configurer un reverse proxy (Nginx)
- Mettre en place des sauvegardes de la base de données
- Monitorer les performances

## 🔄 Migration depuis l'Ancien Système

Si vous migrez depuis le système JSON :
1. Les données existantes dans `dynamic_qr_codes.json` ne sont pas automatiquement migrées
2. Les nouveaux QR codes seront stockés en base de données
3. L'ancien fichier JSON peut être supprimé

## 🚀 Développement

### Ajouter de Nouvelles Fonctionnalités
1. Modifier `qr_service.py` pour ajouter les endpoints
2. Mettre à jour le template HTML si nécessaire
3. Ajouter les tables de base de données dans `init.sql`
4. Tester avec `docker-compose build --no-cache`

### Debugging
```bash
# Mode debug
docker-compose down
docker-compose up  # (sans -d pour voir les logs)

# Accès à la base de données
docker-compose exec postgres psql -U qrcode_user -d qrcode_db
```

## 📈 Améliorations Futures

- [ ] Interface d'administration avancée
- [ ] Export des statistiques en CSV/Excel
- [ ] Graphiques de tendances
- [ ] Authentification utilisateur
- [ ] API rate limiting
- [ ] Support des QR codes avec logo
- [ ] Géolocalisation des scans
- [ ] Webhooks pour notifications

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commiter les changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
1. Vérifier les logs : `docker-compose logs`
2. Consulter la documentation API
3. Vérifier la connectivité de la base de données
4. Redémarrer les services : `docker-compose restart`

---

**Version** : 3.0.0  
**Base de données** : PostgreSQL 15  
**Framework** : Flask  
**Interface** : HTML/CSS/JavaScript vanilla
