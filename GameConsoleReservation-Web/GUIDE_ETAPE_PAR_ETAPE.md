# 🚀 Guide Étape par Étape - Déploiement sur Synology NAS

## 📋 Vue d'ensemble

Ce guide vous accompagne pas à pas pour déployer l'application de réservation de jeux sur votre NAS Synology (192.168.1.130) avec Cloudflare.

**Temps estimé : 15-20 minutes**

---

## ✅ ÉTAPE 1 : Préparer le NAS Synology

### 1.1 Installer Docker

1. **Ouvrez DSM** (interface web du NAS)
   - Allez sur `http://192.168.1.130:5000` (ou l'IP de votre NAS)
   - Connectez-vous avec votre compte administrateur

2. **Ouvrez Package Center**
   - Icône dans le menu principal

3. **Recherchez "Docker"**
   - Tapez "Docker" dans la barre de recherche
   - Cliquez sur **Docker** (par Synology)

4. **Installez Docker**
   - Cliquez sur **Installer**
   - Attendez la fin de l'installation (2-3 minutes)

5. **Ouvrez Docker**
   - Cliquez sur **Ouvrir** ou trouvez Docker dans le menu principal

### 1.2 Activer SSH

1. **Ouvrez Control Panel**
   - Menu principal > Control Panel

2. **Allez dans Terminal & SNMP**
   - Catégorie "System" > Terminal & SNMP

3. **Activez SSH**
   - Cochez **Enable SSH service**
   - Port par défaut : **22** (laissez tel quel)
   - Cliquez sur **Apply**

4. **Notez vos identifiants**
   - Utilisateur : `admin` (ou votre utilisateur)
   - Mot de passe : (votre mot de passe)

---

## 📁 ÉTAPE 2 : Créer le répertoire sur le NAS

### Option A : Via File Station (Interface Web) ⭐ Recommandé

1. **Ouvrez File Station**
   - Menu principal > File Station

2. **Naviguez vers `/docker`**
   - Dans le panneau de gauche, cliquez sur `docker`
   - Si le dossier n'existe pas, créez-le :
     - Clic droit > **New Folder** > Nom : `docker`

3. **Créez le dossier `game-reservation`**
   - Dans `/docker`, créez un nouveau dossier : `game-reservation`

### Option B : Via SSH

1. **Ouvrez PowerShell** sur votre PC Windows

2. **Connectez-vous au NAS** :
```powershell
ssh admin@192.168.1.130
```
   - Entrez votre mot de passe quand demandé

3. **Créez le répertoire** :
```bash
sudo mkdir -p /volume1/docker/game-reservation
sudo chmod 755 /volume1/docker/game-reservation
```

4. **Quittez SSH** :
```bash
exit
```

---

## 📦 ÉTAPE 3 : Copier les fichiers sur le NAS

### Option A : Via Script PowerShell (Le plus simple) ⭐

1. **Ouvrez PowerShell** sur votre PC Windows

2. **Naviguez vers le dossier du projet** :
```powershell
cd C:\Users\AAA\Documents\iahome\GameConsoleReservation-Web
```

3. **Exécutez le script de déploiement** :
```powershell
.\deploy-to-synology.ps1
```

4. **Le script va** :
   - Vérifier la connexion SSH
   - Créer le répertoire si nécessaire
   - Copier tous les fichiers
   - Construire et démarrer les conteneurs Docker

5. **Si c'est la première fois**, vous devrez peut-être :
   - Autoriser l'exécution de scripts PowerShell :
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Option B : Via File Station (Interface Web)

1. **Ouvrez File Station** sur le NAS

2. **Naviguez vers `/docker/game-reservation`**

3. **Téléversez les fichiers** un par un ou en lot :
   - `docker-compose.yml`
   - `Dockerfile.frontend`
   - `nginx.conf`
   - `index.html`
   - `app-backend.js`
   - `barcode-scanner.js`
   - `styles.css`

4. **Créez le dossier `backend`** dans `/docker/game-reservation`

5. **Téléversez les fichiers du backend** dans `/docker/game-reservation/backend` :
   - `Dockerfile`
   - `package.json`
   - `package-lock.json`
   - `server.js`
   - `data.json` (si vous avez des données existantes)

### Option C : Via SCP (Ligne de commande)

1. **Ouvrez PowerShell** sur votre PC

2. **Copiez les fichiers** :
```powershell
# Créer le répertoire
ssh admin@192.168.1.130 "mkdir -p /volume1/docker/game-reservation/backend"

# Copier les fichiers principaux
scp docker-compose.yml Dockerfile.frontend nginx.conf index.html app-backend.js barcode-scanner.js styles.css admin@192.168.1.130:/volume1/docker/game-reservation/

# Copier les fichiers du backend
scp backend\Dockerfile backend\package.json backend\package-lock.json backend\server.js admin@192.168.1.130:/volume1/docker/game-reservation/backend/
```

---

## 🐳 ÉTAPE 4 : Démarrer l'application avec Docker

### Via SSH (Recommandé)

1. **Connectez-vous au NAS via SSH** :
```powershell
ssh admin@192.168.1.130
```

2. **Naviguez vers le répertoire** :
```bash
cd /volume1/docker/game-reservation
```

3. **Vérifiez que tous les fichiers sont présents** :
```bash
ls -la
# Vous devriez voir : docker-compose.yml, Dockerfile.frontend, nginx.conf, etc.
ls -la backend/
# Vous devriez voir : Dockerfile, package.json, server.js, etc.
```

4. **Construisez et démarrez les conteneurs** :
```bash
docker-compose up -d --build
```

   Cette commande va :
   - Construire les images Docker
   - Créer les conteneurs
   - Démarrer les services

5. **Attendez 1-2 minutes** pour que tout démarre

6. **Vérifiez que les conteneurs sont démarrés** :
```bash
docker-compose ps
```

   Vous devriez voir :
   ```
   NAME                        STATUS          PORTS
   game-reservation-backend    Up X seconds    0.0.0.0:5001->5001/tcp
   game-reservation-frontend   Up X seconds    0.0.0.0:5000->80/tcp
   ```

7. **Consultez les logs** pour vérifier que tout fonctionne :
```bash
docker-compose logs -f
```

   Appuyez sur **Ctrl+C** pour quitter les logs

---

## ✅ ÉTAPE 5 : Vérifier que tout fonctionne

### 5.1 Test local

1. **Ouvrez votre navigateur**

2. **Allez sur** : `http://192.168.1.130:5000`
   - L'application devrait s'afficher
   - Vous devriez voir la liste des consoles

3. **Testez le backend** : `http://192.168.1.130:5001/api/health`
   - Vous devriez voir : `{"status":"ok"}`

### 5.2 Vérifier les conteneurs

Sur le NAS (via SSH) :
```bash
docker ps
```

Vous devriez voir deux conteneurs en cours d'exécution.

### 5.3 Tester une réservation

1. Sur `http://192.168.1.130:5000`
2. Cliquez sur une console disponible
3. Créez une réservation de test
4. Vérifiez qu'elle apparaît bien

---

## 🌐 ÉTAPE 6 : Configuration Cloudflare

### 6.1 Vérifier votre configuration Cloudflare actuelle

Si vous avez déjà un tunnel Cloudflare configuré pour `consoles.regispailler.fr`, vous devez le modifier pour pointer vers le NAS.

### 6.2 Option A : Modifier le tunnel Cloudflare existant

1. **Sur votre PC**, trouvez le fichier de configuration Cloudflare
   - Généralement : `C:\Users\AAA\.cloudflared\config.yml` ou similaire

2. **Modifiez la configuration** pour pointer vers le NAS :
```yaml
tunnel: <votre-tunnel-id>
credentials-file: /path/to/credentials.json

ingress:
  # Route pour l'application de réservation
  - hostname: consoles.regispailler.fr
    service: http://192.168.1.130:5000
  
  # Catch-all (doit être en dernier)
  - service: http_status:404
```

3. **Redémarrez le tunnel Cloudflare** :
```bash
cloudflared tunnel run consoles
```

### 6.3 Option B : Utiliser le Reverse Proxy de Synology

Si vous préférez utiliser le Reverse Proxy intégré de Synology :

1. **Ouvrez Control Panel** sur le NAS

2. **Allez dans Login Portal** > **Advanced** > **Reverse Proxy**

3. **Créez une nouvelle règle** :
   - Cliquez sur **Create** > **Reverse Proxy Rule**

4. **Configurez la règle** :
   - **Description** : `Consoles Reservation`
   
   - **Source** :
     - Protocol : `HTTPS`
     - Hostname : `consoles.regispailler.fr`
     - Port : `443`
   
   - **Destination** :
     - Protocol : `HTTP`
     - Hostname : `localhost`
     - Port : `5000`

5. **Cliquez sur Save**

6. **Configurez Cloudflare** pour pointer vers l'IP publique de votre NAS

### 6.4 Vérifier l'accès via Cloudflare

1. **Attendez quelques minutes** pour la propagation DNS

2. **Testez** : `https://consoles.regispailler.fr`
   - L'application devrait s'afficher

---

## 🔧 ÉTAPE 7 : Configuration finale

### 7.1 Vérifier que l'API fonctionne via Cloudflare

Si vous avez configuré le reverse proxy pour l'API aussi :

1. Testez : `https://consoles.regispailler.fr/api/health`
   - Devrait retourner : `{"status":"ok"}`

### 7.2 Sauvegarder les données

Les données sont stockées dans :
- `/volume1/docker/game-reservation/backend/data.json`

**Créez un script de sauvegarde** :

Sur le NAS, créez `/volume1/docker/game-reservation/backup.sh` :
```bash
#!/bin/bash
BACKUP_DIR="/volume1/backups/game-reservation"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cp /volume1/docker/game-reservation/backend/data.json \
   $BACKUP_DIR/data_${DATE}.json

echo "✅ Backup créé: $BACKUP_DIR/data_${DATE}.json"
```

Rendez-le exécutable :
```bash
chmod +x backup.sh
```

---

## 🎉 C'est terminé !

Votre application est maintenant déployée sur le NAS et accessible :

- **Localement** : `http://192.168.1.130:5000`
- **Via Cloudflare** : `https://consoles.regispailler.fr`

---

## 🛠️ Commandes utiles

### Redémarrer l'application
```bash
ssh admin@192.168.1.130
cd /volume1/docker/game-reservation
docker-compose restart
```

### Voir les logs
```bash
docker-compose logs -f
```

### Mettre à jour l'application
```bash
# 1. Copier les nouveaux fichiers (via le script PowerShell ou manuellement)
# 2. Sur le NAS :
cd /volume1/docker/game-reservation
docker-compose down
docker-compose up -d --build
```

### Arrêter l'application
```bash
docker-compose down
```

### Démarrer l'application
```bash
docker-compose up -d
```

---

## 🐛 Dépannage

### Les conteneurs ne démarrent pas

1. **Vérifiez les logs** :
```bash
docker-compose logs
```

2. **Vérifiez que les ports ne sont pas utilisés** :
```bash
netstat -tuln | grep -E '5000|5001'
```

3. **Vérifiez les permissions** :
```bash
ls -la /volume1/docker/game-reservation
```

### L'application ne se charge pas

1. **Vérifiez que les conteneurs sont en cours d'exécution** :
```bash
docker ps
```

2. **Testez l'accès direct** :
```bash
curl http://localhost:5000
curl http://localhost:5001/api/health
```

3. **Vérifiez les logs** :
```bash
docker-compose logs frontend
docker-compose logs backend
```

### Erreur de connexion au backend

1. **Vérifiez que le backend est accessible** :
```bash
curl http://192.168.1.130:5001/api/health
```

2. **Vérifiez la configuration dans `app-backend.js`** :
   - L'URL doit pointer vers `http://192.168.1.130:5001/api` quand vous êtes sur le NAS

---

## 📞 Besoin d'aide ?

Si vous rencontrez des problèmes :
1. Consultez les logs : `docker-compose logs -f`
2. Vérifiez que Docker est bien installé et fonctionne
3. Vérifiez que les ports 5000 et 5001 ne sont pas utilisés par d'autres services


