# Script PowerShell pour démarrer le service Whisper IA
# Utilise cloudflared pour la sécurisation du sous-domaine

Write-Host "🎤 Démarrage du service Whisper IA..." -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Vérifier si Docker est en cours d'exécution
if (!(Get-Process "Docker Desktop" -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️  Docker Desktop n'est pas en cours d'exécution. Veuillez le démarrer d'abord." -ForegroundColor Yellow
    Write-Host "💡 Lancez Docker Desktop et relancez ce script." -ForegroundColor Gray
    exit 1
}

# Vérifier si cloudflared est configuré
if (-not $env:CLOUDFLARE_TUNNEL_TOKEN) {
    Write-Host "⚠️  Variable d'environnement CLOUDFLARE_TUNNEL_TOKEN non définie." -ForegroundColor Yellow
    Write-Host "💡 Créez un tunnel cloudflared et définissez le token :" -ForegroundColor Gray
    Write-Host "   \$env:CLOUDFLARE_TUNNEL_TOKEN = 'votre-token-ici'" -ForegroundColor Gray
    Write-Host "   Ou créez un fichier .env avec CLOUDFLARE_TUNNEL_TOKEN=votre-token" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🔗 Guide cloudflared : https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/" -ForegroundColor Blue
    exit 1
}

# Aller dans le répertoire des services
Set-Location -Path "docker-services"

Write-Host "📁 Répertoire de travail : $(Get-Location)" -ForegroundColor Gray

# Vérifier si le fichier docker-compose existe
if (!(Test-Path "docker-compose.whisper.yml")) {
    Write-Host "❌ Fichier docker-compose.whisper.yml introuvable !" -ForegroundColor Red
    Write-Host "💡 Assurez-vous d'être dans le bon répertoire." -ForegroundColor Gray
    exit 1
}

# Créer le répertoire pour l'interface web si nécessaire
if (!(Test-Path "whisper-webui")) {
    Write-Host "📁 Création du répertoire whisper-webui..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "whisper-webui" -Force | Out-Null
}

# Démarrer le service Whisper
Write-Host "🔄 Démarrage des containers Whisper..." -ForegroundColor Yellow
Write-Host "   - whisper-api (API de transcription)" -ForegroundColor Gray
Write-Host "   - whisper-webui (Interface web)" -ForegroundColor Gray
Write-Host "   - cloudflared (Tunnel sécurisé)" -ForegroundColor Gray

try {
    docker-compose -f docker-compose.whisper.yml up -d
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Containers démarrés avec succès !" -ForegroundColor Green
    } else {
        throw "Erreur lors du démarrage des containers"
    }
} catch {
    Write-Host "❌ Erreur lors du démarrage des containers : $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Attendre que les services soient prêts
Write-Host "⏳ Attente du démarrage des services..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Vérifier le statut des containers
Write-Host "📊 Vérification du statut des services..." -ForegroundColor Yellow
Write-Host ""

$containers = @("whisper-api", "whisper-webui", "whisper-cloudflared")
$allRunning = $true

foreach ($container in $containers) {
    $status = docker ps --filter "name=$container" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    if ($status -match $container) {
        Write-Host "✅ $container : En cours d'exécution" -ForegroundColor Green
    } else {
        Write-Host "❌ $container : Arrêté ou erreur" -ForegroundColor Red
        $allRunning = $false
    }
}

Write-Host ""

if ($allRunning) {
    Write-Host "🎉 Service Whisper IA démarré avec succès !" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Accès aux services :" -ForegroundColor Cyan
    Write-Host "   - Interface web : http://localhost:8093" -ForegroundColor White
    Write-Host "   - API REST : http://localhost:8092" -ForegroundColor White
    Write-Host "   - Tunnel cloudflared : Configuré avec votre token" -ForegroundColor White
    Write-Host ""
    Write-Host "📋 Commandes utiles :" -ForegroundColor Yellow
    Write-Host "   - Arrêter : .\stop-whisper.ps1" -ForegroundColor Gray
    Write-Host "   - Logs : docker-compose -f docker-compose.whisper.yml logs -f" -ForegroundColor Gray
    Write-Host "   - Statut : docker-compose -f docker-compose.whisper.yml ps" -ForegroundColor Gray
    Write-Host "   - Redémarrer : docker-compose -f docker-compose.whisper.yml restart" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🔧 Configuration :" -ForegroundColor Yellow
    Write-Host "   - Modèle : base (équilibre vitesse/précision)" -ForegroundColor Gray
    Write-Host "   - Langue : français" -ForegroundColor Gray
    Write-Host "   - Formats : MP3, WAV, M4A, OGG, FLAC, AAC, WMA, MP4, AVI, MOV, MKV" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Certains services ne sont pas démarrés correctement." -ForegroundColor Yellow
    Write-Host "💡 Vérifiez les logs avec : docker-compose -f docker-compose.whisper.yml logs" -ForegroundColor Gray
}

Write-Host ""
Write-Host "📚 Documentation complète : docker-services/README-whisper.md" -ForegroundColor Blue
