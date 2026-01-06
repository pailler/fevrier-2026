# 📦 Installation Docker Compose sur Synology NAS

## 🔍 Vérification de l'installation actuelle

### Vérifier si Docker est installé

```bash
docker --version
```

### Vérifier si Docker Compose est installé

```bash
docker-compose --version
```

Ou pour Docker Compose V2 :
```bash
docker compose version
```

## 📥 Méthode 1 : Docker Compose via le Centre de paquets Synology (Recommandé)

1. **Via l'interface web Synology** :
   - Ouvrir le **Centre de paquets**
   - Chercher **"Docker Compose"** ou **"Docker"**
   - Installer le package Docker (qui inclut souvent Docker Compose)

2. **Vérifier après installation** :
   ```bash
   docker-compose --version
   ```

## 📥 Méthode 2 : Installation via pip (Python)

Si Python est installé sur votre NAS :

```bash
# Vérifier si Python est installé
python3 --version

# Installer pip si nécessaire
python3 -m ensurepip --upgrade

# Installer Docker Compose via pip
pip3 install docker-compose

# Vérifier l'installation
docker-compose --version
```

## 📥 Méthode 3 : Installation du binaire standalone

### Télécharger Docker Compose

```bash
# Se placer dans un répertoire temporaire
cd /tmp

# Télécharger Docker Compose (version 2.x)
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Rendre exécutable
sudo chmod +x /usr/local/bin/docker-compose

# Vérifier l'installation
docker-compose --version
```

### Ou pour Docker Compose V2 (plugin Docker)

```bash
# Créer le répertoire pour les plugins Docker
sudo mkdir -p /usr/local/lib/docker/cli-plugins

# Télécharger Docker Compose V2
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/lib/docker/cli-plugins/docker-compose

# Rendre exécutable
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Vérifier (utilisez "docker compose" au lieu de "docker-compose")
docker compose version
```

## 📥 Méthode 4 : Utiliser Docker Compose V2 (si Docker est déjà installé)

Docker Compose V2 est souvent inclus avec Docker récent :

```bash
# Essayer directement
docker compose version

# Si ça fonctionne, utilisez "docker compose" au lieu de "docker-compose"
# Exemple :
docker compose -f docker-compose.real-estate.yml up -d
```

## 🔧 Méthode 5 : Installation via Entware (si disponible)

Si Entware est installé sur votre Synology :

```bash
# Installer via opkg
opkg update
opkg install docker-compose
```

## ✅ Vérification après installation

```bash
# Vérifier Docker
docker --version

# Vérifier Docker Compose (V1)
docker-compose --version

# Vérifier Docker Compose (V2)
docker compose version
```

## 🚀 Utilisation

### Si Docker Compose V1 est installé :
```bash
docker-compose -f docker-compose.real-estate.yml up -d
```

### Si Docker Compose V2 est installé :
```bash
docker compose -f docker-compose.real-estate.yml up -d
```

## 🐛 Dépannage

### Erreur : "docker-compose: command not found"

1. Vérifier le chemin :
```bash
which docker-compose
```

2. Si installé mais non trouvé, ajouter au PATH :
```bash
# Trouver où docker-compose est installé
find /usr -name docker-compose 2>/dev/null

# Ajouter au PATH (ajouter dans ~/.bashrc pour persistance)
export PATH=$PATH:/usr/local/bin
```

### Erreur : "Permission denied"

```bash
# Vérifier les permissions
ls -la /usr/local/bin/docker-compose

# Donner les permissions d'exécution
sudo chmod +x /usr/local/bin/docker-compose
```

### Erreur : "Cannot connect to Docker daemon"

Vérifier que Docker est démarré :
```bash
# Vérifier le statut Docker
sudo systemctl status docker

# Démarrer Docker si nécessaire
sudo systemctl start docker
```

## 📝 Note importante pour Synology

Sur Synology, Docker est souvent géré via l'interface web. Si vous avez des problèmes :

1. Vérifier que Docker est installé et démarré via le **Centre de paquets**
2. Vérifier que votre utilisateur a les droits nécessaires
3. Utiliser `sudo` si nécessaire pour les commandes Docker

## 🔄 Alternative : Utiliser docker directement

Si Docker Compose n'est pas disponible, vous pouvez utiliser Docker directement :

```bash
# Construire l'image
docker build -t real-estate-app .

# Démarrer le container
docker run -d \
  --name real-estate-app \
  --network iahome-network \
  --env-file .env.production \
  -p 3001:3001 \
  real-estate-app
```

Mais il est **fortement recommandé** d'utiliser Docker Compose pour simplifier la gestion.
