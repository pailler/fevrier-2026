# Service Converter

Ce dossier contient la configuration Docker Compose pour le service Converter (convertisseur universel).

## Structure

```
converter/
├── docker-compose.yml      # Configuration Docker Compose
├── start-converter.ps1     # Script de démarrage (Windows)
├── start-converter.sh      # Script de démarrage (Linux/macOS)
├── stop-converter.ps1      # Script d'arrêt (Windows)
├── stop-converter.sh       # Script d'arrêt (Linux/macOS)
└── README.md              # Ce fichier
```

## Utilisation

### Démarrage du service

**Windows (PowerShell):**
```powershell
.\start-converter.ps1
```

**Linux/macOS:**
```bash
./start-converter.sh
```

**Manuel:**
```bash
docker-compose up -d --build
```

### Arrêt du service

**Windows (PowerShell):**
```powershell
.\stop-converter.ps1
```

**Linux/macOS:**
```bash
./stop-converter.sh
```

**Manuel:**
```bash
docker-compose down
```

### Vérification du statut

```bash
docker-compose ps
```

### Logs

```bash
docker-compose logs -f
```

## Configuration

- **Port local:** 8096
- **Port conteneur:** 8080
- **URL locale:** http://localhost:8096
- **URL production:** https://converter.iahome.fr

## Volumes

- `../universal-converter/uploads` → `/app/uploads`
- `../universal-converter/downloads` → `/app/downloads`
- `../universal-converter/logs` → `/app/logs`

## Réseau

Le service utilise le réseau `converter-network` avec le driver bridge.

## Traefik

Le service est configuré pour fonctionner avec Traefik pour le routage et la gestion SSL automatique.
