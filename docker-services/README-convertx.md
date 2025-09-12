# ConvertX et Gotenberg Services

Ce dossier contient la configuration Docker Compose pour les services ConvertX et Gotenberg.

## Services inclus

### ConvertX
- **Image**: `ghcr.io/c4illin/convertx:latest`
- **Port**: 9080 (mappé depuis 8080)
- **Description**: Service de conversion de fichiers
- **URL**: http://localhost:9080

### Gotenberg
- **Image**: `gotenberg/gotenberg:latest`
- **Port**: 9081 (mappé depuis 3000)
- **Description**: Service de conversion PDF
- **URL**: http://localhost:9081

## Utilisation

### Démarrage des services

**Windows (PowerShell):**
```powershell
.\start-convertx.ps1
```

**Linux/macOS (Bash):**
```bash
./start-convertx.sh
```

### Arrêt des services

**Windows (PowerShell):**
```powershell
.\stop-convertx.ps1
```

**Linux/macOS (Bash):**
```bash
./stop-convertx.sh
```

### Commandes Docker Compose manuelles

```bash
# Démarrer les services
docker-compose -f docker-compose.convertx.yml up -d

# Arrêter les services
docker-compose -f docker-compose.convertx.yml down

# Voir les logs
docker-compose -f docker-compose.convertx.yml logs -f

# Voir le statut
docker-compose -f docker-compose.convertx.yml ps
```

## Dossiers de données

- `./convertx_data/` : Données de ConvertX
- `./gotenberg_files/` : Fichiers temporaires de Gotenberg

## Configuration

Les services sont configurés avec :
- Redémarrage automatique (`restart: unless-stopped`)
- Variables d'environnement de production
- Volumes persistants pour les données

## Intégration avec IAHome

Ces services peuvent être intégrés avec l'application IAHome pour :
- Conversion de fichiers via l'API
- Génération de PDF
- Traitement de documents
