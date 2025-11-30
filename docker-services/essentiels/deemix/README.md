# Deemix - Configuration Docker

Configuration Docker pour Deemix, un client de téléchargement de musique depuis Deezer.

## Installation

### Prérequis

- Docker et Docker Compose installés
- Réseau Docker `iahome-network` créé (ou création automatique via le script)

### Démarrage rapide

```powershell
# Démarrer Deemix
.\start-deemix.ps1

# Arrêter Deemix
.\stop-deemix.ps1

# Redémarrer Deemix
.\restart-deemix.ps1
```

### Démarrage manuel

```powershell
cd docker-services\essentiels\deemix
docker-compose up -d
```

## Configuration

### Permissions

Le problème de permissions `EACCES: permission denied` peut être résolu en :

1. **Vérifiant les PUID/PGID** dans `docker-compose.yml` (actuellement 1000/1000)
2. **Ajustant les permissions** du répertoire de téléchargement sur votre NAS
3. **Utilisant un chemin local** au lieu du NAS si nécessaire

Voir `CONFIGURATION-PERMISSIONS.md` pour plus de détails.

### Répertoire de téléchargement

Par défaut, le répertoire de téléchargement est monté depuis `/volume1/downloads` (NAS Synology).

Pour utiliser un chemin local, modifiez `docker-compose.yml` :

```yaml
volumes:
  - ./downloads:/downloads
```

### Accès web

Une fois démarré, Deemix est accessible sur : **http://localhost:6595**

## Vérification

### Vérifier le statut

```powershell
docker ps --filter name=deemix-iahome
```

### Vérifier les logs

```powershell
docker logs deemix-iahome --tail 50
```

### Tester les permissions

```powershell
docker exec deemix-iahome mkdir -p /downloads/test-permissions
```

## Dépannage

### Problème de permissions

Consultez `CONFIGURATION-PERMISSIONS.md` pour des solutions détaillées.

### Le conteneur ne démarre pas

1. Vérifiez que Docker est en cours d'exécution
2. Vérifiez que le réseau `iahome-network` existe
3. Consultez les logs : `docker logs deemix-iahome`

### Le répertoire n'est pas accessible

1. Vérifiez que le chemin monté existe
2. Vérifiez les permissions du répertoire
3. Si vous utilisez un partage réseau, vérifiez les credentials dans Docker Desktop

## Structure des fichiers

```
deemix/
├── docker-compose.yml              # Configuration Docker
├── config/                          # Configuration deemix (créé automatiquement)
├── downloads/                       # Téléchargements (si chemin local)
├── start-deemix.ps1                # Script de démarrage
├── stop-deemix.ps1                 # Script d'arrêt
├── restart-deemix.ps1              # Script de redémarrage
├── CONFIGURATION-PERMISSIONS.md    # Guide de résolution des permissions
└── README.md                        # Ce fichier
```

## Notes

- ⚠️ **PUID/PGID** : Ajustez ces valeurs selon votre configuration NAS
- ✅ **Volume mount** : Le chemin doit exister et être accessible
- 🔒 **Permissions** : L'utilisateur doit avoir les droits d'écriture
- 📁 **Configuration** : Les paramètres sont sauvegardés dans `./config`









