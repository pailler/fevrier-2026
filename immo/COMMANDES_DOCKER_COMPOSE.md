# 🐳 Commandes Docker Compose pour Synology

## 🔍 Vérifier quelle version est disponible

```bash
# Essayer Docker Compose V2 (plugin Docker)
docker compose version

# Si V2 n'est pas disponible, essayer V1
docker-compose --version
```

## 📋 Commandes avec Docker Compose V2 (recommandé)

Si `docker compose version` fonctionne, utilisez ces commandes :

```bash
cd /volume1/docker/immo

# Construire l'image
docker compose -f docker-compose.real-estate.yml build --no-cache

# Démarrer le container
docker compose -f docker-compose.real-estate.yml up -d

# Voir les logs
docker compose -f docker-compose.real-estate.yml logs -f

# Arrêter
docker compose -f docker-compose.real-estate.yml down

# Redémarrer
docker compose -f docker-compose.real-estate.yml restart
```

## 📋 Commandes avec Docker Compose V1

Si `docker-compose --version` fonctionne, utilisez ces commandes :

```bash
cd /volume1/docker/immo

# Construire l'image
docker-compose -f docker-compose.real-estate.yml build --no-cache

# Démarrer le container
docker-compose -f docker-compose.real-estate.yml up -d

# Voir les logs
docker-compose -f docker-compose.real-estate.yml logs -f

# Arrêter
docker-compose -f docker-compose.real-estate.yml down

# Redémarrer
docker-compose -f docker-compose.real-estate.yml restart
```

## 🔄 Script universel (fonctionne avec V1 et V2)

```bash
cd /volume1/docker/immo

# Fonction pour utiliser la bonne commande
if docker compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

# Utiliser la commande détectée
$DOCKER_COMPOSE -f docker-compose.real-estate.yml build --no-cache
$DOCKER_COMPOSE -f docker-compose.real-estate.yml up -d
$DOCKER_COMPOSE -f docker-compose.real-estate.yml logs -f
```

## ⚠️ Si Docker Compose n'est pas installé

Voir `INSTALL_DOCKER_COMPOSE_SYNOLOGY.md` pour les instructions d'installation.
