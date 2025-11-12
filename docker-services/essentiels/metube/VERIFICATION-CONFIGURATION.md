# Vérification de la configuration MeTube

## État actuel

### Conteneur actif
- **Nom** : `metube-iahome`
- **Image** : `alexta69/metube:latest`
- **Emplacement** : `docker-services/essentiels/metube/`
- **Port** : Aucun port exposé (accès via réseau Docker uniquement)
- **Statut** : ✅ En cours d'exécution et sain

### Configuration
- **Fichier docker-compose** : `docker-services/essentiels/metube/docker-compose.yml`
- **Réseau** : `iahome-network` (externe)
- **Volumes** :
  - `./downloads:/downloads` - Fichiers téléchargés
  - `./cleanup-metube-auto.sh:/usr/local/bin/cleanup-metube.sh:ro` - Script de nettoyage

## Nettoyage effectué

### Conteneur supprimé
- **Ancien conteneur** : `metube` (dans le dossier `essentiels`)
- **Action** : ✅ Arrêté et supprimé
- **Raison** : Doublon avec le conteneur dans `docker-services/essentiels/metube`

## Vérification

### Vérifier le conteneur
```powershell
docker ps --filter name=metube-iahome
```

### Vérifier les logs
```powershell
docker logs metube-iahome --tail 50
```

### Vérifier la configuration
```powershell
docker inspect metube-iahome
```

## Configuration recommandée

### Accès à MeTube
- **Interne** : `http://metube-iahome:8081` (via réseau Docker)
- **Externe** : Via proxy/API IAHome (pas d'accès direct)

### Nettoyage automatique
- ✅ Activé après chaque action via l'API
- ✅ Script de nettoyage monté dans le conteneur
- ✅ API de nettoyage disponible : `/api/metube-cleanup`

## Notes importantes

- ⚠️ **Aucun port n'est exposé** - MeTube est accessible uniquement via le réseau Docker
- ✅ **Un seul conteneur** - Le conteneur dans `essentiels` a été supprimé
- ✅ **Configuration propre** - Tout est dans `docker-services/essentiels/metube/`
- 🔒 **Sécurité** - Accès contrôlé via l'API IAHome uniquement







