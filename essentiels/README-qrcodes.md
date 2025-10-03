# Service QR Codes - Essentiels

Ce service permet de générer et gérer des codes QR de manière sécurisée.

## 🚀 Démarrage rapide

### Démarrage individuel
```powershell
# Démarrer le service QR Codes uniquement
.\start-qrcodes.ps1

# Arrêter le service QR Codes
.\stop-qrcodes.ps1
```

### Démarrage avec tous les services essentiels
```powershell
# Démarrer tous les services essentiels (incluant QR Codes)
.\start-essentiels-services.ps1

# Arrêter tous les services essentiels
.\stop-essentiels-services.ps1
```

## 🌐 Accès

- **Service QR Codes** : http://localhost:7005
- **Base de données PostgreSQL** : localhost:5433

## 📁 Structure

```
essentiels/qrcodes/
├── docker-compose.yml          # Configuration Docker
├── Dockerfile                  # Image Docker
├── qr_service.py              # Service principal Flask
├── decode_token.py            # Décodeur de tokens
├── init.sql                   # Script d'initialisation DB
├── template.html              # Template HTML
├── qr-codes/                  # Dossier des QR codes générés
└── logs/                      # Logs du service
```

## 🔧 Configuration

### Variables d'environnement
- `FLASK_ENV=production`
- `DATABASE_URL=postgresql://qrcode_user:qrcode_password@qrcodes-postgres:5432/qrcode_db`
- `IAHOME_JWT_SECRET=qr-code-secret-key-change-in-production`
- `IAHOME_API_URL=http://localhost:3000`

### Ports
- **Service** : 7005
- **PostgreSQL** : 5433 (externe) / 5432 (interne)

## 📊 Base de données

Le service utilise PostgreSQL avec les tables :
- `qr_codes` : Stockage des codes QR générés
- `tokens` : Gestion des tokens d'accès

## 🔒 Sécurité

- Authentification JWT intégrée
- Tokens d'accès sécurisés
- Base de données isolée

## 📝 Logs

Les logs sont disponibles dans le dossier `logs/` et via Docker :
```bash
docker logs qrcodes
docker logs qrcodes-postgres
```

## 🛠️ Maintenance

### Vérifier le statut
```bash
cd qrcodes
docker-compose ps
```

### Redémarrer le service
```bash
cd qrcodes
docker-compose restart
```

### Nettoyer les données
```bash
cd qrcodes
docker-compose down -v
```









