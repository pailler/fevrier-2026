# Commandes PuTTY pour déployer immo.regispailler.fr

## 🔌 Connexion au NAS

1. Ouvrir PuTTY
2. Entrer l'adresse IP : `192.168.1.130`
3. Port : `22` (SSH)
4. Se connecter avec votre utilisateur (par défaut : `admin`)

## 📋 Commandes à exécuter dans PuTTY

### Étape 1 : Vérifier la structure des fichiers

```bash
# Vérifier que les répertoires existent
ls -la /volume1/docker/immo/

# Vérifier que le docker-compose est présent
ls -la /volume1/docker/immo/docker-compose.real-estate.yml

# Vérifier que le fichier .env.production existe
ls -la /volume1/docker/immo/.env.production
```

### Étape 2 : Vérifier la configuration Traefik

```bash
# Vérifier que Traefik est en cours d'exécution
docker ps | grep traefik

# Note: La configuration Traefik peut être dans /volume1/docker/iahome/traefik/dynamic/
# ou dans un autre répertoire selon votre configuration
```

### Étape 3 : Vérifier le réseau Docker

```bash
# Vérifier que le réseau iahome-network existe
docker network ls | grep iahome-network

# Si le réseau n'existe pas, le créer
docker network create iahome-network
```

### Étape 4 : Arrêter l'ancien container (si existant)

```bash
cd /volume1/docker/immo
docker-compose -f docker-compose.real-estate.yml down
```

### Étape 5 : Construire l'image Docker

```bash
# Se placer dans le répertoire où se trouve le docker-compose
cd /volume1/docker/immo

# Construire l'image (cela peut prendre plusieurs minutes)
docker-compose -f docker-compose.real-estate.yml build --no-cache
```

**Note** : Si vous obtenez une erreur concernant le contexte de build, vérifiez que :
- Le dossier `/volume1/docker/immo/` contient bien tous les fichiers (Dockerfile, package.json, src/, public/, etc.)
- Le docker-compose pointe vers le bon contexte

### Étape 6 : Démarrer le container

```bash
# Démarrer le container en arrière-plan
docker-compose -f docker-compose.real-estate.yml up -d
```

### Étape 7 : Vérifier que le container tourne

```bash
# Vérifier le statut du container
docker ps | grep real-estate-app

# Vérifier les logs
docker-compose -f docker-compose.real-estate.yml logs -f
```

Appuyez sur `Ctrl+C` pour quitter les logs.

## 🔍 Commandes de vérification

### Vérifier les logs en temps réel

```bash
cd /volume1/docker/immo
docker-compose -f docker-compose.real-estate.yml logs -f real-estate-app
```

### Vérifier la santé du container

```bash
docker exec real-estate-app curl -f http://localhost:3001/ || echo "Container non accessible"
```

### Vérifier les variables d'environnement

```bash
docker exec real-estate-app env | grep -E "SUPABASE|OPENAI|PORT"
```

### Vérifier que Traefik route correctement

```bash
# Vérifier les routes Traefik
docker exec iahome-traefik cat /etc/traefik/dynamic/real-estate.yml
```

## 🔄 Commandes de maintenance

### Redémarrer le container

```bash
cd /volume1/docker/immo
docker-compose -f docker-compose.real-estate.yml restart
```

### Arrêter le container

```bash
cd /volume1/docker/immo
docker-compose -f docker-compose.real-estate.yml down
```

### Reconstruire et redémarrer

```bash
cd /volume1/docker/immo
docker-compose -f docker-compose.real-estate.yml down
docker-compose -f docker-compose.real-estate.yml build --no-cache
docker-compose -f docker-compose.real-estate.yml up -d
```

### Voir l'utilisation des ressources

```bash
docker stats real-estate-app
```

## 🐛 Dépannage

### Le container ne démarre pas

```bash
# Voir les erreurs détaillées
cd /volume1/docker/immo
docker-compose -f docker-compose.real-estate.yml logs real-estate-app

# Vérifier la configuration
docker-compose -f docker-compose.real-estate.yml config
```

### Erreur de build

```bash
# Vérifier que tous les fichiers sont présents
ls -la /volume1/docker/immo/

# Vérifier le Dockerfile
cat /volume1/docker/immo/Dockerfile

# Vérifier package.json
cat /volume1/docker/immo/package.json
```

### Erreur de connexion à la base de données

```bash
# Vérifier les variables d'environnement
cat /volume1/docker/immo/.env.production | grep SUPABASE

# Tester la connexion depuis le container
docker exec real-estate-app env | grep SUPABASE
```

## 📝 Script complet (copier-coller)

Voici toutes les commandes en une seule fois :

```bash
# 1. Vérifier les fichiers
cd /volume1/docker/immo
ls -la docker-compose.real-estate.yml
ls -la .env.production

# 2. Vérifier le réseau
docker network ls | grep iahome-network || docker network create iahome-network

# 3. Arrêter l'ancien container
docker-compose -f docker-compose.real-estate.yml down

# 4. Construire l'image
docker-compose -f docker-compose.real-estate.yml build --no-cache

# 5. Démarrer le container
docker-compose -f docker-compose.real-estate.yml up -d

# 6. Vérifier les logs
docker-compose -f docker-compose.real-estate.yml logs -f
```

## ✅ Vérification finale

Une fois le container démarré, vérifiez que :

1. Le container est en cours d'exécution :
```bash
docker ps | grep real-estate-app
```

2. L'application répond :
```bash
curl -I http://localhost:3001
```

3. Traefik route correctement (depuis un navigateur) :
   - Accéder à : https://immo.regispailler.fr
   - Vérifier que le certificat SSL est valide

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs : `docker-compose -f docker-compose.real-estate.yml logs -f`
2. Vérifiez que Traefik est en cours d'exécution : `docker ps | grep traefik`
3. Vérifiez le DNS : `nslookup immo.regispailler.fr`
