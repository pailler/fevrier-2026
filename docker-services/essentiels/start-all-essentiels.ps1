# Script pour démarrer tous les services essentiels
# Utilise le docker-compose principal pour librespeed, qrcodes, metube, n8n
# (noms de conteneurs cohérents avec Traefik : librespeed-iahome, qrcodes-iahome)
Write-Host "🚀 Démarrage de tous les services essentiels" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Vérifier si Docker est en cours d'exécution
Write-Host "`n1. Vérification de Docker..." -ForegroundColor Yellow
try {
    $dockerStatus = docker info 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Docker est en cours d'exécution" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Docker n'est pas en cours d'exécution" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ Erreur lors de la vérification de Docker" -ForegroundColor Red
    exit 1
}

# Vérifier/créer les réseaux requis
Write-Host "`n2. Vérification des réseaux Docker..." -ForegroundColor Yellow
foreach ($network in @("iahome-network", "iahome_iahome-network")) {
    docker network inspect $network 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Réseau $network trouvé" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Création du réseau $network..." -ForegroundColor Yellow
        docker network create $network
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Réseau $network créé" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Erreur lors de la création de $network" -ForegroundColor Red
            exit 1
        }
    }
}

# Démarrer les services du compose principal (librespeed, qrcodes, metube, n8n)
# Conteneurs : librespeed-iahome, qrcodes-iahome, metube-iahome, n8n-iahome
# Tous avec restart: unless-stopped, compatibles Traefik
Write-Host "`n3. Démarrage des services principaux (LibreSpeed, QR Codes, MeTube, n8n)..." -ForegroundColor Yellow
docker compose -f docker-compose.yml up -d
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Services principaux démarrés" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erreur au démarrage des services principaux" -ForegroundColor Red
}

# Démarrer Stirling PDF (non inclus dans le compose principal)
Write-Host "`n4. Démarrage de Stirling PDF..." -ForegroundColor Yellow
docker compose -f pdf/docker-compose.yml up -d
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ PDF démarré" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erreur PDF" -ForegroundColor Red
}

# Démarrer PsiTransfer (dans essentiels/)
Write-Host "`n5. Démarrage de PsiTransfer..." -ForegroundColor Yellow
docker compose -f ../../essentiels/psitransfer/docker-compose.yml up -d
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ PsiTransfer démarré" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erreur PsiTransfer" -ForegroundColor Red
}

# Vérifier le statut final
Write-Host "`n6. Vérification du statut final..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

try {
    $containers = docker ps --filter name=iahome --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    Write-Host "   📊 Statut des services essentiels:" -ForegroundColor Cyan
    Write-Host $containers -ForegroundColor White
} catch {
    Write-Host "   ⚠️  Erreur lors de la vérification du statut" -ForegroundColor Yellow
}

Write-Host "`n🎯 Tous les services essentiels démarrés !" -ForegroundColor Green
Write-Host "   🌐 LibreSpeed: https://librespeed.iahome.fr" -ForegroundColor Cyan
Write-Host "   📺 MeTube: https://metube.iahome.fr" -ForegroundColor Cyan
Write-Host "   📄 PDF: https://pdf.iahome.fr" -ForegroundColor Cyan
Write-Host "   📁 PsiTransfer: https://psitransfer.iahome.fr" -ForegroundColor Cyan
Write-Host "   📱 QR Codes: https://qrcodes.iahome.fr" -ForegroundColor Cyan
Write-Host "   ⚡ n8n: http://localhost:5678" -ForegroundColor Cyan
