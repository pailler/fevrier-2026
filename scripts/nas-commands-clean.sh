#!/bin/bash
# Script de commandes propres pour installer n8n sur NAS Synology
# Copiez chaque section individuellement

# ============================================
# ÉTAPE 1 : Créer les répertoires
# ============================================
sudo mkdir -p /volume1/docker/n8n/n8n
sudo mkdir -p /volume1/docker/n8n/postgres

# ============================================
# ÉTAPE 2 : Trouver l'UID/GID
# ============================================
id admin

# Notez les valeurs affichées (ex: uid=1026(admin) gid=100(users))
# Utilisez ces valeurs dans l'étape suivante

# ============================================
# ÉTAPE 3 : Configurer les permissions
# Remplacez 1026:100 par vos valeurs UID:GID
# ============================================
sudo chown -R 1026:100 /volume1/docker/n8n
sudo chmod -R 755 /volume1/docker/n8n

# ============================================
# ÉTAPE 4 : Vérifier les permissions
# ============================================
ls -ld /volume1/docker/n8n
ls -ld /volume1/docker/n8n/n8n
ls -ld /volume1/docker/n8n/postgres

# ============================================
# ÉTAPE 5 : Créer le docker-compose.yml
# ============================================
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
      # N8N_ENCRYPTION_KEY: "n8n-encryption-key-2024-regispailler-secure"
      # NOTE: Si vous avez une installation existante, commentez cette ligne
      # ou utilisez la même clé que celle dans /volume1/docker/n8n/n8n/config
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

# ============================================
# ÉTAPE 6 : Vérifier le fichier créé
# ============================================
cat /volume1/docker/n8n/docker-compose.yml

# ============================================
# ÉTAPE 7 : Aller dans le répertoire
# ============================================
cd /volume1/docker/n8n

# ============================================
# ÉTAPE 8 : Démarrer les conteneurs
# Note: Utilisez sudo si vous avez des erreurs de permissions
# ============================================
sudo docker-compose up -d

# ============================================
# ÉTAPE 9 : Vérifier le statut
# ============================================
sudo docker ps | grep n8n

# ============================================
# ÉTAPE 10 : Vérifier les logs
# ============================================
sudo docker logs n8n --tail 50
