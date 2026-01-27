# Dépannage : Erreur "-sh: -: command not found" sur NAS Synology

## Problème

L'erreur `-sh: -: command not found` apparaît généralement quand :
- Des caractères invisibles sont copiés-collés
- Le prompt shell est mal configuré
- Une commande contient des caractères spéciaux mal échappés

## Solutions

### Solution 1 : Taper les commandes manuellement

Au lieu de copier-coller, tapez les commandes manuellement pour éviter les caractères invisibles.

### Solution 2 : Vérifier le shell actif

```bash
echo $SHELL
```

Si vous êtes sur `sh` au lieu de `bash`, basculez vers bash :

```bash
bash
```

### Solution 3 : Commandes propres à copier-coller

Voici les commandes essentielles, une par une, sans caractères spéciaux :

#### Créer les répertoires

```bash
sudo mkdir -p /volume1/docker/n8n/n8n
```

```bash
sudo mkdir -p /volume1/docker/n8n/postgres
```

#### Trouver l'UID/GID

```bash
id admin
```

#### Configurer les permissions (remplacez 1026:100 par vos valeurs)

```bash
sudo chown -R 1026:100 /volume1/docker/n8n
```

```bash
sudo chmod -R 755 /volume1/docker/n8n
```

#### Vérifier les permissions

```bash
ls -ld /volume1/docker/n8n
```

### Solution 4 : Créer le docker-compose.yml via cat

Au lieu d'utiliser `nano` ou `vi`, utilisez `cat` avec un heredoc :

```bash
cat > /volume1/docker/n8n/docker-compose.yml << 'EOF'
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
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: n8n-postgres
      DB_POSTGRESDB_PORT: 5432
      DB_POSTGRESDB_DATABASE: n8ndb
      DB_POSTGRESDB_USER: n8n
      DB_POSTGRESDB_PASSWORD: Rasulova75
      WEBHOOK_URL: "https://n8n.regispailler.fr"
      N8N_HOST: n8n.regispailler.fr
      N8N_PORT: 5678
      N8N_PROTOCOL: https
      N8N_EDITOR_BASE_URL: "https://n8n.regispailler.fr"
      N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS: false
      GENERIC_TIMEZONE: Europe/Paris
      TZ: Europe/Paris
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
EOF
```

### Solution 5 : Utiliser SCP pour transférer le fichier

Depuis votre machine Windows, transférez le fichier docker-compose.yml :

```powershell
# Depuis Windows PowerShell
scp docker-compose-n8n-nas.yml admin@VOTRE_NAS_IP:/volume1/docker/n8n/docker-compose.yml
```

### Solution 6 : Vérifier les caractères invisibles

Si vous devez copier-coller, nettoyez la commande :

```bash
# Tapez la commande, puis appuyez sur Ctrl+U pour effacer
# Puis retapez-la manuellement
```

## Commandes de vérification

### Vérifier que vous êtes dans le bon répertoire

```bash
pwd
```

### Vérifier que les fichiers existent

```bash
ls -la /volume1/docker/n8n/
```

### Vérifier le contenu du docker-compose.yml

```bash
cat /volume1/docker/n8n/docker-compose.yml
```

### Vérifier la syntaxe YAML

```bash
docker-compose -f /volume1/docker/n8n/docker-compose.yml config
```

## Commandes essentielles (une par ligne)

Copiez chaque commande individuellement :

```bash
cd /volume1/docker/n8n
```

```bash
docker-compose up -d
```

```bash
docker ps
```

```bash
docker logs n8n
```

## Si le problème persiste

1. **Déconnectez-vous et reconnectez-vous via SSH**
2. **Utilisez bash explicitement** : `bash` puis retapez la commande
3. **Vérifiez votre terminal** : Utilisez un client SSH standard (PuTTY, OpenSSH, etc.)
4. **Évitez les copier-coller depuis des PDFs ou documents Word** : Ils contiennent souvent des caractères invisibles

## Alternative : Utiliser l'interface Synology

Si les commandes SSH posent problème, utilisez l'interface graphique Synology :

1. **File Station** : Pour créer les répertoires et gérer les permissions
2. **Docker** : Pour créer les conteneurs via l'interface graphique
3. **Text Editor** : Pour créer le fichier docker-compose.yml
