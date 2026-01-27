# Guide d'installation de n8n sur NAS Synology

Ce guide explique comment installer n8n avec PostgreSQL sur un NAS Synology, en utilisant Docker.

## Prérequis

1. **NAS Synology** avec Docker installé
2. **Accès SSH** au NAS (optionnel mais recommandé)
3. **Package Manager** : Docker doit être installé via le Package Center

## Méthode 1 : Installation via Docker Compose (Recommandé)

### Étape 1 : Préparer les répertoires sur le NAS

Connectez-vous au NAS via SSH ou utilisez File Station pour créer les répertoires :

```bash
# Via SSH sur le NAS
sudo mkdir -p /volume1/docker/n8n/n8n
sudo mkdir -p /volume1/docker/n8n/postgres
```

### Étape 2 : Configurer les permissions

**Important** : Les permissions sont cruciales pour que n8n fonctionne correctement.

#### Option A : Via SSH (Recommandé)

```bash
# Sur le NAS Synology
# Trouver l'UID/GID de l'utilisateur (généralement 1026:100 pour admin sur Synology)
id admin

# Définir les permissions (remplacez 1026:100 par vos valeurs)
sudo chown -R 1026:100 /volume1/docker/n8n
sudo chmod -R 755 /volume1/docker/n8n
```

#### Option B : Via File Station

1. Ouvrez **File Station** sur le NAS
2. Naviguez vers `/docker/n8n`
3. Clic droit sur le dossier → **Propriétés** → **Permissions**
4. Assurez-vous que l'utilisateur `admin` (ou votre utilisateur) a les permissions **Lecture/Écriture**
5. Cochez **Appliquer à ce dossier, sous-dossiers et fichiers**

### Étape 3 : Créer le fichier docker-compose.yml

Créez le fichier `/volume1/docker/n8n/docker-compose.yml` sur le NAS :

```yaml
version: '3.8'

services:
  n8n-postgres:
    container_name: n8n-postgres
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: n8n
      POSTGRES_PASSWORD: Rasulova75
      POSTGRES_DB: n8ndb
    volumes:
      - /volume1/docker/n8n/postgres:/var/lib/postgresql/data
    networks:
      - n8n-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U n8n"]
      interval: 10s
      timeout: 5s
      retries: 5

  n8n:
    container_name: n8n
    image: n8nio/n8n:latest
    restart: always
    ports:
      - "5678:5678"
    depends_on:
      n8n-postgres:
        condition: service_healthy
    environment:
      # Configuration de la base de données PostgreSQL
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: n8n-postgres
      DB_POSTGRESDB_PORT: 5432
      DB_POSTGRESDB_DATABASE: n8ndb
      DB_POSTGRESDB_USER: n8n
      DB_POSTGRESDB_PASSWORD: Rasulova75

      # Configuration n8n - IMPORTANT pour OAuth
      WEBHOOK_URL: "https://n8n.regispailler.fr"
      N8N_HOST: n8n.regispailler.fr
      N8N_PORT: 5678
      N8N_PROTOCOL: https
      N8N_EDITOR_BASE_URL: "https://n8n.regispailler.fr"

      # Configuration générale
      N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS: false
      GENERIC_TIMEZONE: Europe/Paris
      TZ: Europe/Paris
      
      # Clé de chiffrement (changez cette valeur en production)
      N8N_ENCRYPTION_KEY: "n8n-encryption-key-2024-regispailler-secure"
    volumes:
      - /volume1/docker/n8n/n8n:/home/node/.n8n
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5678/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - n8n-net

networks:
  n8n-net:
    driver: bridge
```

**Note importante** : Sur Synology, vous devrez peut-être ajuster les `PUID` et `PGID` selon votre utilisateur. Vérifiez avec `id admin` sur le NAS.

### Étape 4 : Démarrer les conteneurs

#### Via SSH sur le NAS

```bash
cd /volume1/docker/n8n
docker-compose up -d
```

#### Via l'interface Synology Docker

1. Ouvrez **Docker** dans le Package Center
2. Allez dans **Container** → **Create**
3. Sélectionnez **Create from docker-compose.yml**
4. Chargez le fichier `docker-compose.yml`
5. Cliquez sur **Create**

### Étape 5 : Vérifier l'installation

```bash
# Vérifier que les conteneurs sont en cours d'exécution
docker ps | grep n8n

# Vérifier les logs
docker logs n8n --tail 50
```

## Méthode 2 : Installation via l'interface Synology Docker

### Étape 1 : Créer les conteneurs individuellement

#### Conteneur PostgreSQL

1. Ouvrez **Docker** → **Registry**
2. Recherchez `postgres:15` et téléchargez l'image
3. Allez dans **Image** → **postgres:15** → **Launch**
4. Configurez :
   - **Container Name** : `n8n-postgres`
   - **Enable auto-restart** : ✓
   - **Advanced Settings** :
     - **Environment** :
       - `POSTGRES_USER=n8n`
       - `POSTGRES_PASSWORD=Rasulova75`
       - `POSTGRES_DB=n8ndb`
     - **Volume** :
       - `/volume1/docker/n8n/postgres` → `/var/lib/postgresql/data`
5. Cliquez sur **Apply** puis **Next** → **Done**

#### Conteneur n8n

1. Recherchez `n8nio/n8n` dans **Registry** et téléchargez
2. **Launch** l'image
3. Configurez :
   - **Container Name** : `n8n`
   - **Enable auto-restart** : ✓
   - **Port Settings** :
     - `5678:5678` (Local:Container)
   - **Environment** :
     ```
     DB_TYPE=postgresdb
     DB_POSTGRESDB_HOST=n8n-postgres
     DB_POSTGRESDB_PORT=5432
     DB_POSTGRESDB_DATABASE=n8ndb
     DB_POSTGRESDB_USER=n8n
     DB_POSTGRESDB_PASSWORD=Rasulova75
     WEBHOOK_URL=https://n8n.regispailler.fr
     N8N_HOST=n8n.regispailler.fr
     N8N_PORT=5678
     N8N_PROTOCOL=https
     N8N_EDITOR_BASE_URL=https://n8n.regispailler.fr
     N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=false
     GENERIC_TIMEZONE=Europe/Paris
     TZ=Europe/Paris
     N8N_ENCRYPTION_KEY=n8n-encryption-key-2024-regispailler-secure
     ```
   - **Volume** :
     - `/volume1/docker/n8n/n8n` → `/home/node/.n8n`
   - **Network** :
     - Créez un réseau `n8n-net` (bridge)
     - Connectez les deux conteneurs au même réseau
4. Cliquez sur **Apply** puis **Next** → **Done**

## Configuration des permissions (Important)

### Problème courant : Permission denied

Si vous voyez l'erreur `EACCES: permission denied, open '/home/node/.n8n/config'`, voici les solutions :

### Solution 1 : Corriger les permissions via SSH

```bash
# Sur le NAS Synology
# Trouver l'UID/GID de l'utilisateur
id admin

# Exemple de sortie : uid=1026(admin) gid=100(users)
# Utilisez ces valeurs pour chown

sudo chown -R 1026:100 /volume1/docker/n8n
sudo chmod -R 755 /volume1/docker/n8n
```

### Solution 2 : Utiliser l'utilisateur root (non recommandé en production)

Modifiez le docker-compose.yml pour retirer `user: "1000:1000"` ou utiliser `user: "root"` :

```yaml
n8n:
  # Retirez cette ligne ou utilisez root
  # user: "1000:1000"
```

### Solution 3 : Ajuster PUID/PGID dans docker-compose

```yaml
n8n:
  environment:
    # Ajoutez ces variables avec les valeurs de votre utilisateur NAS
    PUID: 1026  # UID de votre utilisateur
    PGID: 100   # GID de votre groupe
```

## Configuration du reverse proxy (Traefik)

Si vous utilisez Traefik comme reverse proxy, assurez-vous que la configuration est correcte :

```yaml
# traefik/dynamic/n8n.yml
http:
  routers:
    n8n-main:
      rule: "Host(`n8n.regispailler.fr`)"
      entryPoints: ["web"]
      service: n8n-service
      middlewares: ["security-headers@file", "n8n-proxy-headers@file"]
  
  services:
    n8n-service:
      loadBalancer:
        servers:
          - url: "http://host.docker.internal:5678"
  
  middlewares:
    n8n-proxy-headers:
      headers:
        customRequestHeaders:
          X-Forwarded-Proto: "https"
          X-Forwarded-Host: "n8n.regispailler.fr"
```

## Vérification de l'installation

### 1. Vérifier que les conteneurs sont en cours d'exécution

```bash
docker ps | grep n8n
```

Vous devriez voir :
- `n8n-postgres` (Up)
- `n8n` (Up)

### 2. Vérifier les logs

```bash
docker logs n8n --tail 50
```

Recherchez des erreurs de permissions ou de connexion à la base de données.

### 3. Tester l'accès

- **Local** : `http://NAS_IP:5678`
- **Via domaine** : `https://n8n.regispailler.fr`

### 4. Vérifier les variables d'environnement

```bash
docker exec n8n env | grep N8N
```

Vous devriez voir :
```
N8N_HOST=n8n.regispailler.fr
N8N_PROTOCOL=https
WEBHOOK_URL=https://n8n.regispailler.fr
N8N_EDITOR_BASE_URL=https://n8n.regispailler.fr
```

### 5. Vérifier l'URL OAuth Redirect

1. Connectez-vous à n8n
2. Allez dans **Credentials**
3. Créez ou ouvrez un credential OAuth2 (ex: Gmail)
4. L'URL OAuth Redirect devrait afficher :
   ```
   https://n8n.regispailler.fr/rest/oauth2-credential/callback
   ```

## Dépannage

### Le conteneur n8n redémarre en boucle

**Cause** : Problème de permissions

**Solution** :
```bash
# Sur le NAS
sudo chown -R 1026:100 /volume1/docker/n8n
sudo chmod -R 755 /volume1/docker/n8n
```

### Erreur de connexion à PostgreSQL

**Cause** : PostgreSQL n'est pas encore prêt

**Solution** : Attendez que PostgreSQL soit complètement démarré (30-60 secondes)

### L'URL OAuth Redirect affiche toujours localhost

**Cause** : Les variables d'environnement ne sont pas appliquées

**Solution** :
1. Vérifiez les variables dans `docker-compose.yml`
2. Redémarrez les conteneurs : `docker-compose restart n8n`
3. Videz le cache du navigateur (Ctrl+F5)

### Le volume n'est pas accessible

**Cause** : Le chemin du volume n'existe pas ou n'a pas les bonnes permissions

**Solution** :
```bash
# Créer les répertoires
sudo mkdir -p /volume1/docker/n8n/n8n
sudo mkdir -p /volume1/docker/n8n/postgres

# Corriger les permissions
sudo chown -R 1026:100 /volume1/docker/n8n
sudo chmod -R 755 /volume1/docker/n8n
```

## Mise à jour de n8n

```bash
cd /volume1/docker/n8n
docker-compose pull
docker-compose up -d
```

## Sauvegarde

### Sauvegarder les données n8n

```bash
# Sur le NAS
tar -czf n8n-backup-$(date +%Y%m%d).tar.gz /volume1/docker/n8n/n8n
```

### Sauvegarder la base de données PostgreSQL

```bash
docker exec n8n-postgres pg_dump -U n8n n8ndb > n8n-db-backup-$(date +%Y%m%d).sql
```

## Notes importantes

- ⚠️ **Permissions** : Les permissions sont cruciales sur Synology. Utilisez toujours `chown` et `chmod` appropriés.
- 🔒 **Sécurité** : Changez le mot de passe PostgreSQL et la clé de chiffrement en production.
- 📁 **Volumes** : Les volumes doivent exister avant de démarrer les conteneurs.
- 🌐 **OAuth** : L'URL OAuth Redirect est générée automatiquement à partir de `WEBHOOK_URL`.
- 🔄 **Redémarrage** : Après chaque modification des variables d'environnement, redémarrez n8n.

## Support

Pour plus d'aide :
- Documentation n8n : https://docs.n8n.io
- Forum Synology : https://www.synology.com/community
- GitHub n8n : https://github.com/n8n-io/n8n
