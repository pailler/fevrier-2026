# Déploiement de l'Application de Recherche Immobilière

## 🚀 Déploiement sur le NAS (192.168.1.130)

### Prérequis

1. **Accès SSH au NAS**
   - SSH doit être activé sur le NAS
   - Clés SSH configurées ou mot de passe disponible
   - Utilisateur avec droits Docker (par défaut: `admin`)

2. **Docker et Docker Compose**
   - Docker installé sur le NAS
   - Docker Compose disponible

3. **Traefik**
   - Traefik doit être déjà configuré et en cours d'exécution
   - Le réseau `iahome-network` doit exister

4. **DNS**
   - Le sous-domaine `immo.regispailler.fr` doit pointer vers l'IP du NAS (192.168.1.130)
   - Ou configuré via Cloudflare/autre DNS

### Méthode 1 : Déploiement Automatique (Linux/Mac)

```bash
# Rendre le script exécutable
chmod +x deploy-real-estate.sh

# Définir les variables d'environnement si nécessaire
export NAS_USER=admin
export NAS_PATH=/volume1/docker/iahome

# Lancer le déploiement
./deploy-real-estate.sh
```

### Méthode 2 : Déploiement Automatique (Windows PowerShell)

```powershell
# Lancer le script PowerShell
.\deploy-real-estate.ps1 -NasUser admin -NasPath "/volume1/docker/iahome"
```

### Méthode 3 : Déploiement Manuel

#### Étape 1 : Préparer le NAS

```bash
# Se connecter au NAS
ssh admin@192.168.1.130

# Créer les répertoires nécessaires
mkdir -p /volume1/docker/iahome/traefik/dynamic
mkdir -p /volume1/docker/immo
```

#### Étape 2 : Copier les fichiers

Depuis votre machine locale :

```bash
# Copier docker-compose
scp docker-compose.real-estate.yml admin@192.168.1.130:/volume1/docker/iahome/

# Copier la configuration Traefik
scp traefik/dynamic/real-estate.yml admin@192.168.1.130:/volume1/docker/iahome/traefik/dynamic/

# Copier les fichiers de l'application
scp -r src admin@192.168.1.130:/volume1/docker/immo/
scp -r public admin@192.168.1.130:/volume1/docker/immo/
scp package.json package-lock.json next.config.ts tsconfig.json Dockerfile admin@192.168.1.130:/volume1/docker/immo/
```

#### Étape 3 : Construire et démarrer

Sur le NAS :

```bash
cd /volume1/docker/iahome

# Arrêter l'ancien container si existant
docker-compose -f docker-compose.real-estate.yml down

# Construire l'image
docker-compose -f docker-compose.real-estate.yml build --no-cache

# Démarrer le container
docker-compose -f docker-compose.real-estate.yml up -d

# Vérifier les logs
docker-compose -f docker-compose.real-estate.yml logs -f
```

## 🔧 Configuration

### Variables d'environnement

Créer ou modifier `env.production.local` dans `/volume1/docker/immo/` sur le NAS avec :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xemtoyzcihmncbrlsmhr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role

# OpenAI (pour la recherche IA)
OPENAI_API_KEY=votre_cle_openai

# Cron secret (pour les recherches automatiques)
CRON_SECRET=votre_secret_securise

# Autres variables nécessaires
NODE_ENV=production
PORT=3001
```

### Configuration Traefik

Le fichier `traefik/dynamic/real-estate.yml` est automatiquement chargé par Traefik.

Vérifier que Traefik surveille le répertoire :
```yaml
--providers.file.directory=/etc/traefik/dynamic
--providers.file.watch=true
```

### Réseau Docker

Le container utilise le réseau `iahome-network` qui doit être créé :

```bash
docker network create iahome-network
```

Ou utiliser le réseau existant si Traefik est déjà configuré.

## 🌐 Accès à l'application

Une fois déployé, l'application est accessible sur :
- **HTTPS** : https://immo.regispailler.fr
- **HTTP** : http://immo.regispailler.fr (redirige vers HTTPS)

## 📊 Vérification

### Vérifier que le container tourne

```bash
ssh admin@192.168.1.130 "docker ps | grep real-estate-app"
```

### Vérifier les logs

```bash
ssh admin@192.168.1.130 "cd /volume1/docker/iahome && docker-compose -f docker-compose.real-estate.yml logs -f"
```

### Vérifier la santé du container

```bash
ssh admin@192.168.1.130 "docker exec real-estate-app curl -f http://localhost:3001/ || echo 'Container non accessible'"
```

### Vérifier Traefik

Accéder au dashboard Traefik et vérifier que la route `immo.regispailler.fr` est configurée.

## 🔄 Mise à jour

Pour mettre à jour l'application :

```bash
# Méthode 1 : Utiliser le script de déploiement
./deploy-real-estate.sh

# Méthode 2 : Manuellement
ssh admin@192.168.1.130 << EOF
cd /volume1/docker/iahome
docker-compose -f docker-compose.real-estate.yml down
# Copier les nouveaux fichiers...
docker-compose -f docker-compose.real-estate.yml build --no-cache
docker-compose -f docker-compose.real-estate.yml up -d
EOF
```

## 🐛 Dépannage

### Le container ne démarre pas

1. Vérifier les logs :
```bash
docker-compose -f docker-compose.real-estate.yml logs
```

2. Vérifier les ressources :
```bash
docker stats real-estate-app
```

3. Vérifier les variables d'environnement :
```bash
docker exec real-estate-app env | grep -E "SUPABASE|OPENAI"
```

### L'application n'est pas accessible

1. Vérifier que Traefik route correctement :
   - Accéder au dashboard Traefik
   - Vérifier les routers et services

2. Vérifier le DNS :
```bash
nslookup immo.regispailler.fr
```

3. Vérifier les certificats SSL :
   - Les certificats Let's Encrypt sont générés automatiquement
   - Vérifier dans `/letsencrypt/acme.json`

### Erreurs de build

1. Vérifier l'espace disque :
```bash
df -h
```

2. Vérifier la mémoire :
```bash
free -h
```

3. Nettoyer les images Docker :
```bash
docker system prune -a
```

## 📝 Notes importantes

- Le port interne est **3001** pour éviter les conflits avec l'application principale (port 3000)
- Le container utilise le réseau `iahome-network` partagé avec Traefik
- Les certificats SSL sont gérés automatiquement par Let's Encrypt via Traefik
- Les logs sont stockés dans `/volume1/docker/immo/logs` sur le NAS

## 🔐 Sécurité

- L'application utilise HTTPS uniquement
- Les headers de sécurité sont configurés via Traefik
- Rate limiting activé pour l'API
- CORS configuré pour les domaines autorisés

## 📚 Documentation complémentaire

- [Guide de démarrage rapide](../docs/REAL_ESTATE_QUICK_START.md)
- [Documentation complète](../docs/REAL_ESTATE_SEARCH.md)
- [Fonctionnalités IA et Enchères](../docs/REAL_ESTATE_AI_AUCTIONS.md)
