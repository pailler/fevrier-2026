# Guide de déploiement sur Synology NAS

Ce guide vous explique comment déployer l'application de réservation de jeux sur votre NAS Synology (192.168.1.130) avec Cloudflare.

## 📋 Prérequis

- NAS Synology avec Docker installé
- Accès SSH au NAS (optionnel mais recommandé)
- Accès à l'interface DSM (Synology)
- Cloudflare configuré pour gérer les sous-domaines

## 🚀 Étape 1 : Préparer le NAS

### 1.1 Installer Docker (si pas déjà fait)

1. Ouvrez **Package Center** dans DSM
2. Recherchez **Docker**
3. Installez **Docker**
4. Ouvrez **Docker** depuis le menu principal

### 1.2 Créer le répertoire de l'application

**Option A : Via l'interface DSM (File Station)**
1. Ouvrez **File Station**
2. Naviguez vers `/docker` (ou `/volume1/docker`)
3. Créez un dossier `game-reservation`

**Option B : Via SSH**
```bash
ssh admin@192.168.1.130
sudo mkdir -p /volume1/docker/game-reservation
sudo chmod 755 /volume1/docker/game-reservation
```

## 📦 Étape 2 : Copier les fichiers sur le NAS

### Option A : Via File Station (Interface Web)

1. Ouvrez **File Station** dans DSM
2. Naviguez vers `/docker/game-reservation`
3. Téléversez tous les fichiers du dossier `GameConsoleReservation-Web` :
   - `index.html`
   - `app-backend.js`
   - `barcode-scanner.js`
   - `styles.css`
   - `docker-compose.yml`
   - `Dockerfile.frontend`
   - `nginx.conf`
   - Le dossier `backend/` complet

### Option B : Via SCP (depuis votre PC Windows)

Ouvrez PowerShell sur votre PC et exécutez :

```powershell
# Créer le répertoire sur le NAS
ssh admin@192.168.1.130 "mkdir -p /volume1/docker/game-reservation"

# Copier les fichiers
scp -r GameConsoleReservation-Web/* admin@192.168.1.130:/volume1/docker/game-reservation/
```

### Option C : Via rsync (si disponible)

```bash
rsync -avz --exclude 'node_modules' --exclude '.git' \
  GameConsoleReservation-Web/ \
  admin@192.168.1.130:/volume1/docker/game-reservation/
```

## 🐳 Étape 3 : Déployer avec Docker

### Option A : Via l'interface Docker de Synology

1. Ouvrez **Docker** dans DSM
2. Allez dans l'onglet **Registry**
3. Cliquez sur **Image** > **Add** > **From File**
4. Mais pour notre cas, nous allons utiliser Docker Compose via SSH

### Option B : Via SSH (Recommandé)

1. Connectez-vous au NAS via SSH :
```bash
ssh admin@192.168.1.130
```

2. Naviguez vers le répertoire :
```bash
cd /volume1/docker/game-reservation
```

3. Vérifiez que tous les fichiers sont présents :
```bash
ls -la
# Vous devriez voir : docker-compose.yml, Dockerfile.frontend, nginx.conf, backend/, etc.
```

4. Construisez et démarrez les conteneurs :
```bash
docker-compose up -d --build
```

5. Vérifiez que les conteneurs sont démarrés :
```bash
docker-compose ps
```

6. Consultez les logs pour vérifier que tout fonctionne :
```bash
docker-compose logs -f
# Appuyez sur Ctrl+C pour quitter les logs
```

## ✅ Étape 4 : Vérifier l'installation

1. **Test local sur le NAS** :
   - Ouvrez votre navigateur
   - Allez sur `http://192.168.1.130:5000`
   - L'application devrait s'afficher

2. **Vérifier le backend** :
   - Allez sur `http://192.168.1.130:5001/api/health`
   - Vous devriez voir : `{"status":"ok"}`

3. **Vérifier les conteneurs** :
```bash
docker ps
# Vous devriez voir deux conteneurs :
# - game-reservation-backend
# - game-reservation-frontend
```

## 🌐 Étape 5 : Configuration Cloudflare

### 5.1 Créer un tunnel Cloudflare (si pas déjà fait)

1. Sur votre PC, installez cloudflared si nécessaire
2. Créez un tunnel pour votre sous-domaine :
```bash
cloudflared tunnel create consoles
```

3. Configurez la route :
```bash
cloudflared tunnel route dns consoles consoles.regispailler.fr
```

### 5.2 Configurer le tunnel pour pointer vers le NAS

Créez ou modifiez le fichier de configuration Cloudflare (`config.yml`) :

```yaml
tunnel: <votre-tunnel-id>
credentials-file: /path/to/credentials.json

ingress:
  # Route pour l'application de réservation
  - hostname: consoles.regispailler.fr
    service: http://192.168.1.130:5000
  
  # Route pour l'API backend (optionnel, si vous voulez exposer l'API séparément)
  - hostname: api-consoles.regispailler.fr
    service: http://192.168.1.130:5001
  
  # Catch-all (doit être en dernier)
  - service: http_status:404
```

### 5.3 Alternative : Reverse Proxy Synology

Si vous préférez utiliser le Reverse Proxy de Synology :

1. Ouvrez **Control Panel** > **Login Portal** > **Advanced** > **Reverse Proxy**
2. Créez une nouvelle règle :
   - **Description** : Consoles Reservation
   - **Source** :
     - Protocol : HTTPS
     - Hostname : consoles.regispailler.fr
     - Port : 443
   - **Destination** :
     - Protocol : HTTP
     - Hostname : localhost
     - Port : 5000

3. Configurez Cloudflare pour pointer vers votre NAS (IP publique)

## 🔧 Étape 6 : Configuration avancée

### 6.1 Persistance des données

Les données sont stockées dans :
- Volume Docker : `reservation-data` (géré automatiquement)
- Fichier direct : `/volume1/docker/game-reservation/backend/data.json`

Pour sauvegarder les données :
```bash
# Sur le NAS
cp /volume1/docker/game-reservation/backend/data.json \
   /volume1/backups/game-reservation-data-$(date +%Y%m%d).json
```

### 6.2 Mise à jour de l'application

Pour mettre à jour l'application :

1. Copiez les nouveaux fichiers sur le NAS
2. Reconstruisez les conteneurs :
```bash
cd /volume1/docker/game-reservation
docker-compose down
docker-compose up -d --build
```

### 6.3 Redémarrer les services

```bash
# Redémarrer tous les services
docker-compose restart

# Redémarrer un service spécifique
docker-compose restart backend
docker-compose restart frontend
```

### 6.4 Voir les logs

```bash
# Logs de tous les services
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 🛠️ Scripts utiles

### Script de redémarrage (sur le NAS)

Créez `/volume1/docker/game-reservation/restart.sh` :

```bash
#!/bin/bash
cd /volume1/docker/game-reservation
docker-compose restart
echo "✅ Services redémarrés"
```

Rendez-le exécutable :
```bash
chmod +x restart.sh
```

### Script de sauvegarde (sur le NAS)

Créez `/volume1/docker/game-reservation/backup.sh` :

```bash
#!/bin/bash
BACKUP_DIR="/volume1/backups/game-reservation"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cp /volume1/docker/game-reservation/backend/data.json \
   $BACKUP_DIR/data_${DATE}.json

# Garder seulement les 10 derniers backups
ls -t $BACKUP_DIR/data_*.json | tail -n +11 | xargs rm -f

echo "✅ Backup créé: $BACKUP_DIR/data_${DATE}.json"
```

## 🐛 Dépannage

### Les conteneurs ne démarrent pas

1. Vérifiez les logs :
```bash
docker-compose logs
```

2. Vérifiez que les ports ne sont pas déjà utilisés :
```bash
netstat -tuln | grep -E '5000|5001'
```

3. Vérifiez les permissions :
```bash
ls -la /volume1/docker/game-reservation
```

### L'application ne se charge pas

1. Vérifiez que les conteneurs sont en cours d'exécution :
```bash
docker ps
```

2. Testez l'accès direct :
```bash
curl http://localhost:5000
curl http://localhost:5001/api/health
```

3. Vérifiez les logs du frontend :
```bash
docker-compose logs frontend
```

### Erreur de connexion au backend

1. Vérifiez que le backend est accessible :
```bash
curl http://192.168.1.130:5001/api/health
```

2. Vérifiez la configuration dans `app-backend.js` :
   - L'URL doit pointer vers `http://192.168.1.130:5001/api` quand vous êtes sur le NAS

3. Vérifiez les logs du backend :
```bash
docker-compose logs backend
```

## 📝 Notes importantes

- **Ports utilisés** : 5000 (frontend) et 5001 (backend)
- **Données** : Sauvegardez régulièrement `backend/data.json`
- **Mises à jour** : Reconstruisez les conteneurs après chaque mise à jour
- **Sécurité** : Configurez un firewall si nécessaire pour limiter l'accès aux ports

## 🎉 C'est terminé !

Votre application devrait maintenant être accessible :
- Localement : `http://192.168.1.130:5000`
- Via Cloudflare : `https://consoles.regispailler.fr` (si configuré)


