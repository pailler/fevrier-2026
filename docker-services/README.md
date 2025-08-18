# Services Docker IAHome

Ce dossier contient les services Docker complémentaires à l'application principale IAHome.

## Services Disponibles

### 1. Stirling-PDF
- **Port** : 8081
- **Domaine** : pdf.regispailler.fr
- **Description** : Service de manipulation de PDF (conversion, fusion, etc.)
- **Accès** : Interface web complète

### 2. MeTube
- **Port** : 8082
- **Domaine** : metube.regispailler.fr
- **Description** : Téléchargement de vidéos YouTube
- **Accès** : Interface web simple

### 3. LibreSpeed
- **Port** : 8083
- **Domaine** : librespeed.regispailler.fr
- **Description** : Test de vitesse de connexion
- **Accès** : Interface web de test

### 4. PSITransfer
- **Port** : 8084
- **Domaine** : psitransfer.regispailler.fr
- **Description** : Transfert de fichiers sécurisé
- **Accès** : Interface web de transfert

### 5. Portainer
- **Port** : 8085 (HTTP), 9443 (HTTPS)
- **Domaine** : portainer.iahome.fr
- **Description** : Interface de gestion Docker
- **Accès** : Interface d'administration Docker

### 6. Polr (Raccourcissement d'URL)
- **Port** : 8086
- **Domaine** : qrcode.regispailler.fr
- **Description** : Service de raccourcissement d'URL avec génération de QR codes
- **Accès** : Interface web publique et admin
- **Admin** : admin / admin123

## Démarrage des Services

```bash
# Démarrer tous les services
docker-compose -f docker-services/docker-compose.services.yml up -d

# Démarrer un service spécifique
docker-compose -f docker-services/docker-compose.services.yml up -d stirling-pdf

# Arrêter tous les services
docker-compose -f docker-services/docker-compose.services.yml down

# Voir les logs d'un service
docker-compose -f docker-services/docker-compose.services.yml logs -f polr
```

## Structure des Données

Les données persistantes sont stockées dans les dossiers suivants :
- `pdf-data/` : Données OCR pour Stirling-PDF
- `pdf-uploads/` : Fichiers uploadés pour Stirling-PDF
- `pdf-temp/` : Fichiers temporaires Stirling-PDF
- `metube-downloads/` : Vidéos téléchargées par MeTube
- `psitransfer-data/` : Données PSITransfer
- `portainer-data/` : Configuration Portainer
- `polr-data/` : Configuration Polr
- `polr-db-data/` : Base de données MySQL pour Polr

## Configuration Reverse Proxy

Tous les services sont configurés pour fonctionner avec Traefik. Les domaines sont automatiquement configurés pour HTTPS.

## Maintenance

### Mise à jour des images
```bash
docker-compose -f docker-services/docker-compose.services.yml pull
docker-compose -f docker-services/docker-compose.services.yml up -d
```

### Sauvegarde des données
```bash
# Créer une archive des données
tar -czf backup-services-$(date +%Y%m%d).tar.gz pdf-data/ pdf-uploads/ metube-downloads/ psitransfer-data/ portainer-data/ polr-data/ polr-db-data/
```

### Nettoyage
```bash
# Supprimer les conteneurs orphelins
docker-compose -f docker-services/docker-compose.services.yml down --remove-orphans

# Nettoyer les images non utilisées
docker image prune -f
```
