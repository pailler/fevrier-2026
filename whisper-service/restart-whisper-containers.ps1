# Script PowerShell pour redémarrer les conteneurs Whisper après correction
# Ce script redémarre les conteneurs whisper-ocr et whisper-documents

Write-Host "🔄 Redémarrage des conteneurs Whisper (OCR et Documents)..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# Vérifier si Docker est en cours d'exécution
try {
    docker ps | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker n'est pas accessible"
    }
} catch {
    Write-Host "❌ Docker Desktop n'est pas en cours d'exécution ou n'est pas accessible." -ForegroundColor Red
    Write-Host "💡 Veuillez démarrer Docker Desktop et relancer ce script." -ForegroundColor Yellow
    exit 1
}

# Aller dans le répertoire whisper-service
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path $scriptPath

Write-Host "📁 Répertoire de travail : $(Get-Location)" -ForegroundColor Gray

# Vérifier si le fichier docker-compose existe
if (!(Test-Path "docker-compose.yml")) {
    Write-Host "❌ Fichier docker-compose.yml introuvable !" -ForegroundColor Red
    Write-Host "💡 Assurez-vous d'être dans le répertoire whisper-service." -ForegroundColor Gray
    exit 1
}

# Arrêter les conteneurs problématiques
Write-Host "🛑 Arrêt des conteneurs whisper-ocr et whisper-documents..." -ForegroundColor Yellow
docker-compose stop whisper-ocr whisper-documents
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Certains conteneurs n'étaient pas en cours d'exécution." -ForegroundColor Yellow
}

# Supprimer les conteneurs pour forcer la recréation
Write-Host "🗑️  Suppression des conteneurs pour recréation..." -ForegroundColor Yellow
docker-compose rm -f whisper-ocr whisper-documents

# Reconstruire et démarrer les conteneurs
Write-Host "🔨 Reconstruction et démarrage des conteneurs..." -ForegroundColor Yellow
Write-Host "   - whisper-ocr-prod (Service OCR)" -ForegroundColor Gray
Write-Host "   - whisper-documents-prod (Service Documents)" -ForegroundColor Gray

try {
    docker-compose up -d --force-recreate whisper-ocr whisper-documents
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Conteneurs démarrés avec succès !" -ForegroundColor Green
    } else {
        throw "Erreur lors du démarrage des conteneurs"
    }
} catch {
    Write-Host "❌ Erreur lors du démarrage des conteneurs : $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Attendre que les services soient prêts
Write-Host "⏳ Attente du démarrage des services (30 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Vérifier le statut des containers
Write-Host "📊 Vérification du statut des services..." -ForegroundColor Yellow
Write-Host ""

$containers = @("whisper-ocr-prod", "whisper-documents-prod")
$allRunning = $true

foreach ($container in $containers) {
    $status = docker ps --filter "name=$container" --format "{{.Names}}\t{{.Status}}"
    if ($status -match $container) {
        Write-Host "✅ $container : En cours d'exécution" -ForegroundColor Green
        Write-Host "   $status" -ForegroundColor Gray
    } else {
        Write-Host "❌ $container : Arrêté ou erreur" -ForegroundColor Red
        $allRunning = $false
        
        # Afficher les logs pour diagnostiquer
        Write-Host "📋 Derniers logs de $container :" -ForegroundColor Yellow
        docker logs --tail 20 $container 2>&1 | Select-Object -Last 10
    }
}

Write-Host ""

if ($allRunning) {
    Write-Host "🎉 Conteneurs Whisper redémarrés avec succès !" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Commandes utiles :" -ForegroundColor Yellow
    Write-Host "   - Voir les logs : docker-compose logs -f whisper-ocr whisper-documents" -ForegroundColor Gray
    Write-Host "   - Statut : docker-compose ps" -ForegroundColor Gray
    Write-Host "   - Redémarrer tous : docker-compose restart" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Certains conteneurs ne sont pas démarrés correctement." -ForegroundColor Yellow
    Write-Host "💡 Vérifiez les logs avec : docker-compose logs whisper-ocr whisper-documents" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🔍 Problèmes courants :" -ForegroundColor Yellow
    Write-Host "   - Dépendances manquantes (tesseract-ocr, pandoc, etc.)" -ForegroundColor Gray
    Write-Host "   - Erreurs dans les fichiers Python" -ForegroundColor Gray
    Write-Host "   - Problèmes de réseau Docker" -ForegroundColor Gray
}

Write-Host ""











