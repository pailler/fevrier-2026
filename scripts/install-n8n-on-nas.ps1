# Script d'aide pour installer n8n sur NAS Synology
# Ce script génère les commandes et fichiers nécessaires

param(
    [string]$NasIP = "",
    [string]$NasUser = "admin",
    [string]$Domain = "n8n.regispailler.fr"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Guide d'installation n8n sur NAS Synology" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ([string]::IsNullOrWhiteSpace($NasIP)) {
    $NasIP = Read-Host "Entrez l'adresse IP de votre NAS Synology"
}

Write-Host ""
Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  NAS IP: $NasIP" -ForegroundColor Gray
Write-Host "  Utilisateur: $NasUser" -ForegroundColor Gray
Write-Host "  Domaine: $Domain" -ForegroundColor Gray
Write-Host ""

Write-Host "ETAPES D'INSTALLATION:" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Connectez-vous au NAS via SSH:" -ForegroundColor Yellow
Write-Host "   ssh $NasUser@$NasIP" -ForegroundColor White
Write-Host ""

Write-Host "2. Créez les répertoires:" -ForegroundColor Yellow
Write-Host "   sudo mkdir -p /volume1/docker/n8n/n8n" -ForegroundColor White
Write-Host "   sudo mkdir -p /volume1/docker/n8n/postgres" -ForegroundColor White
Write-Host ""

Write-Host "3. Trouvez l'UID/GID de votre utilisateur:" -ForegroundColor Yellow
Write-Host "   id $NasUser" -ForegroundColor White
Write-Host "   # Notez les valeurs (ex: uid=1026 gid=100)" -ForegroundColor Gray
Write-Host ""

Write-Host "4. Configurez les permissions:" -ForegroundColor Yellow
Write-Host "   sudo chown -R 1026:100 /volume1/docker/n8n" -ForegroundColor White
Write-Host "   sudo chmod -R 755 /volume1/docker/n8n" -ForegroundColor White
Write-Host "   # Remplacez 1026:100 par vos valeurs UID:GID" -ForegroundColor Gray
Write-Host ""

Write-Host "5. Créez le fichier docker-compose.yml:" -ForegroundColor Yellow
Write-Host "   sudo nano /volume1/docker/n8n/docker-compose.yml" -ForegroundColor White
Write-Host ""

# Générer le contenu du docker-compose.yml
$dockerComposeContent = @"
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
      WEBHOOK_URL: "https://$Domain"
      N8N_HOST: $Domain
      N8N_PORT: 5678
      N8N_PROTOCOL: https
      N8N_EDITOR_BASE_URL: "https://$Domain"

      # Configuration générale
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
"@

Write-Host "6. Copiez ce contenu dans docker-compose.yml:" -ForegroundColor Yellow
Write-Host $dockerComposeContent -ForegroundColor Gray
Write-Host ""

Write-Host "7. Démarrez les conteneurs:" -ForegroundColor Yellow
Write-Host "   cd /volume1/docker/n8n" -ForegroundColor White
Write-Host "   docker-compose up -d" -ForegroundColor White
Write-Host ""

Write-Host "8. Vérifiez le statut:" -ForegroundColor Yellow
Write-Host "   docker ps | grep n8n" -ForegroundColor White
Write-Host ""

Write-Host "9. Vérifiez les logs:" -ForegroundColor Yellow
Write-Host "   docker logs n8n --tail 50" -ForegroundColor White
Write-Host ""

Write-Host "10. Accédez à n8n:" -ForegroundColor Yellow
Write-Host "    Local: http://$NasIP`:5678" -ForegroundColor White
Write-Host "    Domaine: https://$Domain" -ForegroundColor White
Write-Host ""

# Sauvegarder le docker-compose.yml localement
$outputFile = "docker-compose-n8n-nas.yml"
$dockerComposeContent | Out-File -FilePath $outputFile -Encoding UTF8

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fichier docker-compose.yml généré:" -ForegroundColor Green
Write-Host "  $outputFile" -ForegroundColor White
Write-Host ""
Write-Host "Vous pouvez copier ce fichier sur votre NAS:" -ForegroundColor Yellow
Write-Host "  scp $outputFile $NasUser@$NasIP`:/volume1/docker/n8n/docker-compose.yml" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
